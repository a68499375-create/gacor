import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "path";

type AnyDb = ReturnType<typeof drizzlePg> | ReturnType<typeof drizzlePglite>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaDb?: AnyDb;
  __arenaPool?: Pool;
  __arenaPglite?: PGlite;
};

function initDb(): AnyDb {
  if (globalForDb.__arenaDb) {
    return globalForDb.__arenaDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is set to a remote / external postgres (and not 'pglite' or local default)
  if (databaseUrl && !databaseUrl.includes("pglite") && !databaseUrl.includes("127.0.0.1:5432/app_db") && !databaseUrl.includes("localhost:5432/app_db")) {
    try {
      const pool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false },
      });
      globalForDb.__arenaPool = pool;
      const db = drizzlePg(pool);
      globalForDb.__arenaDb = db;
      return db;
    } catch (e) {
      console.warn("PostgreSQL connection failed, falling back to embedded PGlite:", e);
    }
  }

  // Use embedded PGlite database with persistent storage in .pgdata
  const dataDir = path.join(process.cwd(), ".pgdata");
  const pglite = globalForDb.__arenaPglite ?? new PGlite(dataDir);
  globalForDb.__arenaPglite = pglite;
  const db = drizzlePglite(pglite);
  globalForDb.__arenaDb = db;
  return db;
}

export const db = initDb();
