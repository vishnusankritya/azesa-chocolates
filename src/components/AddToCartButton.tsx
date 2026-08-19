"use client";

import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import QtyStepper from "@/components/QtyStepper";

export default function AddToCartButton({
  id,
  label = "Add to Cart",
  compact = false,
  className = "",
}: {
  id: string;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const { items, add, setQty } = useCart();
  const item = items.find((i) => i.id === id);

  if (compact) {
    const container = `flex items-center gap-1 rounded-full border-2 border-brand-dark bg-brand-cream px-1.5 py-1 font-heading text-[10px] uppercase tracking-wide shadow-[2px_2px_0_0_#1c1109] whitespace-nowrap ${className}`;

    if (!item) {
      return (
        <button
          type="button"
          onClick={() => add(id)}
          className={`${container} cursor-pointer px-3 py-1.5 text-brand-dark hover:bg-brand-dark hover:text-brand-cream`}
        >
          {label}
        </button>
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
