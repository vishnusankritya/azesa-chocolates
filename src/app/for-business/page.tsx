import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "For Business — Azesa Chocolates",
  description:
    "Azesa for business — gifting, corporate orders, bulk and B2B. This page is coming soon.",
};

export default function ForBusinessPage() {
  return (
    <ComingSoon
      eyebrow="For business"
      title="B2B & corporate is coming soon"
      blurb="Bulk orders, corporate gifting and gifting boxes for your team or clients — we're putting the details together."
    />
  );
}