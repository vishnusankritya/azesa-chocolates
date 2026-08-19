import { notFound } from "next/navigation";
import { getProducts, getProductBySlug } from "@/server/catalog";
import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import Button from "@/components/ui/Button";
import HamperDetail from "@/components/HamperDetail";

export const revalidate = 300; // ISR product detail

export async function generateStaticParams() {
  const list = await getProducts();
  return list.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  return {
    title: product ? `${product.name} — Azesa Chocolates` : "Not Found — Azesa Chocolates",
    description: product
      ? `${product.name}: ${product.tagline ?? ""} ${product.ingredient ?? ""}. Handcrafted in Katihar, Bihar. No palm oil, no artificial colours.`
      : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const all = await getProducts();
  const related = [
    ...all.filter((p) => p.id !== product.id && p.type === product.type),
    ...all.filter((p) => p.id !== product.id && p.type !== product.type),
  ].slice(0, 4);

  if (product.type === "hamper") {
    return (
      <>
        <div className="bg-brand-cream p-2 md:p-3">
          <div className="flex flex-col gap-2 md:gap-3">
            <AnnouncementBar />
            <Nav />
          </div>
        </div>
        <main>
          <HamperDetail product={product} related={related} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="bg-brand-cream p-2 md:p-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <AnnouncementBar />
          <Nav />
        </div>
      </div>
      <main>
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <Button href="/shop" className="inline-flex">
              ← Back to shop
            </Button>

            <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-brand-dark bg-white">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 md:p-8"
                  />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <p className="mb-3 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
                  {product.ingredient}
                </p>
                <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-3 font-script text-2xl text-brand-orange">{product.tagline}</p>
                <p className="mt-5 font-heading text-3xl font-black text-brand-dark">₹{product.price}</p>

                <div className="my-6 h-px bg-brand-dark/15" />

                <p className="max-w-md text-brand-dark/70">
                  Every {product.name.toLowerCase()} is handcrafted in small batches in Katihar,
                  Bihar — real {product.ingredient?.toLowerCase() ?? "chocolate"}, no palm oil, no
                  artificial colours.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AddToCartButton id={product.id} label="Add to Cart" availability={product.availability} />
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {["No Palm Oil", "No Artificial Colours", "Made in India"].map((b) => (
                      <span
                        key={b}
                        className="flex items-center gap-1.5 text-sm font-bold text-brand-dark/55"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-24">
              <div className="mb-8 flex items-center justify-between">
                <h2
                  className="font-heading text-brand-dark"
                  style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
                >
                  You may also like
                </h2>
                <Button href="/shop" className="hidden md:inline-flex">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}