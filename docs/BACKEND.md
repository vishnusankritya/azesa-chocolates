# Azesa Backend — Design

Custom Node.js API + serverless Postgres, deployed on **Vercel** alongside the Next.js app.

## 1. Stack & why

| Layer | Choice | Why |
|---|---|---|
| API | **Next.js Route Handlers** (Node runtime) | Custom logic runs as Vercel serverless functions — single deploy with the frontend, scales per-request, 0 servers to run. Vercel doesn't host long-lived Express processes; Route Handlers are the idiomatic "custom Node API" there. |
| Database | **Vercel Postgres (Neon, serverless)** | Managed, auto-scaling Postgres with branching + PITR. First-class Vercel integration (env vars auto-injected). Same Postgres so any other host (Supabase DB / RDS / Railway) is a drop-in swap. |
| Migrations | **Drizzle ORM** + `drizzle-kit` | Type-safe schema + migrations; already in-progress in sibling projects. |
| Auth | **JWT (signed, httpOnly cookies)** via a lightweight helper; **RBAC roles** (admin / customer / guest) | No external auth dependency; fits "more control, more ops". Admin + customer sessions. |
| Payments | **Razorpay** (India) | Server-side order + webhook `payment.captured`. **Card data never touches our server** (Razorpay handles PCI) — resolves the current demo-checkout P0. |
| Validation | **zod** on every route | Runtime input safety. |
| Storage | **Vercel Blob** (product images, admin uploads) | Serverless object storage with signed URLs. |

Rationale vs Supabase-BaaS: you chose custom control — we own the API, schema, and auth, and only rent managed Postgres + Blob.

## 2. Architecture

```
Browser ──▶ Next.js (Vercel)
             ├─ Static/ISR pages (catalog, product, home)  ── CDN
             └─ /api/*  Route Handlers (Node, custom logic)
                    │
                    ├─▶ Vercel Postgres (Neon)   — products, orders, customers
                    ├─▶ Razorpay (order + card token)  ──▶ webhook → mark paid
                    └─▶ Vercel Blob             — product images
Admin (Next.js /admin) ──▶ /api/admin/* (JWT + role=admin, RLS-equivalent checks)
```

**Why Route Handlers over a separate Express server:** Vercel is serverless — one shared deploy, per-request scaling, cold starts on the Node runtime only. A parallel Express service would need its own host and double the ops. You still write every endpoint by hand (full control) — Express-style routing, just colocated.

## 3. Data model (Postgres)

```sql
-- Catalog
products(id uuid pk default gen_random_uuid(), slug text unique not null,
         name text not null, type text not null,          -- chocolate|cookie|hamper
         price int not null, mrp int, accent_color text,
         ingredient text, tagline text, occasion text, contents jsonb,
         image_url text, active bool default true,
         created_at timestamptz default now(), updated_at timestamptz default now());

categories(id uuid pk, slug text unique, name text, sort int);

product_categories(product_id uuid fk, category_id uuid fk, pk(product_id, category_id));

-- Commerce
customers(id uuid pk, name text, phone text, email text,
          is_role_admin bool default false, created_at timestamptz);

addresses(id uuid pk, customer_id uuid fk, line1 text, city text, state text,
          pincode text, is_default bool);

orders(id uuid pk, customer_id uuid fk null, guest_phone text, status text, -- pending|paid|fulfilled|cancelled
       payment_method text, payment_id text, amount int,
       shipping_address_id uuid fk, created_at timestamptz);

order_items(id uuid pk, order_id uuid fk, product_id uuid fk,
            product_name text, unit_price int, qty int);           -- snapshot price/name

payments(id uuid pk, order_id uuid fk, razorpay_order_id text unique,
         razorpay_payment_id text, status text, amount int, raw jsonb,
         created_at timestamptz);
```

Indexes: `orders(customer_id, created_at)`, `orders(payment_id)`, `products(slug)`,
`order_items(order_id)`, `payments(razorpay_order_id)`.
**Never store card number/CVV/expiry** — Razorpay only.

## 4. API surface (`src/app/api`)

Public / guest:
- `GET /api/products?type=&category=&page=` — paginated, cached (CDN)
- `GET /api/products/[slug]`
- `POST /api/cart/checkout` — body: { items, customer, address, payment: "razorpay"|"cod" }
  → creates order + customer/address, calls Razorpay, returns `razorpay_order_id` + (for COD) plain order
- `POST /api/payments/razorpay-webhook` — verify `x-razorpay-signature`, mark order paid, notify

Customer (JWT):
- `GET /api/me`, `GET /api/orders`, `GET /api/orders/[id]` — owner-scoped

Admin (JWT role=admin):
- `POST/PATCH/DELETE /api/admin/products`, `PUT /api/admin/products/[slug]`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]` (fulfill/cancel)
- `POST /api/admin/images` (Vercel Blob upload)

## 5. Auth & security

- **Sessions:** JWT in httpOnly, SameSite=Strict cookie; CSRF guard on mutating routes.
- **RBAC:** `customers.is_role_admin` claim → admin routes 422/403 otherwise.
- **Server-side only secrets:** `NEXT_PUBLIC_*` = nothing sensitive; `SERVICE/DB` creds, `RAZORPAY_KEY_SECRET`, JWT secret in Vercel env.
- **Validation:** zod on every `/api/*` body/query; reject unknown keys.
- **Payments:** Razorpay orders created server-side; webhook signature verified with HMAC; idempotent order status transitions; **no card data in our DB**.
- **Rate limiting:** per-IP/route on checkout + auth (in-memory/Redis optional).
- **SQL injection:** Drizzle parameterized — no string concat.
- **Data scoping:** every query filters by logged-in owner; no mass object round-trips (select explicit columns).

## 6. Scaling & performance

- **Reads:** catalog pages are **ISR/static** (`revalidate` on product change) + CDN edge cache — most traffic never hits the DB.
- **DB:** Neon autoscaling + connection pooling (PgBouncer); indexes above; pagination (keyset/cursor) on lists.
- **Writes:** checkout is the hot path → single transaction, idempotent, webhook-driven.
- **API:** Route Handlers scale per-request; keep functions small so cold starts stay low.
- **Images:** `next/image` from Vercel Blob (already in the audit's perf list).
- **Observability:** Vercel logs + Sentry (errors) + a `requests`-style trace header on orders.

## 7. Migration plan (from current state)

1. **Seed:** write a Drizzle seed that inserts the 16 `products.ts` entries (copy fields 1:1) — catalog now DB-driven; keep the static file as a fallback source of truth during migration.
2. **Routes:** swap `products.ts` reads → Server Component fetch from `/api/products` (or a shared data layer) with ISR.
3. **Checkout:** replace the demo UI with → server order + Razorpay checkout → webhook → success screen (resolve the audit P0).
4. **Admin:** `/admin` with login → product CRUD + order management.
5. **Cleanup:** delete hardcoded `products.ts` accumulation once seed + admin are live; remove "demo checkout" note.

## 8. Recommended repo layout (inside this app)

```
src/
  app/api/            # route handlers (products, orders, checkout, payments, admin)
  lib/db/             # drizzle client, schema.ts, seed
  lib/auth/           # jwt, session, roles, middleware
  lib/payments/       # razorpay client + webhook verify
  lib/validators/     # zod schemas
  lib/cart/           # shared totals/qty clamp logic
  admin/              # admin dashboard (protected)
docs/BACKEND.md       # this doc
```

## 9. Decisions still to confirm

- **DB host:** Vercel Postgres (Neon) recommended; Supabase-Postgres or standalone OK (same schema, swap connection).
- **Payments:** Razorpay (recommended for India) — confirm live API keys + account.
- **Admin access:** which email/phone becomes the first admin.
- **CDN/domain:** custom domain for `azesa` on Vercel before switching live traffic.
- **Env/secrets:** these must live in Vercel, not committed.
