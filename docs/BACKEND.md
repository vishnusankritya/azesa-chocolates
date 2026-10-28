# Azesa Backend — Design

Custom Node.js API on Next.js Route Handlers, deployed on **Vercel** alongside the Next.js app.

> This document describes the system as it is implemented today. Where an earlier
> design decision was superseded, the current behaviour is what is documented here.

## 1. Stack & why

| Layer | Choice | Why |
|---|---|---|
| API | **Next.js Route Handlers** (Node runtime) | Custom logic runs as Vercel serverless functions — single deploy with the frontend, scales per-request, 0 servers to run. Vercel doesn't host long-lived Express processes; Route Handlers are the idiomatic "custom Node API" there. |
| Database | **Postgres** (Neon / Supabase / any managed host) via the `pg` connection pool | Managed, auto-scaling Postgres with branching + PITR. One Postgres dialect, so any other host (Supabase DB / RDS / Railway) is a drop-in swap. |
| Migrations | **Drizzle ORM** + `drizzle-kit` | Type-safe schema + migrations. |
| Auth | **Signed HMAC session cookie** (httpOnly) + **RBAC** (`admin` / `customer`) | No external auth dependency; fits "more control, more ops". `bcryptjs` for admin password verification. |
| Payments | **UPI Scan & Pay** (QR) — no gateway | Customers pay by scanning a UPI QR. Orders stay `pending` until the admin marks them paid. Razorpay remains wired as an optional gateway and webhook path for a future switch. |
| Validation | **zod** on every route | Runtime input safety. |
| Storage | **Vercel Blob** (product images) | Serverless object storage with CDN-served public URLs. Images are compressed to WebP server-side with `sharp` before upload. |

Rationale vs Supabase-BaaS: you chose custom control — we own the API, schema, and auth, and only rent managed Postgres + Blob.

## 2. Architecture

```
Browser ──▶ Next.js (Vercel)
              ├─ Static/ISR pages (catalog, product, home)  ── CDN
              └─ /api/*  Route Handlers (Node, custom logic)
                     │
                     ├─▶ Postgres (Neon)   — products, orders, customers
                     ├─▶ Vercel Blob      — product images (WebP, via sharp)
                     └─▶ UPI QR           — customer pays by scanning
Admin (Next.js /admin) ──▶ /api/admin/* (session cookie + role=admin)
```

**Why Route Handlers over a separate Express server:** Vercel is serverless — one shared deploy, per-request scaling, cold starts on the Node runtime only. A parallel Express service would need its own host and double the ops. You still write every endpoint by hand (full control) — Express-style routing, just colocated.

## 3. Data model (Postgres)

Defined in `src/db/schema.ts`:

```sql
-- Catalog
products(id uuid pk default gen_random_uuid(), slug text unique not null,
         name text not null, type text not null,          -- chocolate|cookie|hamper
         price int not null, mrp int, accent_color text,
         ingredient text, tagline text, description text, occasion text,
         contents jsonb, image_url text, images jsonb,      -- images[] = gallery
         availability text not null default 'available',  -- available|out_of_stock|coming_soon|hidden
         stock int not null default 0,
         created_at timestamptz default now(), updated_at timestamptz default now());

categories(id uuid pk, slug text unique, name text, sort int);
product_categories(product_id uuid fk, category_id uuid fk, pk(product_id, category_id));

-- Commerce
customers(id uuid pk, name text, phone text, email text,
          is_role_admin bool default false, created_at timestamptz);

addresses(id uuid pk, customer_id uuid fk, line1 text, landmark text,
          city text, state text, pincode text, is_default bool);

orders(id uuid pk, customer_id uuid fk null, guest_phone text,
       status text,        -- pending|paid|packed|dispatched|fulfilled|cancelled
       payment_method text, -- upi_qr|online
       payment_id text, amount int,
       shipping_address_id uuid fk, created_at timestamptz);

order_items(id uuid pk, order_id uuid fk, product_id uuid fk,
            product_name text, unit_price int, qty int);   -- snapshot price/name

payments(id uuid pk, order_id uuid fk, razorpay_order_id text unique,
         razorpay_payment_id text, status text, amount int, raw jsonb,
         created_at timestamptz);
```

Indexes: `orders(customer_id, created_at)`, `orders(payment_id)`, `products(slug)`,
`order_items(order_id)`, `payments(razorpay_order_id)`.
**Never store card number/CVV/expiry** — no card data touches our server.

## 4. API surface (`src/app/api`)

Public / guest:
- `GET /api/products` — catalog, non-hidden products, availability-sorted
- `GET /api/products/[slug]` — single product
- `POST /api/checkout` — body: `{ items, customer, address, payment }`
  → creates order + customer/address, returns the order id + UPI QR payload
- `POST /api/payments/razorpay-webhook` — optional gateway path; verifies the
  `x-razorpay-signature` HMAC and marks the order paid on `payment.captured`

Admin (session cookie + `role=admin`):
- `POST /api/admin/login`, `POST /api/admin/logout`
- `GET /api/admin/products`, `POST /api/admin/products`, `PUT /api/admin/products/[slug]`
- `POST /api/admin/products/upload` — image upload (sharp-compressed → WebP → Vercel Blob)
- `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]` — status workflow

## 5. Auth & security

- **Sessions:** HMAC-signed token in an httpOnly, SameSite cookie (`azesa_session`); admin routes 401 otherwise. Signature + expiry are both verified server-side.
- **RBAC:** `role` claim → admin routes require `role=admin`.
- **Server-side only secrets:** `NEXT_PUBLIC_*` = nothing sensitive; DB creds, `BLOB_READ_WRITE_TOKEN`, `RAZORPAY_KEY_SECRET`, `SESSION_SECRET` in Vercel env.
- **Validation:** zod on every `/api/*` body/query.
- **Payments:** UPI QR is the live method — no gateway, no card data. The optional Razorpay path verifies webhook HMAC server-side.
- **Rate limiting:** per-IP on login and upload.
- **SQL injection:** Drizzle parameterized — no string concat.
- **Origin checks:** mutating routes reject cross-origin requests.
- **Dev bypass:** `ADMIN_BYPASS=1` opens `/admin` without a login. Hard-disabled when `NODE_ENV=production`.

## 6. Scaling & performance

- **Reads:** catalog pages are **ISR/static** (`revalidate` 5m) + CDN edge cache — most traffic never hits the DB.
- **Images:** all product art is stored as WebP. `next/image` serves responsive, modern formats; `src/lib/catalog.ts` remaps legacy `.png` DB paths to their `.webp` equivalents so existing rows don't 404. Admin uploads are compressed server-side (1024px cap, WebP q80) before being written to Vercel Blob.
- **DB:** the `pg` pool handles concurrent queries natively, so no query serialization is needed. `serial()` in `src/db/mutex.ts` is a compatibility passthrough retained for existing call sites.
- **Writes:** checkout is the hot path → single transaction, idempotent, webhook-driven.
- **API:** Route Handlers scale per-request; keep functions small so cold starts stay low.
- **Observability:** Vercel logs; `requests`-style trace headers on orders.

## 7. Repo layout (as implemented)

```
src/
  app/            # pages + API route handlers (products, checkout, payments, admin)
  components/     # storefront + admin UI
  context/        # cart state
  data/           # static catalog (seed source of truth)
  db/             # drizzle client, schema.ts, mutex.ts
  lib/            # auth, catalog mapping, razorpay, security, upi, validators, whatsapp
  server/         # server-side catalog queries (ISR-friendly)
scripts/          # seed.ts, png-to-webp.mjs, check-orders.ts
docs/BACKEND.md   # this doc
```

## 8. Local development

Postgres runs in Docker:

```bash
docker compose up -d          # Postgres on :5432
DATABASE_URL=postgres://azesa:azesa@localhost:5432/azesa npx tsx scripts/seed.ts
npm run dev
```

`npm run dev` honours the `PORT` env var. On Windows, Docker/WSL often reserves
port 3000, which makes the dev server fail with `EACCES` — run `PORT=4000 npm run dev`
(or `npm run dev -- -p 4000`) in that case.

## 9. Deployment notes

- **DB host:** any managed Postgres. Neon recommended; Supabase-Postgres or standalone OK (same schema, swap connection).
- **Payments:** UPI Scan & Pay is live. Razorpay keys are optional and only needed if the gateway path is switched on.
- **Admin access:** `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt). Generate a hash with:
  `npx tsx -e "console.log(require('bcryptjs').hashSync('PASSWORD',10))"`
- **Env/secrets:** these must live in Vercel, not committed.
