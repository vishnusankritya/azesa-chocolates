import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB per image
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"]);

/**
 * Upload a product image to public/products/uploads (local dev).
 * NOTE: Vercel serverless /public is read-only at runtime — for a deployed app
 * this must move to blob storage (e.g. Vercel Blob / S3). Fine for local dev.
 */
export async function POST(req: Request) {
  if (!requireAdmin(req) || !isSameOrigin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!rateLimit(`upload:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 413 });
  }

  const safeBase = (file.name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.[a-z0-9]+$/, "") // drop the original extension; we append ours
    .slice(0, 40);
  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  const filename = `${Date.now()}-${safeBase || "image"}.${extMap[file.type] || "png"}`;
  const dir = path.join(process.cwd(), "public", "products", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);

  return NextResponse.json({ url: `/products/uploads/${filename}` }, { status: 201 });
}
