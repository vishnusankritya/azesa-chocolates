"use client";

import { useEffect, useState } from "react";

const messages = [
  "Made in India — crafted with pride in Katihar, Bihar",
  "No Palm Oil. Ever.",
  "Free shipping on orders above ₹499",
  "No artificial colours or preservatives",
];

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  );
}

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full overflow-hidden rounded-2xl grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 text-white"
      style={{ backgroundColor: "#1c1109" }}
    >
      <div className="hidden sm:flex items-center gap-2 text-white text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap">
        <TruckIcon />
        Free Shipping
      </div>

      <span
        className="text-center text-xs font-bold uppercase tracking-widest"
        style={{
          display: "inline-block",
          maxWidth: "100%",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {messages[idx]}
      </span>

      <div className="hidden sm:flex items-center justify-end gap-2 text-white text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap">
        <TruckIcon />
        Free Shipping
      </div>
    </div>
  );
}
