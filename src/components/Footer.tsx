import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1c1109" }} className="text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="font-heading text-brand-yellow leading-none block mb-4" style={{ fontSize: 48 }}>
              Azesa
            </span>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Handcrafted chocolates &amp; cookies. Made in Katihar, Bihar — with
              no palm oil, no artificial colours, and zero shortcuts.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="text-white/40 hover:text-brand-yellow transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="WhatsApp" className="text-white/40 hover:text-brand-yellow transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {[
                { label: "Chocolates", href: "/shop?category=chocolates" },
                { label: "Cookies", href: "/shop?category=cookies" },
                { label: "Gift Boxes", href: "/shop?category=hampers" },
                { label: "Bestsellers", href: "/shop?category=bestsellers" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "Our Story", href: "/our-story" },
                { label: "For Business", href: "/for-business" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Azesa Chocolates. Made with love in Katihar, Bihar.
          </p>
          <p className="text-white/20 text-xs">
            No Palm Oil &middot; No Artificial Colours &middot; Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}
