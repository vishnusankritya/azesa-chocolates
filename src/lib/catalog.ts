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
  availability: string;
  stock: number;
};

export function rowToProduct(p: ProductRow): CatalogProduct {
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
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
    availability: (p.availability as CatalogProduct["availability"]) ?? "available",
    stock: p.stock ?? 0,
  };
}
