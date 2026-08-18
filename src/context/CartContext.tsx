"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "@/data/products";

export interface CartItem {
  id: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "azesa-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        // ignore corrupted storage
      }
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / unavailable — cart just won't persist
    }
  }, [items, mounted]);

  const add = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      return found
        ? prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { id, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + (products.find((p) => p.id === i.id)?.price ?? 0) * i.qty,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, subtotal, add, remove, setQty }),
    [items, count, subtotal, add, remove, setQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}