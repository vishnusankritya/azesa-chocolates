"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

/* Piñata spotlight — title + tagline, three filling/product images in the
   left, right and centre placeholders. */
const SPOTLIGHT = {
  word1: "Piñata",
  word2: "Kunafa",
  tagline: "Biscoff Piñata · Kataifa Kunafa · Cookie Piñata",
  images: [
    { id: "biscoff", src: "/products/biscoff.png", label: "Biscoff Piñata", rot: "-7deg" },
    { id: "kunafa-pinata", src: "/products/kunafa-pinata.png", label: "Kataifa Kunafa", rot: "6deg" },
    { id: "cookie-pinata", src: "/products/cookie-pinata.png", label: "Cookie Piñata", rot: "-2deg" },
  ],
};

/* Hover: pause the jitter animation + straighten the tilt (on the card div),
   and enlarge just the product image + silhouette shadow (on the <img>). */
const CARD_HOVER = "transition-all duration-300 hover-stop hover:z-30";
const IMG_HOVER =
  "h-full w-full object-contain transition-transform duration-300 hover:scale-110 hover:drop-shadow-2xl";

export default function FeaturedSpotlight() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const jitterClass = (base: string) => `tilt ${inView ? "jitter" : ""} ${base}`;
  const [left, right, centre] = SPOTLIGHT.images;

  return (
    <section ref={sectionRef} className="bg-brand-cream overflow-hidden py-16 md:pb-8 md:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Mobile: simple stacked layout */}
        <div className="flex flex-col items-center text-center md:hidden">
          <h2
            className={jitterClass("font-heading text-brand-dark leading-[0.9]")}
            style={{ fontSize: "clamp(40px, 12vw, 64px)" }}
          >
            {SPOTLIGHT.word1}
            <br />
            {SPOTLIGHT.word2}
          </h2>

          <span
            className="font-sans font-extrabold text-brand-dark/70 uppercase tracking-wide mt-2"
            style={{ fontSize: "clamp(18px, 5vw, 24px)" }}
          >
            {SPOTLIGHT.tagline}
          </span>

          <div className={jitterClass("mt-6")} style={{ width: 220, height: 240 }}>
            <Link href={`/shop/${centre.id}`} className="block h-full w-full">
              <img src={centre.src} alt={centre.label} loading="lazy" decoding="async" className={IMG_HOVER} />
            </Link>
          </div>

          <div className="mt-4">
            <Button href="/shop?category=pinata">Try It</Button>
          </div>

          <div className="mt-6 flex items-center gap-2" style={{ transform: "rotate(-3deg)" }}>
            <span className="font-heading text-brand-dark text-sm uppercase tracking-widest whitespace-nowrap">
              {SPOTLIGHT.tagline}
            </span>
          </div>
        </div>

        {/* Desktop: photo-collage layout */}
        <div className="relative hidden md:block" style={{ minHeight: 650 }}>
          {/* Left photo — Biscoff Piñata (no container box) */}
          <Link href={`/shop/${left.id}`} className="absolute block" style={{ top: 26, left: 0, width: 220, height: 220 }}>
            <div
              className={jitterClass(`flex h-full w-full items-center justify-center ${CARD_HOVER}`)}
              style={{ ["--base-rot" as string]: left.rot }}
            >
              <img src={left.src} alt={left.label} loading="lazy" decoding="async" className={IMG_HOVER} />
            </div>
          </Link>

          {/* Flavour label under the left card */}
          <div className="pointer-events-none absolute flex justify-center" style={{ top: 254, left: 0, width: 220 }}>
            <span
              className="font-heading text-brand-dark text-sm uppercase tracking-widest whitespace-nowrap"
              style={{ transform: "rotate(-4deg)" }}
            >
              {left.label}
            </span>
          </div>

          {/* Right photo — Kataifa Kunafa (no container box) */}
          <Link href={`/shop/${right.id}`} className="absolute block" style={{ top: 46, right: -20, width: 220, height: 220 }}>
            <div
              className={jitterClass(`flex h-full w-full items-center justify-center ${CARD_HOVER}`)}
              style={{ ["--base-rot" as string]: right.rot }}
            >
              <img src={right.src} alt={right.label} loading="lazy" decoding="async" className={IMG_HOVER} />
            </div>
          </Link>

          {/* Flavour label under the right card */}
          <div className="pointer-events-none absolute flex justify-center" style={{ top: 288, right: -20, width: 220 }}>
            <span
              className="font-heading text-brand-dark text-sm uppercase tracking-widest whitespace-nowrap"
              style={{ transform: "rotate(4deg)" }}
            >
              {right.label}
            </span>
          </div>

          {/* Heading */}
          <div className={jitterClass("pointer-events-none absolute left-1/2 top-0 z-20 w-full -translate-x-1/2 text-center")}>
            <h2
              className="font-heading relative inline-block text-brand-dark leading-[0.88]"
              style={{ fontSize: "clamp(46px, 5.4vw, 78px)" }}
            >
              {SPOTLIGHT.word1}
            </h2>
            <div className="-mt-1 flex items-center justify-center gap-3">
              <span style={{ fontSize: 26 }} aria-hidden>
                💜
              </span>
              <h2
                className="font-heading text-brand-dark leading-[0.88]"
                style={{ fontSize: "clamp(46px, 5.4vw, 78px)" }}
              >
                {SPOTLIGHT.word2}
              </h2>
            </div>
            <span
              className="mt-2 block font-sans font-extrabold text-brand-dark/70 uppercase tracking-wide"
              style={{ fontSize: "clamp(15px, 1.9vw, 23px)" }}
            >
              {SPOTLIGHT.tagline}
            </span>
          </div>

          {/* Main product photo — Cookie Piñata (no container box, same size as sides) */}
          <Link
            href={`/shop/${centre.id}`}
            className="absolute left-1/2 top-[268px] z-10 block w-[220px] -translate-x-1/2"
            style={{ height: 220 }}
          >
            <div
              className={jitterClass(`flex h-full w-full items-center justify-center ${CARD_HOVER}`)}
              style={{ ["--base-rot" as string]: centre.rot }}
            >
              <img src={centre.src} alt={centre.label} loading="lazy" decoding="async" className={IMG_HOVER} />
            </div>
          </Link>

          {/* Flavour label under the centre card */}
          <div className="pointer-events-none absolute left-0 right-0 flex justify-center" style={{ top: 496 }}>
            <span
              className="font-heading text-brand-dark text-sm uppercase tracking-widest whitespace-nowrap"
              style={{ transform: "rotate(-2deg)" }}
            >
              {centre.label}
            </span>
          </div>

          {/* Sparkle dashes */}
          <SpotlightDash style={{ top: 508, right: 90, transform: "rotate(-25deg)" }} />
          <SpotlightDash style={{ top: 538, right: 60, transform: "rotate(15deg)" }} />
          <SpotlightDash style={{ top: 40, left: 210, transform: "rotate(50deg)", opacity: 0.35 }} />

          {/* CTA */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 566 }}>
            <Button href="/shop?category=pinata">Try It</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpotlightDash({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none absolute h-2 w-6 rounded-full"
      style={{ backgroundColor: "#1c1109", ...style }}
      aria-hidden
    />
  );
}