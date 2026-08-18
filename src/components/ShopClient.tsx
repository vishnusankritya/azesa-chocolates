"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

type Filter = "all" | "chocolate" | "cookie" | "pinata" | "hamper";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chocolate", label: "Chocolates" },
  { id: "cookie", label: "Cookies" },
  { id: "pinata", label: "Piñata" },
  { id: "hamper", label: "Hampers" },
];

const PINATA_IDS = ["cookie-pinata", "biscoff", "kunafa-pinata"];

export default function ShopClient({ initialCategory = "all" }: { initialCategory?: string }) {
  const [filter, setFilter] = useState<Filter>(
    initialCategory === "cookies"
      ? "cookie"
      : initialCategory === "chocolates"
        ? "chocolate"
        : initialCategory === "pinata"
          ? "pinata"
          : initialCategory === "hampers"
            ? "hamper"
            : "all"
  );

  const visible = useMemo(() => {
    if (filter === "all") return products;
    if (filter === "pinata") return products.filter((p) => PINATA_IDS.includes(p.id));
    if (filter === "hamper") return products.filter((p) => p.type === "hamper");
    return products.filter((p) => p.type === filter);
  }, [filter]);

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
                onClick={() => setFilter(f.id)}
                variant={filter === f.id ? "dark" : "cream"}
                className={filter === f.id ? "animate-float scale-110" : ""}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}