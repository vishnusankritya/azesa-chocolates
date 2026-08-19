// WhatsApp order-confirmation via click-to-chat (wa.me deep link).
// No API/account needed: from a browser on WhatsApp Web/Desktop this opens a
// chat to the customer with the confirmation pre-filled — the shop taps send.

/** Normalize an Indian phone to international E.164 digits for wa.me. */
export function normalizeWhatsAppPhone(phone: string): string | null {
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = d.slice(1); // drop leading trunk 0
  if (d.length === 10) d = "91" + d; // assume India when 10 digits
  if (!/^[1-9][0-9]{9,14}$/.test(d)) return null;
  return d;
}

/** Build a wa.me deep link with a pre-filled message. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizeWhatsAppPhone(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export type OrderForWhatsApp = {
  id: string;
  amount: number;
  paymentLabel: string;
  customerName?: string | null;
  phone?: string | null;
  items: { qty: number; productName: string; unitPrice: number }[];
};

/** Build the confirmation message + wa.me link for an order, or null if the
 *  order has no usable phone number. */
export function orderConfirmationLink(o: OrderForWhatsApp): string | null {
  const digits = normalizeWhatsAppPhone(o.phone || "");
  if (!digits) return null;
  const lines = [
    `🙏 Thank you for your order${o.customerName ? `, ${o.customerName}` : ""}!`,
    "",
    `*Order:* #${o.id}`,
    ...o.items.map((i) => `• ${i.qty}× ${i.productName} — ₹${i.unitPrice * i.qty}`),
    "",
    `*Total:* ₹${o.amount}`,
    `*Payment:* ${o.paymentLabel}`,
    "",
    `Your order is confirmed ✅ We'll keep you updated here. — Azésa Chocolates`,
  ];
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}
