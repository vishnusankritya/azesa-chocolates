import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Our Story — Azesa Chocolates",
  description:
    "The Azesa story — handcrafted chocolates from Katihar, Bihar. This page is coming soon.",
};

export default function OurStoryPage() {
  return (
    <ComingSoon
      eyebrow="Our story"
      title="Our story is coming soon"
      blurb="Where Katihar meets chocolate — the full story of how Azesa was born is on its way. Meanwhile, taste the range for yourself."
    />
  );
}