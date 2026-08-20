export interface CatalogProduct {
  id: string; // slug
  name: string;
  price: number;
  mrp?: number;
  type: "chocolate" | "cookie" | "hamper";
  accentColor?: string;
  ingredient?: string;
  tagline?: string;
  description?: string;
  occasion?: string;
  contents?: string[];
  image?: string;
  images?: string[];
  availability?: "available" | "out_of_stock" | "coming_soon" | "hidden";
  stock?: number;
}

export type ProductRow = {
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
  availability: string;
  stock: number;
};

const webp = (u: string) => u.replace(/\.png$/i, ".webp");

export function rowToProduct(p: ProductRow): CatalogProduct {
  // Image optimization: all product art converted PNG→WebP (≈90% smaller).
  // Remap any legacy .png path stored in the DB to the new .webp asset so
  // existing deployments don't 404.
  const imageUrl = p.imageUrl ? webp(p.imageUrl) : null;
  const images = p.images?.filter(Boolean).map(webp) ?? null;
  return {
    id: p.slug,
    name: p.name,
    price: p.price,
    ...(p.mrp ? { mrp: p.mrp } : {}),
    type: p.type as CatalogProduct["type"],
    ...(p.accentColor ? { accentColor: p.accentColor } : {}),
    ...(p.ingredient ? { ingredient: p.ingredient } : {}),
    ...(p.tagline ? { tagline: p.tagline } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(p.occasion ? { occasion: p.occasion } : {}),
    ...(p.contents ? { contents: p.contents } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(images?.length ? { images } : {}),
    availability: (p.availability as CatalogProduct["availability"]) ?? "available",
    stock: p.stock ?? 0,
  };
}
