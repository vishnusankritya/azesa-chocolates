# Azesa Chocolates

Marketing site for Azesa Chocolates — handcrafted chocolates and cookies made in Katihar, Bihar.

## Getting Started

The app needs a Postgres database. One is provided via Docker:

```bash
docker compose up -d
DATABASE_URL=postgres://azesa:azesa@localhost:5432/azesa npx tsx scripts/seed.ts
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

If port 3000 is unavailable — on Windows, Docker Desktop and WSL reserve blocks of
ports and binding one fails with `EACCES` — the dev script automatically picks the
next free port and prints it. To choose a specific one:

```bash
PORT=4000 npm run dev
```

## Other commands

```bash
npm run build   # production build
npm run lint    # eslint (src + scripts)
```

See [docs/BACKEND.md](docs/BACKEND.md) for the architecture, data model, and API surface.
