"use client";

import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

let cache: CatalogProduct[] | null = null;
let inflight: Promise<CatalogProduct[]> | null = null;

/** Client-side catalog loader. Fetches /api/products once and caches it. */
export function useProducts(): CatalogProduct[] {
  const [products, setProducts] = useState<CatalogProduct[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = fetch("/api/products")
        .then((r) => {
          if (!r.ok) throw new Error("products fetch failed");
          return r.json() as Promise<CatalogProduct[]>;
        })
        .then((list) => {
          cache = list;
          return list;
        })
        .catch((e) => {
          inflight = null;
          throw e;
        });
    }
    inflight.then((list) => setProducts(list)).catch(() => {});
  }, []);

  return products;
}
