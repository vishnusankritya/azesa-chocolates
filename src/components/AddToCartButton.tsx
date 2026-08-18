"use client";

import Link from "next/link";
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
          className={`${container} px-3 py-1.5 text-brand-dark hover:bg-brand-dark hover:text-brand-cream`}
        >
          {label}
        </button>
      );
    }

    // In-cart compact state: an increment (+) button plus a "Go to Cart" button.
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => add(id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-dark bg-brand-cream text-base font-black leading-none text-brand-dark shadow-[2px_2px_0_0_#1c1109] transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          +
        </button>
        <Link
          href="/cart"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-brand-dark bg-brand-dark py-[5px] pl-1.5 pr-3 font-heading text-[11px] font-black uppercase tracking-wide text-brand-cream shadow-[2px_2px_0_0_#1c1109] transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-black text-brand-dark">
            {item.qty}
          </span>
          <span>Go to Cart</span>
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
