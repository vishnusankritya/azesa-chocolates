import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import ShopClient from "@/components/ShopClient";
import Footer from "@/components/Footer";
import { getProducts } from "@/server/catalog";

export const revalidate = 300; // ISR catalog

export const metadata = {
  title: "Shop All — Azesa Chocolates",
  description:
    "Browse the full Azesa range — handcrafted chocolates and cookies from Katihar, Bihar. No palm oil, no artificial colours.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getProducts();

  return (
    <>
      <div className="bg-brand-cream p-2 md:p-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <AnnouncementBar />
          <Nav />
        </div>
      </div>
      <main>
        <ShopClient products={products} initialCategory={category} />
      </main>
      <Footer />
    </>
  );
}