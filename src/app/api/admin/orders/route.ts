import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, customers, addresses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  // PGlite is single-connection WASM — run queries sequentially, not in parallel.
  const items = await db.select().from(orderItems);
  const custs = await db.select().from(customers);
  const addrs = await db.select().from(addresses);

  const data = orderRows.map((o) => ({
    id: o.id,
    amount: o.amount,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentId: o.paymentId,
    createdAt: o.createdAt,
    customer: custs.find((c) => c.id === o.customerId) ?? null,
    address: addrs.find((a) => a.id === o.shippingAddressId) ?? null,
    items: items.filter((i) => i.orderId === o.id),
  }));

  return NextResponse.json(data);
}
