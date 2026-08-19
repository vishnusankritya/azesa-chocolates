"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/lib/useProducts";

const HAMPER_PAGE = "/shop/rakhi-chaos-hamper";

const HAMper_POSTER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBV4c5Fp5bV1QgRaL1hcZcZOfguwDrRuRI_MpS7YfFApCPvDi8JZ5G1KtpAOUJ_ajRQtyRrkb4gsFf3ySNo0aLuxYboKGNhgwMryllwNxPYAsJWe5O3DkcMYfw8CdT8laXiltRX9Xj1bkYzI8VVNan708JLiThk3dDsL2VGU8omj8MRCpUpjogOxUx_keqbo6SPLcdP3I5qKyogMxd1Lj-1R6M2R0G2KJFT1IwIOWj1g7Q9vr9Hh5mBdA";
const HAMper_SHOWCASE = "/hamper-showcase.jpg";
const SIBLINGS =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBrJusmMJsa7xaU0Bjp2g8nYF7YA3_SCJq6-LTTR7Clo-L7fINFOBirL5yn71BlolAZ-VHGPJ1nYQUTPNJFJe343GjS_9yH7FLdAbyscZLFfaMFEE7VJV3q9LfElOB8CBgjtWoSyRcVCxhT-29bi8PV3i5SxvJF6IQml1VQP2rbdEypNoA5VuuFgxA3fl8hBOJA9jYPPk2AgsK6SrdlFc2Ymbe-YereHLLxeCeO1jaBsjCw75GxhjPGoXyEQWHECKHryj8";
const CHARACTERS = "/rakhi-characters.png";

export default function RakhiHamperHero() {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { add } = useCart();
  const router = useRouter();
  const HAMPER = useProducts().find((p) => p.id === "rakhi-chaos-hamper");

  const handlePreOrder = () => {
    if (HAMPER) add(HAMPER.id, quantity);
    router.push("/cart");
  };

  return (
    <>
      <section id="rakhi-hamper" className="relative isolate z-10 min-h-[760px] scroll-mt-24 rounded-t-none rounded-b-[1.25rem] bg-[#fcf9f1] md:min-h-[800px]">
        {/* Playful decorations */}
        <div className="pointer-events-none absolute right-[26%] -top-14 text-5xl text-[#9a4600] drop-shadow-sm md:text-6xl" aria-hidden>
          ϟ
        </div>
        <div className="pointer-events-none absolute bottom-[9%] left-[22%] text-4xl text-[#9a4600]" aria-hidden>
          ♥
        </div>

        {/* Twinkling star particles throughout the background — float + twinkle */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-[12%] top-[18%] animate-float">
            <span className="block text-xl text-[#ffcb09] animate-twinkle">★</span>
          </div>
          <div className="absolute left-[38%] top-[10%] animate-float" style={{ animationDelay: "0.7s" }}>
            <span className="block text-sm text-white/80 animate-twinkle" style={{ animationDelay: "0.7s" }}>✦</span>
          </div>
          <div className="absolute right-[38%] bottom-[16%] animate-float" style={{ animationDelay: "1.2s" }}>
            <span className="block text-lg text-[#ffcb09] animate-twinkle" style={{ animationDelay: "1.2s" }}>✦</span>
          </div>
          <div className="absolute left-[6%] bottom-[24%] animate-float" style={{ animationDelay: "1.8s" }}>
            <span className="block text-base text-[#f47920] animate-twinkle" style={{ animationDelay: "1.8s" }}>✧</span>
          </div>
          <div className="absolute right-[12%] top-[30%] animate-float" style={{ animationDelay: "0.4s" }}>
            <span className="block text-sm text-white/70 animate-twinkle" style={{ animationDelay: "0.4s" }}>✦</span>
          </div>
          <div className="absolute left-[28%] bottom-[6%] animate-float" style={{ animationDelay: "2.2s" }}>
            <span className="block text-xs text-[#ffcb09]/80 animate-twinkle" style={{ animationDelay: "2.2s" }}>★</span>
          </div>
          <div className="absolute right-[46%] top-[20%] animate-float" style={{ animationDelay: "1.5s" }}>
            <span className="block text-base text-white/60 animate-twinkle" style={{ animationDelay: "1.5s" }}>✧</span>
          </div>
        </div>


        {/* Action Kamen + Nene — big, centered, floating, touching the Popular Chocolates section border */}
        <div className="absolute bottom-[-8px] left-1/2 z-20 -translate-x-1/2 md:bottom-[-12px]">
          <Link href={HAMPER_PAGE} aria-label="View Rakhi Chaos Hamper — Action Kamen and Nene">
            <img
              src={CHARACTERS}
              alt="Azesa Rakhi — Action Kamen and Nene"
              className="animate-float h-36 w-36 cursor-pointer object-contain drop-shadow-lg md:h-44 md:w-44"
            />
          </Link>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-8 px-6 pb-20 pt-10 md:grid-cols-[45%_55%] md:px-10 md:pt-14 lg:px-16">
          {/* Left: copy + CTA — pulled up so the badge overlaps the Crafted hero */}
          <div className="relative max-w-xl md:-mt-24">
            {/* Star — smaller, tilted, twinkling and floating above the badge */}
            <div className="animate-float pointer-events-none absolute -top-16 left-0" aria-hidden>
              <span className="animate-twinkle block rotate-12 text-4xl text-[#ffcb09] drop-shadow-sm md:text-5xl">
                ★
              </span>
            </div>
            <div className="mb-7 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#f47920]/20 bg-[#fffaf0]/90 px-5 py-3 font-heading text-sm font-black uppercase tracking-[0.1em] text-[#9a4600] shadow-sm">
              <span aria-hidden className="text-lg">
                ★
              </span>{" "}
              Limited edition chaos
            </div>
            <h1 className="font-heading text-[clamp(3.4rem,7vw,6.6rem)] leading-[0.95] tracking-[-0.03em] text-[#1c1c17]">
              <span className="block">The Ultimate</span>
              <span className="block bg-gradient-to-r from-[#9a4600] via-[#c05a10] to-[#f47920] bg-clip-text text-transparent">
                Rakhi Chaos
              </span>
              <span className="block">Hamper</span>
            </h1>
            <p className="mt-8 max-w-lg font-sans text-xl leading-relaxed text-[#574237] md:text-2xl">
              A super-fun collection of treats to celebrate the beautiful, crazy bond of siblings! Packed with surprises and crafted with love.
            </p>
            <div className="mt-8 flex items-end gap-4">
              <span className="font-heading text-5xl font-black text-[#9a4600] md:text-6xl">₹{HAMPER?.price ?? 649}</span>
              <span className="mb-1 font-heading text-xl text-[#574237] line-through">₹{HAMPER?.mrp ?? 699}</span>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="mt-8 !bg-white hover:!bg-brand-dark hover:!text-brand-cream"
            >
              Pre-order Now
            </Button>
          </div>

          {/* Right: collage — circular character shot + hamper box + showcase, gently floating */}
          <div className="animate-float relative mx-auto mt-8 h-[430px] w-full max-w-[620px] md:-mt-28 md:h-[560px]">
            <div className="absolute left-[6%] top-[12%] h-[80%] w-[80%] rounded-full bg-[#ffcb09]/35 blur-3xl" aria-hidden />
            <Link
              href={HAMPER_PAGE}
              aria-label="View Rakhi Chaos Hamper — sibling characters"
              className="absolute right-0 top-0 z-10 block"
            >
              <img
                src={SIBLINGS}
                alt="Azesa Happy Rakhi — sibling characters"
                className="h-40 w-40 rotate-6 cursor-pointer rounded-full border-4 border-white object-cover shadow-xl transition-transform duration-300 hover:rotate-0 hover:scale-[1.05] md:h-56 md:w-56"
              />
            </Link>
            <Link
              href={HAMPER_PAGE}
              aria-label="View Rakhi Chaos Hamper — hamper box"
              className="absolute left-[4%] top-[16%] z-20 block w-[56%] -rotate-6"
            >
              <img
                src={HAMper_POSTER}
                alt="Azesa Rakhi hamper box"
                className="h-auto w-full cursor-pointer rounded-2xl border-4 border-white object-cover shadow-2xl transition-transform duration-300 hover:scale-[1.08] hover:rotate-2"
              />
            </Link>
            <Link
              href={HAMPER_PAGE}
              aria-label="View Rakhi Chaos Hamper — hamper contents"
              className="absolute bottom-0 right-[2%] z-30 block w-[48%] rotate-12"
            >
              <img
                src={HAMper_SHOWCASE}
                alt="Rakhi hamper contents and keychains"
                className="h-auto w-full cursor-pointer rounded-xl border-2 border-white object-cover shadow-xl transition-transform duration-300 hover:-rotate-6 hover:scale-[1.05]"
              />
            </Link>
            <div className="pointer-events-none absolute bottom-[5%] right-[44%] z-40 text-3xl text-[#ffcb09] drop-shadow" aria-hidden>
              ★
            </div>
          </div>
        </div>
      </section>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rakhi-order-title"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#1c1109]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-[#fcf9f1] p-7 shadow-2xl md:p-9">
            <div className="flex items-center justify-between gap-4">
              <p className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-[#9a4600]">
                Limited edition
              </p>
              <button
                type="button"
                aria-label="Close pre-order dialog"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-full p-2 text-2xl leading-none text-[#574237] hover:bg-[#e5e2db]"
              >
                ×
              </button>
            </div>
            {HAMPER?.image && (
              <div className="my-5 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-[#1c1109]/15 bg-white">
                <img
                  src={HAMPER.image}
                  alt={HAMPER.name}
                  className="h-40 w-full cursor-pointer object-contain p-2 transition-transform duration-300 hover:scale-110"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <h2 id="rakhi-order-title" className="font-heading text-3xl text-[#1c1c17]">
                {HAMPER?.name ?? "Reserve the chaos"}
              </h2>
            </div>
            <p className="mt-3 text-sm text-[#574237]">
              {HAMPER?.ingredient}. A super-fun collection of treats to celebrate the beautiful,
              crazy bond of siblings — crafted with love in Katihar, Bihar.
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black text-[#1c1c17]">₹{HAMPER?.price ?? 699}</span>
              {HAMPER?.mrp ? (
                <span className="font-heading text-base text-[#574237] line-through">₹{HAMPER.mrp}</span>
              ) : null}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="font-heading text-lg text-[#1c1c17]">₹{(HAMPER?.price ?? 699) * quantity}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="h-9 w-9 cursor-pointer rounded-full bg-[#e5e2db] text-xl"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                  className="h-9 w-9 cursor-pointer rounded-full bg-[#ffcb09] text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePreOrder}
              className="mt-7 w-full cursor-pointer rounded-full bg-[#9a4600] px-6 py-4 font-heading text-lg text-white transition-transform hover:scale-[1.02]"
            >
              Continue with {quantity} hamper{quantity > 1 ? "s" : ""} → Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
