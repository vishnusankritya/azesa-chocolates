export interface CatalogProduct {
  id: string; // slug
  name: string;
  price: number;
  mrp?: number;
  type: "chocolate" | "cookie" | "hamper";
  accentColor?: string;
  ingredient?: string;
  tagline?: string;
  occasion?: string;
  contents?: string[];
  image?: string;
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
  occasion: string | null;
  contents: string[] | null;
  imageUrl: string | null;
  active: boolean;
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
    ...(p.occasion ? { occasion: p.occasion } : {}),
    ...(p.contents ? { contents: p.contents } : {}),
    ...(p.imageUrl ? { image: p.imageUrl } : {}),
  };
}
