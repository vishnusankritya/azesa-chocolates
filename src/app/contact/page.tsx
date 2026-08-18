import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Contact — Azesa Chocolates",
  description:
    "Get in touch with Azesa Chocolates — Katihar, Bihar. This page is coming soon.",
};

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="Contact"
      title="Contact is coming soon"
      blurb="Questions, orders or just craving chocolate? Our contact page is on its way — shop the range in the meantime."
    />
  );
}