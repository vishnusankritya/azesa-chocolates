"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-3 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1c1109]">
      <Link href={`/shop/${product.id}`} className="flex flex-col">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
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
        </div>
        <div className="mt-3 border-t border-brand-dark/15 pb-1 pt-3">
          <p className="font-heading text-center text-base font-black leading-tight text-brand-dark md:text-lg">
            {product.name}
          </p>
          <p className="mt-0.5 text-center text-sm font-semibold text-brand-dark/45">₹{product.price}</p>
        </div>
      </Link>
      <div className="mt-auto flex justify-center pt-1">
        <AddToCartButton id={product.id} label="Add to Cart" compact />
      </div>
    </div>
  );
}