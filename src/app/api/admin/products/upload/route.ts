import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB per image
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"]);

/**
 * Upload a product image.
 *
 * - Production: stored on Vercel Blob (BLOB_READ_WRITE_TOKEN) — durable,
 *   CDN-served, survives redeploys, public URL.
 * - Local dev (no token / no Bun env): falls back to writing into
 *   public/products/uploads so the feature works without extra setup.
 *
 * Returns the public URL of the stored image.
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
  const buf = Buffer.from(await file.arrayBuffer());

  // Production path: Vercel Blob (requires BLOB_READ_WRITE_TOKEN in env).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(`product-images/${filename}`, buf, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    return NextResponse.json({ url }, { status: 201 });
  }

  // Local dev fallback (no token): write into the public dir.
  const dir = path.join(process.cwd(), "public", "products", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);
  return NextResponse.json({ url: `/products/uploads/${filename}` }, { status: 201 });
}
