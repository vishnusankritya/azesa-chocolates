import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { createProductSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await serial(() => db.select().from(products).orderBy(products.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid product" }, { status: 400 });
  }
  const b = parsed.data;

  const [row] = await serial(() =>
    db
      .insert(products)
      .values({
        slug: b.slug,
        name: b.name,
        type: b.type,
        price: b.price,
        mrp: b.mrp ?? null,
        accentColor: b.accentColor || null,
        ingredient: b.ingredient ?? null,
        tagline: b.tagline ?? null,
        description: b.description ?? null,
        occasion: b.occasion ?? null,
        contents: b.contents ?? null,
        imageUrl: b.imageUrl ?? null,
        images: b.images ?? null,
        availability: b.availability ?? "available",
        stock: b.stock ?? 0,
      })
      .returning()
  );

  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/shop/[id]", "page");

  return NextResponse.json(row, { status: 201 });
}
