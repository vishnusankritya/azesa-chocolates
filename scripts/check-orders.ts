import { db } from "../src/db";
import { orders, orderItems, customers, payments } from "../src/db/schema";

async function main() {
  const o = await db.select().from(orders);
  const oi = await db.select().from(orderItems);
  const c = await db.select().from(customers);
  const p = await db.select().from(payments);
  console.log("orders:", o.length, "| items:", oi.length, "| customers:", c.length, "| payments:", p.length);
  const last = o[o.length - 1];
  console.log("last order:", JSON.stringify({ id: last.id, amount: last.amount, method: last.paymentMethod, status: last.status }));
  console.log("last items:", oi.map((i) => ({ name: i.productName, qty: i.qty, price: i.unitPrice })));
  console.log("last payment status:", p[p.length - 1]?.status);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
