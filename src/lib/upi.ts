// UPI Scan-&-Pay (no gateway). Customer pays the store's own UPI ID via QR / deep link;
// an admin confirms the order as paid when the money arrives.
// These are public (they appear in the QR shown to customers) so NEXT_PUBLIC_ is fine.
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";
export const UPI_STORE = process.env.NEXT_PUBLIC_UPI_STORE || "Azesa Chocolates";

export function buildUpiLink({ amount, note }: { amount: number; note: string }): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_STORE,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}
