"use client";

import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <div className="group flex flex-col rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-2.5 transition-transform duration-200 hover:scale-[1.04] hover:shadow-[5px_5px_0_0_#1c1109]">
      <Link href={`/shop/${product.id}`} className="flex flex-col">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center"
              style={{ backgroundColor: product.accentColor + "20" }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ backgroundColor: product.accentColor, width: 92, height: 92 }}
              >
                <span className="px-2 text-center font-heading text-sm text-white">Azesa</span>
              </div>
            </div>
          )}
          {product.availability && product.availability !== "available" && (
            <span className="absolute left-2 top-2 rounded-full border-2 border-brand-dark bg-brand-dark px-2.5 py-1 font-heading text-[10px] font-black uppercase tracking-wide text-brand-cream">
              {product.availability === "out_of_stock" ? "Out of stock" : "Coming soon"}
            </span>
          )}
        </div>
        <div className="mt-3 border-t border-brand-dark/15 pb-1 pt-3">
          <p className="font-heading text-center text-sm font-black leading-tight text-brand-dark md:text-base">
            {product.name}
          </p>
          <p className="mt-0.5 text-center text-sm font-semibold text-brand-dark/45">₹{product.price}</p>
        </div>
      </Link>
      <div className="mt-auto flex justify-center pt-1">
        <AddToCartButton id={product.id} label="Add to Cart" compact availability={product.availability} />
      </div>
    </div>
  );
}