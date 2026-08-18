import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";

export default function ComingSoon({
  eyebrow = "Coming soon",
  title = "This page is still baking",
  blurb = "We're crafting this part of the site with love. Meanwhile, dive into the full range of handcrafted chocolates.",
}: {
  eyebrow?: string;
  title?: string;
  blurb?: string;
}) {
  return (
    <>
      <div className="bg-brand-cream p-2 md:p-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <AnnouncementBar />
          <Nav />
        </div>
      </div>
      <main>
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-10 text-center shadow-[6px_6px_0_0_#1c1109] md:p-14">
              <div className="animate-float mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-brand-dark bg-white shadow-[4px_4px_0_0_#1c1109]">
                <span className="text-4xl" aria-hidden>
                  🍫
                </span>
              </div>
              <p className="mb-3 font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">
                {eyebrow}
              </p>
              <h1 className="font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-brand-dark/60">{blurb}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Button href="/">← Back home</Button>
                <Button href="/shop">Browse the shop</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}