"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/lib/useProducts";
import QtyStepper from "@/components/QtyStepper";
import Button from "@/components/ui/Button";

export default function CartClient() {
  const { items, count, subtotal, add, setQty, remove, clear } = useCart();
  const products = useProducts();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "upi" as "upi" | "card" | "cod",
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaced(true);
  };

  const handleDone = () => {
    setCheckoutOpen(false);
    setPlaced(false);
    setForm((f) => ({ ...f, name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "" }));
    clear();
  };

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
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-brand-dark text-xl leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
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
            <Button className="mt-6 w-full justify-center" onClick={() => setCheckoutOpen(true)}>
              Checkout · ₹{subtotal}
            </Button>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-dark/50">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              Free shipping on all orders
            </p>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#1c1109]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && !placed && setCheckoutOpen(false)}
        >
          <div className="w-full max-w-lg rounded-3xl border-2 border-brand-dark bg-brand-cream p-7 shadow-[6px_6px_0_0_#1c1109] md:p-9">
            {placed ? (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-dark bg-brand-yellow">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1c1109" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="mt-6 font-heading text-3xl font-black text-brand-dark">Order placed!</h2>
                <p className="mt-3 text-brand-dark/70">
                  Thank you, {form.name || "chocolate lover"}. A confirmation has been sent to{" "}
                  <span className="font-semibold text-brand-dark">{form.phone || form.email || "your contact"}</span>.
                  <br />
                  We&apos;ll deliver {count} {count === 1 ? "item" : "items"} to {form.address || "your address"}{" "}
                  {form.city ? `, ${form.city}` : ""}.
                </p>
                <div className="mt-6 rounded-2xl border border-brand-dark/15 bg-white p-4 text-left">
                  <div className="flex justify-between text-brand-dark/70"><span>Total paid</span><span className="font-heading text-brand-dark">₹{subtotal}</span></div>
                  <div className="mt-1 flex justify-between text-brand-dark/70"><span>Payment</span><span className="font-heading uppercase text-brand-dark">{form.payment === "cod" ? "Cash on Delivery" : form.payment === "card" ? "Card" : "UPI"}</span></div>
                </div>
                <Button className="mt-7 w-full justify-center" onClick={handleDone}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">Secure checkout</p>
                    <h2 id="checkout-title" className="mt-1 font-heading text-2xl font-black text-brand-dark md:text-3xl">
                      Almost there
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close checkout"
                    onClick={() => setCheckoutOpen(false)}
                    className="cursor-pointer rounded-full border-2 border-brand-dark px-2.5 text-xl leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="mt-6 space-y-5">
                  <fieldset className="space-y-3">
                    <legend className="mb-1 font-heading text-sm font-black uppercase tracking-wide text-brand-dark">Contact</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input required value={form.name} onChange={set("name")} placeholder="Full name" className="input" />
                      <input required value={form.phone} onChange={set("phone")} type="tel" placeholder="Phone" className="input" />
                    </div>
                    <input value={form.email} onChange={set("email")} type="email" placeholder="Email (optional)" className="input" />
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="mb-1 font-heading text-sm font-black uppercase tracking-wide text-brand-dark">Delivery address</legend>
                    <input required value={form.address} onChange={set("address")} placeholder="Flat / house no., street, area" className="input" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input required value={form.city} onChange={set("city")} placeholder="City" className="input" />
                      <input required value={form.state} onChange={set("state")} placeholder="State" className="input" />
                      <input required value={form.pincode} onChange={set("pincode")} inputMode="numeric" placeholder="PIN" className="input" />
                    </div>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="mb-1 font-heading text-sm font-black uppercase tracking-wide text-brand-dark">Payment</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        ["upi", "UPI"],
                        ["card", "Card"],
                        ["cod", "Cash on Delivery"],
                      ] as const).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, payment: val }))}
                          className={`cursor-pointer rounded-xl border-2 px-3 py-2 font-heading text-xs font-black uppercase tracking-wide transition-colors ${
                            form.payment === val
                              ? "border-brand-dark bg-brand-dark text-brand-cream"
                              : "border-brand-dark/25 bg-white text-brand-dark hover:border-brand-dark"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {form.payment === "upi" && (
                      <input value={form.upiId} onChange={set("upiId")} placeholder="UPI ID (e.g. name@upi)" className="input" />
                    )}
                    {form.payment === "card" && (
                      <div className="space-y-3">
                        <input value={form.cardNumber} onChange={set("cardNumber")} inputMode="numeric" placeholder="Card number" className="input" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={form.cardExpiry} onChange={set("cardExpiry")} placeholder="MM / YY" className="input" />
                          <input value={form.cardCvv} onChange={set("cardCvv")} inputMode="numeric" placeholder="CVV" className="input" />
                        </div>
                      </div>
                    )}
                    {form.payment === "cod" && (
                      <p className="rounded-xl bg-white px-3 py-2 text-sm text-brand-dark/70">
                        Pay ₹{subtotal} when your order arrives. Small convenience fee may apply.
                      </p>
                    )}
                  </fieldset>

                  <div className="my-4 h-px bg-brand-dark/15" />
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-brand-dark">Total</span>
                    <span className="font-heading text-2xl font-black text-brand-dark">₹{subtotal}</span>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 w-full cursor-pointer rounded-full border-2 border-brand-dark bg-brand-cream px-6 py-3.5 font-heading text-base font-black uppercase tracking-wide text-brand-dark shadow-[3px_3px_0_0_#1c1109] transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-brand-dark hover:text-brand-cream hover:shadow-none"
                  >
                    Place order · ₹{subtotal}
                  </button>
                  <p className="text-center text-[11px] font-semibold text-brand-dark/45">
                    Demo checkout — connect a payment gateway to go live. Nothing is charged.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}