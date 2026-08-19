"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function UPIQr({
  amount,
  orderRef,
  upiLink,
}: {
  amount: number;
  orderRef: string;
  upiLink: string;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(upiLink, {
      width: 240,
      margin: 1,
      color: { dark: "#1c1109", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [upiLink]);

  return (
    <div className="rounded-2xl border-2 border-brand-dark bg-white p-5 text-center">
      <p className="font-heading text-sm font-black uppercase tracking-wide text-brand-dark">
        Scan to pay ₹{amount.toLocaleString("en-IN")}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-brand-dark/50">via any UPI app</p>

      <div className="mx-auto mt-4 w-fit">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="UPI QR code" width={240} height={240} className="rounded-xl" />
        ) : (
          <div className="flex h-[240px] w-[240px] items-center justify-center text-brand-dark/50">
            Generating QR…
          </div>
        )}
      </div>

      <p className="mt-3 font-heading text-sm font-black tracking-wide text-brand-dark">
        Order {orderRef}
      </p>
      <p className="mt-1 text-xs font-semibold text-brand-dark/55">
        Pay the exact amount above. Your order is confirmed once we verify the receipt.
      </p>

      <a
        href={upiLink}
        className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-brand-dark bg-brand-dark px-5 py-2 font-heading text-sm font-black uppercase tracking-wide text-brand-cream shadow-[3px_3px_0_0_#1c1109] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Open UPI app
      </a>
    </div>
  );
}
