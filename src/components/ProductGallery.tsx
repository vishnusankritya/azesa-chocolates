"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Product image gallery. Shows the primary image (first in the product's
 * images array) in a large frame, with thumbnails below. Clicking a thumbnail
 * swaps the large image. Falls back to a single image if the product only has
 * one.
 */
export default function ProductGallery({
  src,
  images,
  alt,
}: {
  src?: string | null;
  images?: string[] | null;
  alt: string;
}) {
  // Primary = src, or first item of images.
  const all = images?.length ? images : src ? [src] : [];
  const [active, setActive] = useState(0);
  const current = all[Math.min(active, Math.max(all.length - 1, 0))];

  if (!current) return null;

  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-brand-dark bg-white shadow-[6px_6px_0_0_#1c1109]">
        <Image
          src={current}
          alt={alt}
          width={800}
          height={800}
          priority={active === 0}
          className="h-full w-full object-contain p-4 md:p-8"
        />
      </div>

      {all.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {all.map((img, i) => (
            <button
              key={img + i}
              type="button"
              aria-label={`View image ${i + 1} of ${all.length}`}
              onClick={() => setActive(i)}
              className={`h-16 w-16 cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-1 transition-colors ${
                i === active ? "border-brand-dark" : "border-brand-dark/20 hover:border-brand-dark/60"
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
