import { NextResponse } from "next/server";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  products as productsTable,
  customers as customersTable,
  addresses as addressesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
} from "@/db/schema";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";
import { checkoutSchema } from "@/lib/validators";
import { serial } from "@/db/mutex";
import { buildUpiLink } from "@/lib/upi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024; // 256kb — reject oversized JSON early

function err(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  // CSRF: reject cross-origin mutating requests.
  if (!isSameOrigin(req)) {
    return err(403, "Cross-origin request rejected");
  }

  // Rate limit the write path per IP.
  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 60_000)) {
    return err(429, "Too many attempts. Please try again shortly.");
  }

  // Body size cap to prevent oversized-JSON DoS.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return err(413, "Request body too large");
  }

  let bodyJson: unknown;
  try {
    bodyJson = raw ? JSON.parse(raw) : null;
  } catch {
    return err(400, "Invalid request body");
  }

  const parsed = checkoutSchema.safeParse(bodyJson);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid checkout data";
    return err(400, msg);
  }
  const { items, customer, address, payment } = parsed.data;

  // Load products from the DB (authoritative prices — never trust the client's totals).
  // Catalog identifiers exposed to the client are slugs ("mango", "rakhi-chaos-hamper").
  const productIds = items.map((i) => i.productId);
  const rows = await serial(() =>
    db.select().from(productsTable).where(inArray(productsTable.slug, productIds))
  );

  const productBySlug = new Map<string, (typeof rows)[number]>();
  for (const row of rows) productBySlug.set(row.slug, row);

  let amount = 0;
  const lineItems: { productId: string; productName: string; unitPrice: number; qty: number }[] = [];
  for (const it of items) {
    const p = productBySlug.get(it.productId);
    if (!p || p.availability !== "available") {
      return err(400, `A product in your cart is not currently available`);
    }
    const qty = Math.max(1, Math.min(99, Math.floor(it.qty)));
    if (p.stock < qty) return err(400, `Only ${p.stock} left of ${p.name}`);
    amount += p.price * qty;
    lineItems.push({
      productId: p.id,
      productName: p.name,
      unitPrice: p.price,
      qty,
    });
  }
  if (amount <= 0) return err(400, "Invalid order total");

  if (payment === "online" && !isRazorpayConfigured()) {
    return err(503, "Online payment isn't enabled yet — please use UPI Scan & Pay.");
  }

  let result: { orderId: string; razorpayOrderId: string | null } | undefined;

  await serial(() =>
    db.transaction(async (tx) => {
    // Find or create the customer by phone.
    let [cust] = await tx
      .select()
      .from(customersTable)
      .where(eq(customersTable.phone, customer!.phone!.trim()))
      .limit(1);
    if (!cust) {
      [cust] = await tx
        .insert(customersTable)
        .values({
          name: customer!.name!.trim(),
          phone: customer!.phone!.trim(),
          email: customer!.email?.trim() || null,
        })
        .returning();
    }

    const [addr] = await tx
      .insert(addressesTable)
      .values({
        customerId: cust.id,
        line1: address!.address!.trim(),
        landmark: address!.landmark?.trim() || null,
        city: address!.city!.trim(),
        state: address!.state!.trim(),
        pincode: address!.pincode!.trim(),
      })
      .returning();

    const [order] = await tx
      .insert(ordersTable)
      .values({
        customerId: cust.id,
        status: "pending",
        paymentMethod: payment,
        amount,
        shippingAddressId: addr.id,
      })
      .returning();

    await tx.insert(orderItemsTable).values(
      lineItems.map((li) => ({ orderId: order.id, ...li }))
    );

    // Decrement stock for each ordered item.
    for (const li of lineItems) {
      await tx
        .update(productsTable)
        .set({ stock: sql`${productsTable.stock} - ${li.qty}` })
        .where(eq(productsTable.id, li.productId));
    }

    if (payment === "online" && isRazorpayConfigured()) {
      // Build a product snapshot for the Razorpay receipt (truncated).
      const rp = await createRazorpayOrder({ amount, receipt: order.id });
      await tx.insert(paymentsTable).values({
        orderId: order.id,
        razorpayOrderId: rp.id,
        status: "created",
        amount,
        raw: rp,
      });
      result = { orderId: order.id, razorpayOrderId: rp.id };
    } else {
      await tx.insert(paymentsTable).values({
        orderId: order.id,
        status: payment === "upi_qr" ? "upi_pending" : "created",
        amount,
      });
      result = { orderId: order.id, razorpayOrderId: null };
    }
    })
  );

  return NextResponse.json(
    {
      orderId: result!.orderId,
      amount,
      paymentMethod: payment,
      razorpayOrderId: result!.razorpayOrderId,
      status: "pending",
      ...(payment === "upi_qr"
        ? {
            upiLink: buildUpiLink({
              amount,
              note: `Order ${result!.orderId.slice(0, 8).toUpperCase()} · ${customer!.name
                .trim()
                .split(/\s+/)[0]} · ${lineItems
                .map((li) => `${li.qty}x ${li.productName}`)
                .join(", ")}`,
            }),
          }
        : {}),
    },
    { status: 201 }
  );
}
