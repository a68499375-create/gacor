import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { Pool as PgPool } from "pg";
import path from "path";
import os from "os";

type AnyDb = ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | ReturnType<typeof drizzlePglite>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaDb?: AnyDb;
  __arenaPglite?: PGlite;
};

function initDb(): AnyDb {
  if (globalForDb.__arenaDb) {
    return globalForDb.__arenaDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  // 1. Neon HTTP Serverless Connection (Optimal for Vercel & Edge - 100% Stateless & Reliable via HTTPS fetch)
  if (databaseUrl && databaseUrl.includes("neon.tech")) {
    try {
      const sql = neon(databaseUrl);
      const db = drizzleNeon(sql);
      globalForDb.__arenaDb = db;
      return db;
    } catch (e) {
      console.warn("Neon HTTP connection failed, falling back:", e);
    }
  }

  // 2. Standard Remote PostgreSQL (Supabase, Railway, etc.)
  if (databaseUrl && !databaseUrl.includes("pglite") && !databaseUrl.includes("127.0.0.1:5432/app_db") && !databaseUrl.includes("localhost:5432/app_db")) {
    try {
      const pool = new PgPool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false },
      });
      const db = drizzlePg(pool);
      globalForDb.__arenaDb = db;
      return db;
    } catch (e) {
      console.warn("PostgreSQL connection failed, falling back to embedded PGlite:", e);
    }
  }

  // 3. Fallback to in-memory/temp PGlite (Safe on Vercel /tmp filesystem)
  try {
    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const dataDir = isServerless ? path.join(os.tmpdir(), ".pgdata") : path.join(process.cwd(), ".pgdata");
    const pglite = globalForDb.__arenaPglite ?? new PGlite(dataDir);
    globalForDb.__arenaPglite = pglite;
    const db = drizzlePglite(pglite);
    globalForDb.__arenaDb = db;
    return db;
  } catch {
    const pglite = globalForDb.__arenaPglite ?? new PGlite();
    globalForDb.__arenaPglite = pglite;
    const db = drizzlePglite(pglite);
    globalForDb.__arenaDb = db;
    return db;
  }
}

export const db = initDb();
