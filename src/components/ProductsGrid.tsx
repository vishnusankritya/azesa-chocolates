import type { CatalogProduct } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/ui/Button";

const GRID_IDS = [
  "adventurous-almond",
  "valentines-coffee",
  "cookie-pinata",
  "holi-edition-white",
  "strawberry-sunrise",
  "harry-potter-coffee",
];

export default function ProductsGrid({ products }: { products: CatalogProduct[] }) {
  const gridProducts = GRID_IDS.map((id) => products.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <div className="mb-10 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
              The Azesa Range
            </p>
            <h2 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
              Chocolate worth every bite
            </h2>
          </div>
          <Button href="/shop" className="hidden md:inline-flex">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          {gridProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}