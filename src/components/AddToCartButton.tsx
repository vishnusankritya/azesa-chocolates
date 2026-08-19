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
    const container = `flex items-center gap-1 rounded-full border-2 border-brand-dark bg-brand-cream px-1.5 py-1 font-heading text-[10px] uppercase tracking-wide shadow-[2px_2px_0_0_#1c1109] whitespace-nowrap ${className}`;

    if (!item) {
      // Compact card CTA: a small round cart-icon link that routes to the cart
      // (no add-from-card action). Once the product is in the cart the card
      // swaps to the −/qty/+ item counter below.
      return (
        <Link
          href="/cart"
          aria-label="View cart"
          className="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-brand-dark bg-brand-cream p-2 text-brand-dark shadow-[2px_2px_0_0_#1c1109] transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </Link>
      );
    }

    // In-cart compact state: a clean, centered − / qty / + stepper on the card.
    // (The "Go to Cart" pill lives on the product page / cart, not the card —
    // it crowded the narrow card against the tiny round buttons.)
    return (
      <div className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-dark bg-brand-cream px-1.5 py-1 shadow-[2px_2px_0_0_#1c1109]">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty(id, item.qty - 1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-heading text-lg font-black leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          −
        </button>
        <span className="w-8 text-center font-heading text-base font-black text-brand-dark">
          {item.qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => add(id)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-heading text-lg font-black leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          +
        </button>
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
