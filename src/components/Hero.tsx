import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden rounded-t-2xl rounded-b-none"
      style={{ backgroundColor: "#ff7a00", minHeight: 500, maxHeight: "calc(100vh - 110px)" }}
    >
      {/* Yellow right-side diagonal panel */}
      <div
        className="absolute inset-y-0 right-0 w-[52%]"
        style={{
          backgroundColor: "#ffd000",
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Sprinkle decorations */}
      <Dash style={{ top: "18%", left: "45%", transform: "rotate(-40deg)", opacity: 0.35 }} />
      <Dash style={{ top: "62%", left: "48%", transform: "rotate(25deg)", opacity: 0.3 }} />
      <Dash style={{ top: "28%", right: "7%", transform: "rotate(55deg)", opacity: 0.25 }} />
      <Dash style={{ bottom: "22%", right: "18%", transform: "rotate(-18deg)", opacity: 0.3 }} />

      {/* Content */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center"
        style={{ minHeight: 500 }}
      >
        {/* Left: Headline + CTA */}
        <div>
          <h1
            className="font-heading text-white leading-[0.92] mb-6"
            style={{ fontSize: "clamp(44px, 6vw, 84px)" }}
          >
            Crafted in India.
            <br />
            Loved everywhere.
          </h1>

          {/* CTA + description side-by-side (Marco pattern) */}
          <div className="flex flex-wrap items-start gap-5">
            <Button href="/shop/rakhi-chaos-hamper">Shop Now</Button>
            <p className="text-white/85 text-sm leading-relaxed max-w-[200px] pt-1">
              No palm oil. No artificial colours. Just real Indian chocolate.
            </p>
          </div>
        </div>

        {/* Right: Product placeholder — cream card with products overflowing (per UI reference) */}
        <div className="relative flex items-center justify-center py-8">
          <div
            className="relative overflow-visible rounded-[2rem] border-2 border-brand-dark shadow-[10px_10px_0_0_#1c1109]"
            style={{ width: 336, height: 260, backgroundColor: "#f5f0e6" }}
          >
            {/* Hamper enlarged so it spills out past the card edges — jitter + hover enlarge (item only) */}
            <div className="absolute inset-0 flex items-center justify-center">
                            <div className="tilt jitter" style={{ ["--base-rot" as string]: "1.5deg" }}>
                              <Image
                                src="/rakhi-hamper.webp"
                                alt="Azesa Happy Rakhi Hamper"
                                width={460}
                                height={460}
                                priority
                                fetchPriority="high"
                                className="h-[460px] w-[460px] cursor-pointer object-contain transition-transform duration-300 hover:scale-110"
                              />
                            </div>
                          </div>

            <div
              className="absolute -bottom-6 -right-6 w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center text-center z-10"
              style={{ backgroundColor: "#ff7a00", border: "3px solid #ffd000" }}
            >
              <span className="font-heading text-white text-[10px] leading-tight">Made in</span>
              <span className="font-heading text-brand-yellow text-[10px] leading-tight">India</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dash({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-6 h-2 rounded-full"
      style={{ backgroundColor: "#1c1109", ...style }}
      aria-hidden
    />
  );
}
