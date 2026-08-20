import { Pool } from "pg";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Postgres-only data layer (Supabase / managed Postgres).
// `DATABASE_URL` must be set in the environment (Vercel, local, CI).
// The `pg` Pool hands out a connection per query, so concurrent SSR renders
// and /api fetches are safe without any manual serialization (unlike the old
// single-connection PGlite driver).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzlePg(pool, { schema }) as NodePgDatabase<typeof schema>;

export type DB = typeof db;
export { schema as dbSchema };
