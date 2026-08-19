import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { orders, orderItems, customers, addresses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // PGlite is single-connection WASM — serialize the whole fetch as one unit.
  const [orderRows, items, custs, addrs] = await serial(async () => {
    const o = await db.select().from(orders).orderBy(asc(orders.createdAt));
    const i = await db.select().from(orderItems);
    const c = await db.select().from(customers);
    const a = await db.select().from(addresses);
    return [o, i, c, a] as const;
  });

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
