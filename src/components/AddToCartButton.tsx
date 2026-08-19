"use client";

import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import QtyStepper from "@/components/QtyStepper";
import Link from "next/link";

export default function AddToCartButton({
  id,
  label = "Add to Cart",
  compact = false,
  className = "",
  availability = "available",
}: {
  id: string;
  label?: string;
  compact?: boolean;
  className?: string;
  availability?: "available" | "out_of_stock" | "coming_soon" | "hidden";
}) {
  const { items, add, setQty } = useCart();

  // Not purchasable: render a static status pill instead of any button/stepper.
  if (availability !== "available") {
    const text =
      availability === "out_of_stock"
        ? "Out of stock"
        : availability === "coming_soon"
        ? "Coming soon"
        : "Unavailable";
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border-2 border-brand-dark/25 bg-white px-3 py-1.5 font-heading text-[11px] font-black uppercase tracking-wide text-brand-dark/45 ${className}`}
      >
        {text}
      </span>
    );
  }

  const item = items.find((i) => i.id === id);

  if (compact) {
    if (!item) {
      // "Add to Cart" pill revealed on card hover (desktop); always visible on
      // mobile (no hover). Clicking adds the item to the cart.
      return (
        <button
          type="button"
          onClick={() => add(id)}
          className={`${className} inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-brand-dark bg-brand-cream px-3.5 py-2 font-heading text-[11px] font-black uppercase tracking-wide text-brand-dark shadow-[2px_2px_0_0_#1c1109] transition-all duration-200 hover:bg-brand-dark hover:text-brand-cream md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100`}
        >
          {label}
        </button>
      );
    }

    // In-cart compact state: a − / qty / + item counter with a cart icon button
    // beside it that routes to the cart.
    const stepBtn =
      "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full font-heading text-lg font-black leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream";
    return (
      <div className={`${className} inline-flex items-center gap-1 rounded-full border-2 border-brand-dark bg-brand-cream p-1 font-heading text-[10px] uppercase tracking-wide shadow-[2px_2px_0_0_#1c1109]`}>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty(id, item.qty - 1)}
          className={stepBtn}
        >
          −
        </button>
        <span aria-live="polite" className="w-7 text-center font-heading text-base font-black text-brand-dark">
          {item.qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => add(id)}
          className={stepBtn}
        >
          +
        </button>
        <Link
          href="/cart"
          aria-label="View cart"
          className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-brand-dark text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <Button variant="cream" onClick={() => add(id)} className={className}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QtyStepper qty={item.qty} onDec={() => setQty(id, item.qty - 1)} onInc={() => add(id)} />
      <Button href="/cart">Go to cart</Button>
    </div>
  );
}
