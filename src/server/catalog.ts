import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { products as productsTable } from "@/db/schema";
import { rowToProduct, type CatalogProduct, type ProductRow } from "@/lib/catalog";

const AVAIL_RANK: Record<string, number> = {
  available: 0,
  coming_soon: 1,
  out_of_stock: 2,
};

export async function getProducts(): Promise<CatalogProduct[]> {
  const rows = await serial(() =>
    db
      .select()
      .from(productsTable)
      .where(ne(productsTable.availability, "hidden"))
      .orderBy(productsTable.createdAt)
  );
  const list = (rows as unknown as ProductRow[]).map(rowToProduct);
  // Available/in-stock first, "coming soon" next, out-of-stock last. Stable
  // sort preserves the original createdAt order within each group.
  return list.sort(
    (a, b) =>
      (AVAIL_RANK[a.availability ?? "available"] ?? 0) -
      (AVAIL_RANK[b.availability ?? "available"] ?? 0)
  );
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const [row] = await serial(() =>
    db
      .select()
      .from(productsTable)
      .where(and(ne(productsTable.availability, "hidden"), eq(productsTable.slug, slug)))
      .limit(1)
  );
  return row ? rowToProduct(row as unknown as ProductRow) : null;
}
