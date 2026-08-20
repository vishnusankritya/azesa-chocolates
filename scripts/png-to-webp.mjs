// Convert all product/hero PNGs to WebP (q82). Replaces the src path in-place:
// /rakhi-hamper.png -> /rakhi-hamper.webp, /products/x.png -> /products/x.webp
// Originals stay (git-tracked) so a rollback is a one-line revert.
import sharp from "sharp";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";

const ROOT = process.cwd();
const targets = [
  "public/rakhi-hamper.png",
  "public/rakhi-characters.png",
  "public/azejaman.png",
  ...readdirSync("public/products")
    .filter((f) => f.endsWith(".png"))
    .map((f) => `public/products/${f}`),
];

let totalBefore = 0;
let totalAfter = 0;

for (const p of targets) {
  if (!existsSync(p)) { console.log(`skip (missing): ${p}`); continue; }
  const before = statSync(p).size;
  const out = p.replace(/\.png$/, ".webp");
  const buf = await sharp(p, { density: 300 })
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  writeFileSync(out, buf);
  const after = buf.length;
  totalBefore += before;
  totalAfter += after;
  const pct = (100 - (after / before) * 100).toFixed(0);
  console.log(`${(before / 1024).toFixed(0)}→${(after / 1024).toFixed(0)} KiB (-${pct}%)  ${p}`);
}

console.log(`\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% smaller)`);