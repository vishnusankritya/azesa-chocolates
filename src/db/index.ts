import { Pool } from "pg";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

const usePglite = process.env.USE_PGLITE === "1";

// Both drivers build identical SQL; only the connection differs.
export const db = (usePglite
  ? drizzlePglite(new PGlite({ dataDir: ".pglite-data" }), { schema })
  : drizzlePg(new Pool({ connectionString: process.env.DATABASE_URL! }), {
      schema,
    })) as NodePgDatabase<typeof schema>;

export type DB = typeof db;
export { schema as dbSchema };
