import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments as paymentsTable, orders as ordersTable } from "@/db/schema";
import { isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook. Verifies the HMAC signature, then marks the order paid on
 * `payment.captured`. Returns 501 until RAZORPAY keys are configured in env.
 */
export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "razorpay not configured" }, { status: 501 });
  }

  const signature = req.headers.get("x-razorpay-signature") || "";
  const raw = await req.text();
  if (!verifyRazorpaySignature(process.env.RAZORPAY_KEY_SECRET!, raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (event?.event === "payment.captured") {
    const entity = event?.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id;
    const razorpayPaymentId = entity?.id;
    if (razorpayOrderId && razorpayPaymentId) {
      const [pay] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.razorpayOrderId, razorpayOrderId))
        .limit(1);
      if (pay) {
        await db
          .update(paymentsTable)
          .set({ status: "captured", razorpayPaymentId, raw: event })
          .where(eq(paymentsTable.id, pay.id));
        await db
          .update(ordersTable)
          .set({ status: "paid", paymentId: razorpayPaymentId, paymentMethod: "online" })
          .where(eq(ordersTable.id, pay.orderId));
      }
    }
  }

  return NextResponse.json({ received: true });
}
