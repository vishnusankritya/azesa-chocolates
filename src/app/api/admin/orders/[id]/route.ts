import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { orderStatusSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [row] = await serial(() =>
    db
      .update(orders)
      .set({ status: parsed.data.status })
      .where(eq(orders.id, id))
      .returning({ id: orders.id, status: orders.status })
  );

  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(row);
}
