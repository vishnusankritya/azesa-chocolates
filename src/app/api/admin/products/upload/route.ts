import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB raw input
const MAX_DIM = 1024; // longest edge, px
const WEBP_QUALITY = 80;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"]);

/**
 * Upload a product image.
 *
 * 1. Read the raw file.
 * 2. Compress it server-side with sharp:
 *      - rotate()  -> honor EXIF orientation
 *      - resize    -> cap longest edge at 1024px (no upscale)
 *      - webp q80  -> small, web-optimised; animated GIFs pass through untouched
 * 3. Store it where it will actually be READ on the live site:
 *      - Prod (BLOB_READ_WRITE_TOKEN set): Vercel Blob (public/ is read-only on
 *        serverless, so writing to /public silently breaks on Vercel)
 *      - Local dev (no token): public/products/uploads/ as a fast local fallback
 * 4. Return the public URL; the client writes it to the product row.
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

  const raw = Buffer.from(await file.arrayBuffer());

  // ── Compress ────────────────────────────────────────────────────────────
  const isGif = file.type === "image/gif";
  let out: Buffer;
  let kind: "webp" | "gif";
  try {
    if (isGif) {
      // Animated GIF: keep it as-is (webp animation is a different beast).
      out = raw;
      kind = "gif";
    } else {
      out = await sharp(raw)
        .rotate()
        .resize({ width: MAX_DIM, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      kind = "webp";
    }
  } catch {
    // Sharp failed for some reason — fall back to the raw bytes rather than 500.
    out = raw;
    kind = isGif ? "gif" : "webp";
  }

  const safeBase = (file.name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.[a-z0-9]+$/, "") // drop the original extension; we append ours
    .slice(0, 40);
  const filename = `${Date.now()}-${safeBase || "image"}.${kind}`;

  // ── Store ───────────────────────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`product-images/${filename}`, out, {
      access: "public",
      addRandomSuffix: true,
      contentType: kind === "webp" ? "image/webp" : "image/gif",
    });
    return NextResponse.json(
      { url: blob.url, compressed: kind === "webp" && out.byteLength < raw.byteLength, bytes: out.byteLength },
      { status: 201 }
    );
  }

  const dir = path.join(process.cwd(), "public", "products", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), out);
  return NextResponse.json(
    { url: `/products/uploads/${filename}`, compressed: out.byteLength < raw.byteLength, bytes: out.byteLength },
    { status: 201 }
  );
}
