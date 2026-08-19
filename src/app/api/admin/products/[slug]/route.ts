import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { updateProductSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!requireAdmin(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const patch = parsed.data;
  const [row] = await serial(() =>
    db.update(products).set(patch).where(eq(products.slug, slug)).returning()
  );

  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // On-demand revalidation so storefront pages reflect edits immediately.
  revalidatePaths();

  return NextResponse.json(row);
}

function revalidatePaths() {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/shop/[id]", "page");
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!requireAdmin(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  await serial(() => db.delete(products).where(eq(products.slug, slug)));
  revalidatePaths();
  return NextResponse.json({ ok: true });
}
