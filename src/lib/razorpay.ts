import { createHmac } from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export function isRazorpayConfigured() {
  return Boolean(KEY_ID && KEY_SECRET);
}

/**
 * Create a Razorpay order server-side. Card data never touches our server —
 * Razorpay handles PCI. Returns the raw Razorpay order entity.
 */
export async function createRazorpayOrder({
  amount,
  receipt,
}: {
  amount: number; // in paise
  receipt: string;
}) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}) ${text}`);
  }
  return res.json();
}

/**
 * Verify the Razorpay webhook signature (HMAC-SHA256 of the raw body).
 */
export function verifyRazorpaySignature(
  secret: string,
  rawBody: string,
  signature: string
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
