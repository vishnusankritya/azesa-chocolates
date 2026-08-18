import Link from "next/link";
import type { CSSProperties } from "react";
import Button from "@/components/ui/Button";

type Shape = "squircle" | "star" | "circle" | "grid" | "diamond";

const categories: {
  id: string;
  label: string;
  img: string;
  shape: Shape;
  bg: string;
  pattern: string;
  backgroundSize?: string;
}[] = [
  {
    id: "chocolates",
    label: "Chocolates",
    img: "/categories/chocolates.png",
    shape: "squircle",
    bg: "#7c3aed",
    pattern:
      "repeating-radial-gradient(circle at 50% 60%, rgba(255,255,255,0.22) 0 14px, transparent 14px 30px)",
  },
  {
    id: "cookies",
    label: "Cookies",
    img: "/categories/cookies.png",
    shape: "star",
    bg: "#ec4899",
    pattern: "none",
  },
  {
    id: "pinata",
    label: "Piñata",
    img: "/categories/pinata.png",
    shape: "circle",
    bg: "#f97316",
    pattern:
      "repeating-radial-gradient(circle at 50% 55%, rgba(255,255,255,0.22) 0 12px, transparent 12px 26px)",
  },
  {
      id: "hampers",
      label: "Hampers",
      img: "/categories/hampers.png",
      shape: "grid",
      bg: "#fde047",
    pattern:
      "linear-gradient(rgba(0,0,0,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.10) 1px, transparent 1px)",
    backgroundSize: "22px 22px",
  },
  {
    id: "festivals",
    label: "Festivals",
    img: "/categories/festivals.png",
    shape: "diamond",
    bg: "#10b981",
    pattern:
      "radial-gradient(rgba(255,255,255,0.35) 2.5px, transparent 2.5px)",
    backgroundSize: "18px 18px",
  },
];

/** 12-point starburst (gear-flavored) polygon for the Cookies tile */
function StarShape({ bg, img, alt }: { bg: string; img: string; alt: string }) {
  const spikes = 12;
  const outer = 50;
  const inner = 34;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <div className="relative h-[176px] w-[176px]">
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[3px_3px_0_#1c1109]">
            <polygon points={pts.join(" ")} fill={bg} stroke="#1c1109" strokeWidth="4" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <img
              src={img}
              alt={alt}
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>
  );
}

function ShapeTile({ c }: { c: (typeof categories)[number] }) {
  const style: CSSProperties = {
    backgroundColor: c.bg,
    backgroundImage: c.pattern,
    backgroundSize: (c as { backgroundSize?: string }).backgroundSize,
  };

  if (c.shape === "star") {
    return <StarShape bg={c.bg} img={c.img} alt={c.label} />;
  }

  const shapeClass =
    c.shape === "circle"
      ? "rounded-full"
      : c.shape === "diamond"
        ? "rounded-[22%] rotate-45"
        : "rounded-[30%]";

  return (
      <div
        className={`relative h-[176px] w-[176px] overflow-hidden border-4 border-brand-dark ${shapeClass} shadow-[5px_5px_0_0_#1c1109]`}
        style={style}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
                <img
                  src={c.img}
                  alt={c.label}
                  className={`h-full w-full object-contain transition-transform duration-200 group-hover:scale-110 ${
                    c.shape === "diamond" ? "-rotate-45" : ""
                  } drop-shadow-[3px_3px_0_rgba(0,0,0,0.2)]`}
                />
              </div>
      </div>
    );
}

export default function CategoriesSection() {
  return (
    <section className="bg-brand-cream pb-14 pt-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff7a00" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="font-heading text-brand-dark" style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}>
              Shop by Category
            </h2>
          </div>
          <Button href="/shop" className="hidden md:inline-flex">
            View All
          </Button>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-8 md:gap-10">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="group flex w-[176px] flex-col items-center"
            >
              {/* Uniform shape zone: tall enough for the rotated diamond's overflow,
                  so every label sits on the same baseline. */}
              <div className="flex h-[280px] w-full items-center justify-center">
                <ShapeTile c={c} />
              </div>
              <p className="text-center font-heading text-[15px] font-black uppercase tracking-wide leading-tight text-brand-dark">
                {c.label}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-7 text-center md:hidden">
          <Button href="/shop">View All</Button>
        </div>
      </div>
    </section>
  );
}