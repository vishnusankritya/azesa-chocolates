import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

export default function HamperDetail({
  product,
  related,
}: {
  product: CatalogProduct;
  related: CatalogProduct[];
}) {

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-heading text-sm font-black uppercase tracking-[0.12em] text-[#9a4600] transition-colors hover:text-brand-orange"
          >
            ← Back to shop
          </Link>
          <span className="hidden font-heading text-sm font-black uppercase tracking-[0.1em] text-brand-dark/40 md:inline-block">
            Gift Hampers
          </span>
        </div>

        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
          {/* Image */}
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-brand-dark bg-white shadow-[6px_6px_0_0_#1c1109]">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-4 md:p-8"
              />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
              {product.ingredient}
            </p>
            <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 font-script text-2xl text-brand-orange">{product.tagline}</p>

            {product.description && (
              <p className="mt-3 max-w-md text-brand-dark/70">{product.description}</p>
            )}

            <div className="mt-5 flex items-end gap-3">
              <span className="font-heading text-4xl font-black text-brand-dark">₹{product.price}</span>
              {product.mrp ? (
                <span className="mb-1 font-heading text-xl text-brand-dark/40 line-through">
                  ₹{product.mrp}
                </span>
              ) : null}
            </div>

            <div className="my-6 h-px bg-brand-dark/15" />

            {product.occasion ? (
              <div>
                <p className="font-heading text-sm font-black uppercase tracking-[0.12em] text-[#9a4600]">
                  Perfect for
                </p>
                <p className="mt-1.5 max-w-md text-brand-dark/70">{product.occasion}</p>
              </div>
            ) : null}

            {product.contents && product.contents.length > 0 ? (
              <div className="mt-6">
                <p className="font-heading text-sm font-black uppercase tracking-[0.12em] text-[#9a4600]">
                  What&apos;s inside
                </p>
                <ul className="mt-3 space-y-2.5">
                  {product.contents.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-brand-dark/75">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddToCartButton id={product.id} availability={product.availability} />
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {["No Palm Oil", "No Artificial Colours", "Made in India"].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-sm font-bold text-brand-dark/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="mt-16 md:mt-24">
          <div className="mb-8 flex items-center justify-between">
            <h2
              className="font-heading text-brand-dark"
              style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
            >
              You may also like
            </h2>
            <Link
              href="/shop"
              className="hidden font-heading text-sm font-black uppercase tracking-[0.1em] text-[#9a4600] transition-colors hover:text-brand-orange md:inline-block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}