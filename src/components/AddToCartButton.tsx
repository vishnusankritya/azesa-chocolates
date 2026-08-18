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
    const circle =
      "flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-dark text-xs font-black leading-none transition-colors";

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

    return (
      <div className={container}>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty(id, item.qty - 1)}
          className={`${circle} text-brand-dark hover:bg-brand-dark hover:text-brand-cream`}
        >
          −
        </button>
        <span className="w-5 text-center text-[11px] text-brand-dark">{item.qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => add(id)}
          className={`${circle} text-brand-dark hover:bg-brand-dark hover:text-brand-cream`}
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
    <QtyStepper qty={item.qty} onDec={() => setQty(id, item.qty - 1)} onInc={() => add(id)} />
  );
}