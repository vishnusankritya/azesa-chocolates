import { Pool } from "pg";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

const usePglite = process.env.USE_PGLITE === "1";

// Hoist the PGlite client (and mutex queue) onto globalThis. In dev, Turbopack
// gives each route handler its own module graph, so a module-level PGlite would
// be constructed per route -> multiple instances over one .pglite-data -> writes
// land in one instance and reads see another (stale). globalThis keeps ONE
// instance across every route in the process.
type G = typeof globalThis & {
  __azesaPglite?: PGlite;
};

function getPglite(): PGlite {
  const g = globalThis as G;
  if (!g.__azesaPglite) g.__azesaPglite = new PGlite({ dataDir: ".pglite-data" });
  return g.__azesaPglite;
}

// Both drivers build identical SQL; only the connection differs.
export const db = (usePglite
  ? drizzlePglite(getPglite(), { schema })
  : drizzlePg(new Pool({ connectionString: process.env.DATABASE_URL! }), { schema })) as NodePgDatabase<typeof schema>;

export type DB = typeof db;
export { schema as dbSchema };
