"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

export default function Nav() {
  const { count } = useCart();

  return (
    <header className="w-full bg-brand-cream rounded-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none">
          <span className="flex items-center gap-1">
            <span className="font-script text-3xl text-brand-dark">Azesa</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          </span>
          <span className="text-[10px] font-semibold text-brand-dark/40 uppercase tracking-[0.25em] pl-0.5">
            Chocolates
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm font-extrabold text-brand-dark hover:text-brand-orange transition-colors">
            Products
          </Link>
          <Link href="/our-story" className="text-sm font-extrabold text-brand-dark hover:text-brand-orange transition-colors">
            Our Story
          </Link>
          <Link href="/for-business" className="text-sm font-extrabold text-brand-dark hover:text-brand-orange transition-colors">
            For Business
          </Link>
          <Link href="/contact" className="text-sm font-extrabold text-brand-dark hover:text-brand-orange transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative p-2 text-brand-dark hover:text-brand-orange transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-brand-cream bg-brand-orange px-1 font-heading text-[10px] font-black leading-none text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <Button href="/shop" className="hidden md:inline-flex">
            Order Now
          </Button>
        </div>
      </div>
    </header>
  );
}