"use client";

import { useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

const PAGE_SIZE = 8;

type Filter = "all" | "chocolate" | "cookie" | "pinata" | "hamper" | "bestseller";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chocolate", label: "Chocolates" },
  { id: "cookie", label: "Cookies" },
  { id: "pinata", label: "Piñata" },
  { id: "hamper", label: "Hampers" },
  { id: "bestseller", label: "Bestsellers" },
];

const PINATA_IDS = ["cookie-pinata", "biscoff", "kunafa-pinata"];

const BESTSELLER_IDS = ["biscoff", "cookie-pinata", "mango", "choc-chip", "cookie-cream", "holi-edition-white"];

export default function ShopClient({
  products,
  initialCategory = "all",
}: {
  products: CatalogProduct[];
  initialCategory?: string;
}) {
  const [filter, setFilter] = useState<Filter>(
    initialCategory === "cookies"
      ? "cookie"
      : initialCategory === "chocolates"
        ? "chocolate"
        : initialCategory === "pinata"
          ? "pinata"
          : initialCategory === "hampers"
            ? "hamper"
            : initialCategory === "bestsellers"
              ? "bestseller"
              : "all"
  );
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    if (filter === "all") return products;
    if (filter === "bestseller") return products.filter((p) => BESTSELLER_IDS.includes(p.id));
    if (filter === "pinata") return products.filter((p) => PINATA_IDS.includes(p.id));
    if (filter === "hamper") return products.filter((p) => p.type === "hamper");
    return products.filter((p) => p.type === filter);
  }, [filter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(visible.length / PAGE_SIZE)), [visible]);
  const pageItems = useMemo(() => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [visible, page]);

  const selectFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 flex flex-col gap-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
                The Azesa Range
              </p>
              <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
                Chocolate worth every bite
              </h1>
              <p className="mt-3 max-w-md text-brand-dark/60">
                Handcrafted chocolates &amp; cookies from Katihar, Bihar. No palm oil, no artificial
                colours — just real ingredients.
              </p>
            </div>
            <span className="mb-1 hidden font-heading text-sm font-black uppercase tracking-[0.1em] text-[#9a4600] md:inline-block">
              {visible.length} products
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {FILTERS.map((f) => (
              <Button
                key={f.id}
                arrow={false}
                onClick={() => selectFilter(f.id)}
                variant={filter === f.id ? "dark" : "cream"}
                className={filter === f.id ? "animate-float scale-110" : ""}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-dark bg-brand-cream font-heading text-lg font-black text-brand-dark shadow-[2px_2px_0_0_#1c1109] transition-all hover:bg-brand-dark hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              −
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={page === n ? "page" : undefined}
                className={`flex h-10 min-w-10 items-center justify-center rounded-full border-2 border-brand-dark px-3 font-heading text-sm font-black uppercase tracking-wide transition-all ${
                  page === n
                    ? "bg-brand-dark text-brand-cream scale-110"
                    : "bg-brand-cream text-brand-dark hover:bg-brand-dark hover:text-brand-cream"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-dark bg-brand-cream font-heading text-lg font-black text-brand-dark shadow-[2px_2px_0_0_#1c1109] transition-all hover:bg-brand-dark hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              +
            </button>
          </div>
        )}
      </div>
    </section>
  );
}