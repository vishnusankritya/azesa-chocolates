import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(products).orderBy(products.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    slug?: string;
    name?: string;
    type?: string;
    price?: number;
    mrp?: number;
    accentColor?: string;
    ingredient?: string;
    tagline?: string;
    occasion?: string;
    contents?: string[];
    imageUrl?: string;
    active?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body?.slug?.trim() || !body?.name?.trim() || !body?.type || typeof body.price !== "number") {
    return NextResponse.json({ error: "slug, name, type and price are required" }, { status: 400 });
  }

  const [row] = await db
    .insert(products)
    .values({
      slug: body.slug.trim(),
      name: body.name.trim(),
      type: body.type,
      price: Math.round(body.price),
      mrp: typeof body.mrp === "number" ? Math.round(body.mrp) : null,
      accentColor: body.accentColor || null,
      ingredient: body.ingredient || null,
      tagline: body.tagline || null,
      occasion: body.occasion || null,
      contents: body.contents ?? null,
      imageUrl: body.imageUrl || null,
      active: body.active ?? true,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
