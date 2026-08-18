import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsGrid() {
  const gridProducts = products.filter((p) => p.image && p.type !== "hamper");

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
              The Azesa Range
            </p>
            <h2 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
              Chocolate worth every bite
            </h2>
          </div>
          <Link
            href="/shop"
            className="mb-1 hidden font-heading text-sm font-black uppercase tracking-[0.1em] text-[#9a4600] transition-colors hover:text-brand-orange md:inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {gridProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}