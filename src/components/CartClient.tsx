"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import QtyStepper from "@/components/QtyStepper";
import Button from "@/components/ui/Button";

export default function CartClient() {
  const { items, count, subtotal, add, setQty, remove } = useCart();

  const rows = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? [{ item, product }] : [];
  });

  if (rows.length === 0) {
    return (
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] shadow-[4px_4px_0_0_#1c1109]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1c1109" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <p className="mb-2 mt-8 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
            Your basket
          </p>
          <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
            Your cart is empty
          </h1>
          <p className="mt-4 text-brand-dark/60">
            Looks like you haven&apos;t added anything yet. Go grab some handcrafted goodness.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/shop">Browse products</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
              Your basket
            </p>
            <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
              Cart
            </h1>
          </div>
          <span className="mb-1 hidden font-heading text-sm font-black uppercase tracking-[0.1em] text-[#9a4600] md:inline-block">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            {rows.map(({ item, product }) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-4"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/shop/${product.id}`}
                    className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-brand-dark bg-white"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/shop/${product.id}`}
                      className="font-heading text-lg leading-tight text-brand-dark transition-colors hover:text-brand-orange"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-brand-dark/45">
                      ₹{product.price} each
                    </p>
                  </div>

                  <QtyStepper
                    qty={item.qty}
                    onDec={() => setQty(item.id, item.qty - 1)}
                    onInc={() => add(item.id)}
                  />

                  <div className="hidden w-24 text-right font-heading text-lg text-brand-dark sm:block">
                    ₹{product.price * item.qty}
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from cart`}
                    onClick={() => remove(item.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-dark text-xl leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <Link
              href="/shop"
              className="mt-2 inline-flex w-fit items-center gap-2 font-heading text-sm font-black uppercase tracking-[0.12em] text-[#9a4600] transition-colors hover:text-brand-orange"
            >
              ← Continue shopping
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-6 shadow-[4px_4px_0_0_#1c1109] lg:sticky lg:top-28">
            <h2 className="font-heading text-2xl font-black text-brand-dark">Order summary</h2>
            <div className="mt-5 space-y-3 text-brand-dark/70">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-heading text-brand-dark">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-heading text-[#16a34a]">FREE</span>
              </div>
              <div className="my-4 h-px bg-brand-dark/15" />
              <div className="flex items-center justify-between text-lg">
                <span className="font-heading text-brand-dark">Total</span>
                <span className="font-heading text-brand-dark">₹{subtotal}</span>
              </div>
            </div>
            <Button className="mt-6 w-full justify-center">Checkout</Button>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-dark/50">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              Free shipping on all orders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}