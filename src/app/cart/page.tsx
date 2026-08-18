import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import CartClient from "@/components/CartClient";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cart — Azesa Chocolates",
  description:
    "Your Azesa basket — handcrafted chocolates, cookies and hampers from Katihar, Bihar. Free shipping on all orders.",
};

export default function CartPage() {
  return (
    <>
      <div className="bg-brand-cream p-2 md:p-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <AnnouncementBar />
          <Nav />
        </div>
      </div>
      <main>
        <CartClient />
      </main>
      <Footer />
    </>
  );
}