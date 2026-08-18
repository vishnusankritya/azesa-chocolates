import { NextResponse } from "next/server";
import { getProducts } from "@/server/catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const list = await getProducts();
  const filtered = type ? list.filter((p) => p.type === type) : list;
  return NextResponse.json(filtered);
}
