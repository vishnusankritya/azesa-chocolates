"use client";

import Link from "next/link";
import { products } from "@/data/products";
import Button from "@/components/ui/Button";
import AddToCartButton from "@/components/AddToCartButton";

export default function BestsellerCarousel() {
  return (
    <section className="pt-2 pb-8 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff7a00" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="font-heading text-brand-dark" style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}>
              Popular Chocolates &amp; Cookies
            </h2>
          </div>
          <Button href="/shop" className="hidden md:inline-flex">
            View All
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 pb-4">
          {products.filter((p) => p.image && p.type !== "hamper").slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="relative flex-shrink-0 group"
              style={{ width: 140 }}
            >
              <Link href={`/shop/${product.id}`} className="block cursor-pointer">
                <div
                                  className="w-full rounded-2xl mb-2 overflow-hidden"
                                  style={{
                                    height: 140,
                                    border: "2px solid #1c110915",
                                    backgroundColor: "#ffffff",
                                  }}
                                >
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-110"
                                    />
                                  ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ backgroundColor: product.accentColor + "20" }}
                  >
                    <div
                      className="rounded-xl flex flex-col items-center justify-center"
                      style={{ backgroundColor: product.accentColor, width: 92, height: 92 }}
                    >
                      <span className="font-heading text-white text-sm leading-tight text-center px-2">
                        Azesa
                      </span>
                    </div>
                  </div>
                  )}
                </div>
                <p className="font-heading text-brand-dark uppercase tracking-wide leading-tight" style={{ fontSize: 13 }}>
                  {product.name}
                </p>
                <p className="text-brand-dark/40 text-sm mt-0.5">₹{product.price}</p>
              </Link>

              <AddToCartButton
                              id={product.id}
                              label="Add to Cart"
                              compact
                              className="absolute left-1/2 -translate-x-1/2 bottom-[52px] z-10 whitespace-nowrap opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                            />
            </div>
          ))}
        </div>

        <div className="mt-5 md:hidden text-center">
          <Button href="/shop">View All</Button>
        </div>
      </div>
    </section>
  );
}
