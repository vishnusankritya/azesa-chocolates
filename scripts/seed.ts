/* DB init + seed for Postgres. Run: DATABASE_URL=... node scripts/seed.ts */
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { products as productsTable } from "../src/db/schema";
import { products as catalog } from "../src/data/products";

const DDL = `
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  price int NOT NULL,
  mrp int,
  accent_color text,
  ingredient text,
  tagline text,
  description text,
  occasion text,
  contents jsonb,
  image_url text,
  images jsonb,
  availability text NOT NULL DEFAULT 'available',
  stock int NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort int NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  email text,
  is_role_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  line1 text NOT NULL,
  landmark text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  guest_phone text,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payment_id text,
  amount int NOT NULL,
  shipping_address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price int NOT NULL,
  qty int NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  status text NOT NULL,
  amount int NOT NULL,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
`;

async function main() {
  console.log("Creating schema...");
  const statements = DDL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.execute(sql.raw(stmt));
  }

  console.log(`Seeding ${catalog.length} products...`);
  for (const p of catalog) {
    await db.execute(
      sql.raw(`
        INSERT INTO products (slug, name, type, price, mrp, accent_color, ingredient, tagline, description, occasion, contents, image_url, images, availability, stock)
        VALUES (
          '${p.id.toLowerCase().replace(/['"\\]/g, "")}',
          '${p.name.replace(/'/g, "''")}',
          '${p.type}',
          ${p.price},
          ${p.mrp ?? null},
          '${p.accentColor}',
          '${(p.ingredient ?? "").replace(/'/g, "''")}',
          '${(p.tagline ?? "").replace(/'/g, "''")}',
          '${(p.tagline ?? "").replace(/'/g, "''")}',
          '${(p.occasion ?? "").replace(/'/g, "''")}',
          ${p.contents ? `'${JSON.stringify(p.contents).replace(/'/g, "''")}'::jsonb` : "NULL"},
          '${p.image ?? ""}',
          '${JSON.stringify(p.image ? [p.image] : []).replace(/'/g, "''")}'::jsonb,
          'available',
          40
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name, type = EXCLUDED.type, price = EXCLUDED.price,
          mrp = EXCLUDED.mrp, accent_color = EXCLUDED.accent_color,
          ingredient = EXCLUDED.ingredient, tagline = EXCLUDED.tagline,
          description = EXCLUDED.description, occasion = EXCLUDED.occasion,
          contents = EXCLUDED.contents, image_url = EXCLUDED.image_url,
          images = EXCLUDED.images, availability = EXCLUDED.availability,
          stock = EXCLUDED.stock
      `)
    );
  }

  const rows = await db.select({ id: productsTable.id }).from(productsTable);
  console.log(`Done. Products in DB: ${rows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
