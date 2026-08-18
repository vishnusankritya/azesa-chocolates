import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { serial } from "@/db/mutex";
import { products as productsTable } from "@/db/schema";
import { rowToProduct, type CatalogProduct, type ProductRow } from "@/lib/catalog";

export async function getProducts(): Promise<CatalogProduct[]> {
  const rows = await serial(() =>
    db
      .select()
      .from(productsTable)
      .where(eq(productsTable.active, true))
      .orderBy(productsTable.createdAt)
  );
  return (rows as unknown as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const [row] = await serial(() =>
    db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.active, true), eq(productsTable.slug, slug)))
      .limit(1)
  );
  return row ? rowToProduct(row as unknown as ProductRow) : null;
}
