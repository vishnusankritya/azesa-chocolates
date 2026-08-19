"use client";

import { useState } from "react";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  mrp: number | null;
  accentColor: string | null;
  ingredient: string | null;
  tagline: string | null;
  description: string | null;
  occasion: string | null;
  contents: string[] | null;
  imageUrl: string | null;
  images: string[] | null;
  active: boolean;
};

const TYPES = [
  ["chocolate", "Chocolate"],
  ["cookie", "Cookie"],
  ["hamper", "Hamper"],
  ["pinata", "Piñata"],
] as const;

const inputCls =
  "w-full rounded-xl border-2 border-brand-dark/20 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-dark focus:outline-none";

const labelCls = "mb-1 block font-heading text-[11px] font-black uppercase tracking-wide text-brand-dark/60";

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-3 py-1.5 font-heading text-xs font-black uppercase tracking-wide transition-colors ${
        on
          ? "border-brand-dark bg-brand-dark text-brand-cream"
          : "border-brand-dark/25 bg-white text-brand-dark/50"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "bg-brand-orange" : "bg-neutral-300"}`}
      />
      {label}
    </button>
  );
}

interface Props {
  product: AdminProduct | null; // null => create new
  onSaved: () => void;
  onClose: () => void;
}

export default function ProductEditor({ product, onSaved, onClose }: Props) {
  const [f, setF] = useState({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    type: product?.type ?? "chocolate",
    price: product?.price?.toString() ?? "",
    mrp: product?.mrp?.toString() ?? "",
    accentColor: product?.accentColor ?? "",
    ingredient: product?.ingredient ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    occasion: product?.occasion ?? "",
    contents: (product?.contents ?? []).join(", "),
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? (product?.imageUrl ? [product.imageUrl] : []));
  const [newUrl, setNewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const addUrl = () => {
    const u = newUrl.trim();
    if (u && !images.includes(u)) setImages((i) => [...i, u]);
    setNewUrl("");
  };

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setImages((i) => [...i, data.url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    const price = Number(f.price);
    const mrp = f.mrp ? Number(f.mrp) : null;
    if (!f.name.trim() || Number.isNaN(price)) {
      setError("Name and a valid price are required.");
      setBusy(false);
      return;
    }
    // First image is the storefront primary.
    const imageUrl = images[0] ?? null;
    const payload = {
      slug: f.slug.trim(),
      name: f.name.trim(),
      type: f.type,
      price,
      mrp: mrp && mrp > 0 ? mrp : null,
      accentColor: f.accentColor.trim() || null,
      ingredient: f.ingredient.trim() || null,
      tagline: f.tagline.trim() || null,
      description: f.description.trim() || null,
      occasion: f.occasion.trim() || null,
      contents: f.contents.split(",").map((s) => s.trim()).filter(Boolean).length
        ? f.contents.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      imageUrl,
      images: images.length ? images : null,
      active: f.active,
    };
    const isNew = !product;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${product.slug}`;
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-start overflow-y-auto bg-[#1c1109]/60 p-4 backdrop-blur-sm md:place-items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-6 w-full max-w-2xl rounded-3xl border-2 border-brand-dark bg-brand-cream p-6 shadow-[6px_6px_0_0_#1c1109] md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-heading text-sm font-black uppercase tracking-[0.15em] text-[#f47920]">Azésa · Admin</p>
            <h2 className="mt-1 font-heading text-2xl font-black text-brand-dark">
              {product ? `Edit · ${product.name}` : "Add product"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            className="cursor-pointer rounded-full border-2 border-brand-dark px-2.5 text-xl leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} value={f.name} onChange={set("name")} placeholder="Product name" />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input className={inputCls} value={f.slug} onChange={set("slug")} placeholder="mango" />
          </div>
          <div>
            <label className={labelCls}>Category / tag</label>
            <select className={inputCls} value={f.type} onChange={set("type")}>
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Availability</label>
            <div className="flex gap-2 pt-0.5">
              <Toggle on={f.active} onChange={(v) => setF((p) => ({ ...p, active: v }))} label={f.active ? "Available" : "Hidden"} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Price (₹)</label>
            <input className={inputCls} value={f.price} onChange={set("price")} inputMode="numeric" placeholder="319" />
          </div>
          <div>
            <label className={labelCls}>MRP (₹, optional)</label>
            <input className={inputCls} value={f.mrp} onChange={set("mrp")} inputMode="numeric" placeholder="399" />
          </div>
          <div>
            <label className={labelCls}>Ingredient</label>
            <input className={inputCls} value={f.ingredient} onChange={set("ingredient")} placeholder="Alphonso Mango" />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input className={inputCls} value={f.tagline} onChange={set("tagline")} placeholder="Sweet, tropical" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={f.description} onChange={set("description")} placeholder="What makes it special…" />
          </div>
          <div>
            <label className={labelCls}>Accent colour</label>
            <input className={inputCls} value={f.accentColor} onChange={set("accentColor")} placeholder="#facc15" />
          </div>
          <div>
            <label className={labelCls}>Occasion</label>
            <input className={inputCls} value={f.occasion} onChange={set("occasion")} placeholder="Rakhi, Valentine's…" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Contents (comma-separated, for hampers)</label>
            <input className={inputCls} value={f.contents} onChange={set("contents")} placeholder="Chocolate bar, cookies…" />
          </div>
        </div>

        <div className="mt-6">
          <label className={labelCls}>Images ({images.length}) — first is the storefront image</label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-brand-dark bg-white">
                <img src={img} alt="" className="h-full w-full object-contain p-1" loading="lazy" decoding="async" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((i) => i.filter((_, n) => n !== idx))}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-brand-dark bg-brand-dark text-xs font-black text-brand-cream"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-brand-dark/25 text-center font-heading text-[10px] uppercase tracking-wide text-brand-dark/40">
                No images
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input className={inputCls + " sm:max-w-xs"} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Paste image URL" />
            <button type="button" onClick={addUrl} className="cursor-pointer rounded-full border-2 border-brand-dark bg-brand-dark px-4 py-2 font-heading text-xs font-black uppercase tracking-wide text-brand-cream transition-colors hover:bg-brand-cream hover:text-brand-dark">
              Add URL
            </button>
            <label className="cursor-pointer rounded-full border-2 border-brand-dark px-4 py-2 font-heading text-xs font-black uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream">
              {busy ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="cursor-pointer rounded-full border-2 border-brand-dark px-5 py-2 font-heading text-sm uppercase tracking-wide text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className="cursor-pointer rounded-full border-2 border-brand-dark bg-brand-dark px-6 py-2 font-heading text-sm font-black uppercase tracking-wide text-brand-cream shadow-[3px_3px_0_0_#1c1109] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60">
            {busy ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

