import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import RakhiHamperHero from "@/components/RakhiHamperHero";
import Hero from "@/components/Hero";
import UspBar from "@/components/UspBar";
import BestsellerCarousel from "@/components/BestsellerCarousel";
import FeaturedSpotlight from "@/components/FeaturedSpotlight";
import ProductsGrid from "@/components/ProductsGrid";
import CategoriesSection from "@/components/CategoriesSection";
import BrandStoryTeaser from "@/components/BrandStoryTeaser";
import OccasionsSection from "@/components/OccasionsSection";
import B2bTeaser from "@/components/B2bTeaser";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import { getProducts } from "@/server/catalog";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <div className="bg-brand-cream p-2 md:p-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <AnnouncementBar />
          <Nav />
          <div className="flex flex-col">
            <Hero />
            <RakhiHamperHero />
          </div>
        </div>
      </div>
      <main>
        <BestsellerCarousel products={products} />
        <UspBar />
        <FeaturedSpotlight />
        <ProductsGrid products={products} />
        <CategoriesSection />
        <BrandStoryTeaser />
        <OccasionsSection />
        <ReviewsSection />
        <B2bTeaser />
      </main>
      <Footer />
    </>
  );
}
