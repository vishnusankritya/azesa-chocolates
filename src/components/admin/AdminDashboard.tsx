"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductEditor, { type AdminProduct } from "@/components/admin/ProductEditor";
import { orderConfirmationLink } from "@/lib/whatsapp";

type Order = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentId: string | null;
  createdAt: string;
  customer: { name: string | null; phone: string | null; email: string | null } | null;
  address: { line1: string; landmark?: string | null; city: string; state: string; pincode: string } | null;
  items: { productName: string; qty: number; unitPrice: number }[];
};

type Product = AdminProduct;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  packed: "Packed",
  dispatched: "Dispatched",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};
const ORDER_TABS = [
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "fulfilled", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;
const PAID_SUB = [
  { id: "all", label: "All" },
  { id: "packed", label: "Packed" },
  { id: "dispatched", label: "Dispatched" },
] as const;
// One-step status transitions for the workflow:
// pending -> paid | cancelled -> packed -> dispatched -> fulfilled
function actionsFor(status: string): [string, string, "default" | "danger" | "primary"][] {
  switch (status) {
    case "pending":
      return [
        ["paid", "Mark as Paid", "primary"],
        ["cancelled", "Cancel Order", "danger"],
      ];
    case "paid":
      return [["packed", "Mark as Packed", "default"]];
    case "packed":
      return [["dispatched", "Mark as Dispatched", "default"]];
    case "dispatched":
      return [["fulfilled", "Mark as Delivered", "primary"]];
    default:
      return [];
  }
}
const AVAIL_LABEL: Record<string, string> = {
  available: "Available",
  out_of_stock: "Out of stock",
  coming_soon: "Coming soon",
  hidden: "Hidden",
};

function paymentLabelOf(m: string): string {
  return m === "cod" ? "Cash on Delivery" : m === "upi_qr" ? "UPI (Scan & Pay)" : "Online";
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editor, setEditor] = useState<AdminProduct | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      // Postgres pool handles concurrent reads; fetch sequentially for clarity.
      const oRes = await fetch("/api/admin/orders");
      const pRes = await fetch("/api/admin/products");
      if (!oRes.ok || !pRes.ok) {
        setError("Failed to load admin data");
        return;
      }
      setOrders(await oRes.json());
      setProducts(await pRes.json());
    } catch {
      setError("Failed to load admin data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Update failed");
      }
      setOrders((prev) =>
        prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const [orderTab, setOrderTab] = useState<string>("pending");
  const [paidSub, setPaidSub] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, paid: 0, packed: 0, dispatched: 0, fulfilled: 0, cancelled: 0 };
    orders?.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (orderTab === "paid") {
      if (paidSub === "packed") return orders.filter((o) => o.status === "packed");
      if (paidSub === "dispatched") return orders.filter((o) => o.status === "dispatched");
      return orders.filter((o) => o.status === "paid" || o.status === "packed" || o.status === "dispatched");
    }
    return orders.filter((o) => o.status === orderTab);
  }, [orders, orderTab, paidSub]);

  const pill = (active: boolean) =>
    `cursor-pointer rounded-full border-2 px-4 py-2 font-heading text-sm font-black uppercase tracking-wide transition-colors ${
      active ? "border-brand-dark bg-brand-dark text-brand-cream" : "border-brand-dark/30 bg-white text-brand-dark hover:border-brand-dark"
    }`;

  const actionBtn = (kind: string) =>
    kind === "danger"
      ? "cursor-pointer rounded-full border-2 border-red-700 px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      : kind === "primary"
        ? "cursor-pointer rounded-full border-2 border-brand-dark bg-brand-dark px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-brand-cream transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        : "cursor-pointer rounded-full border-2 border-brand-dark/40 bg-white px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-brand-dark transition-colors hover:border-brand-dark hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50";

  const waLink = (o: Order): string | null =>
    orderConfirmationLink({
      id: o.id.slice(0, 8).toUpperCase(),
      amount: o.amount,
      paymentLabel: paymentLabelOf(o.paymentMethod),
      customerName: o.customer?.name,
      phone: o.customer?.phone,
      items: o.items,
    });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">Azésa · Admin</p>
          <h1 className="mt-1 font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark">Orders</h1>
          <p className="mt-2 text-sm text-brand-dark/55">
            {orders ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={logout}
          className="cursor-pointer rounded-full border-2 border-brand-dark px-5 py-2 font-heading text-sm uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
        >
          Log out
        </button>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {!orders ? (
        <p className="text-brand-dark/55">Loading orders…</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {ORDER_TABS.map((tab) => {
              const n = tab.id === "paid" ? counts.paid + counts.packed + counts.dispatched : counts[tab.id] || 0;
              return (
                <button key={tab.id} type="button" onClick={() => setOrderTab(tab.id)} className={pill(orderTab === tab.id)}>
                  {tab.label}
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${orderTab === tab.id ? "bg-white/25" : "bg-brand-dark/10"}`}>{n}</span>
                </button>
              );
            })}
          </div>

          {orderTab === "paid" && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {PAID_SUB.map((s) => (
                <button key={s.id} type="button" onClick={() => setPaidSub(s.id)} className={pill(paidSub === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {filteredOrders.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-brand-dark/25 bg-[#fbf7ee] p-8 text-center text-brand-dark/55">
              {orderTab === "paid" ? "No paid orders here yet." : `No ${STATUS_LABEL[orderTab] ?? orderTab} orders here yet.`}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border-2 border-brand-dark bg-[#fbf7ee] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-sm font-black uppercase tracking-wide text-brand-dark">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="rounded-full border border-brand-dark/20 bg-white px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-brand-dark">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-dark/60">
                    {o.customer?.name || "Guest"} · {o.customer?.phone || "—"}{" "}
                    {o.customer?.email ? `· ${o.customer.email}` : ""}
                  </p>
                  <p className="text-sm text-brand-dark/60">{fmtDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl font-black text-brand-dark">₹{o.amount}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                    {o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentMethod === "upi_qr" ? "UPI (Scan & Pay)" : "Online"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-3 text-sm text-brand-dark/70">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {it.qty}× {it.productName}
                      </span>
                      <span className="text-brand-dark">₹{it.unitPrice * it.qty}</span>
                    </div>
                  ))}
                </div>
                {o.address && (
                  <div className="rounded-xl bg-white p-3 text-sm text-brand-dark/70">
                    {o.address.line1}{o.address.landmark ? `, ${o.address.landmark}` : ""}, {o.address.city}, {o.address.state} — {o.address.pincode}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {waLink(o) && (
                  <a
                    href={waLink(o)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center rounded-full border-2 border-[#25D366]/70 bg-[#25D366]/10 px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-[#128C4B] transition-colors hover:bg-[#25D366] hover:text-white"
                  >
                    WhatsApp confirm
                  </a>
                )}
                {actionsFor(o.status).map(([s, label, kind]) => (
                  <button key={s} type="button" disabled={busy === o.id} onClick={() => setStatus(o.id, s)} className={actionBtn(kind)}>
                    {busy === o.id ? "…" : label}
                  </button>
                ))}
                {actionsFor(o.status).length === 0 && (
                  <span className="rounded-full bg-white px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-brand-dark/50">
                    ✓ {STATUS_LABEL[o.status]}
                  </span>
                )}
              </div>
            </div>
          ))}
            </div>
          )}
        </>
      )}

      <div className="mt-14">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-black text-brand-dark">Products</h2>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="cursor-pointer rounded-full border-2 border-brand-dark bg-brand-dark px-4 py-2 font-heading text-xs font-black uppercase tracking-wide text-brand-cream shadow-[2px_2px_0_0_#1c1109] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            + Add product
          </button>
        </div>
        {products ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-2xl border-2 border-brand-dark/20 bg-[#fbf7ee] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-heading truncate text-brand-dark">{p.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/45">
                    {p.type} · ₹{p.price}
                    {p.availability !== "available" ? ` · ${AVAIL_LABEL[p.availability] ?? p.availability}` : ""}
                    {" · "}
                    {p.stock > 0 ? `${p.stock} in stock` : "0 stock"}
                    {p.images?.length ? ` · ${p.images.length} img` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditor(p)}
                  className="shrink-0 cursor-pointer rounded-full border-2 border-brand-dark px-3.5 py-1.5 font-heading text-xs font-black uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-brand-dark/55">Loading products…</p>
        )}
      </div>

      {(editor || adding) && (
        <ProductEditor
          product={editor}
          onClose={() => {
            setEditor(null);
            setAdding(false);
          }}
          onSaved={() => {
            load();
            setEditor(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
