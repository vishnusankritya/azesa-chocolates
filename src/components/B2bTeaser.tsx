import Button from "@/components/ui/Button";

const partners = ["Hyundai", "Tanishq"];

export default function B2bTeaser() {
  return (
    <section className="py-20" style={{ backgroundColor: "#1c1109" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-heading text-brand-orange uppercase tracking-widest text-sm mb-4">
              Corporate &amp; Bulk Orders
            </p>
            <h2
              className="font-heading text-white leading-[0.92] mb-6"
              style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
            >
              Trusted by businesses across India.
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-md mb-8">
              From luxury showrooms to premium dealerships — bulk gifting,
              custom branding, and reliable delivery at scale.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {partners.map((p) => (
                <span key={p} className="font-heading px-5 py-2 rounded-full border border-white/20 text-white/60 text-sm">
                  {p}
                </span>
              ))}
              <span className="font-heading px-5 py-2 rounded-full border border-white/10 text-white/25 text-sm">
                + more
              </span>
            </div>

            <Button href="/for-business">Partner With Us</Button>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: "🎁", title: "Custom Branding", desc: "Your logo, your message, our chocolate." },
              { icon: "📦", title: "Bulk Pricing", desc: "Attractive rates for orders of 50+ units." },
              { icon: "🚚", title: "Reliable Delivery", desc: "Pan-India shipping with dedicated support." },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ backgroundColor: "#ffffff0a", border: "1px solid #ffffff12" }}
              >
                <span className="text-3xl flex-shrink-0" aria-hidden>{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white text-base mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
