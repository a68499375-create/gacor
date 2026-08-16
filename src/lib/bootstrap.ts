// Ensures database tables and seed data are present. Called once per cold start.
import "server-only";
import { initializeDatabase } from "@/db/migrate";
import { seedIfEmpty } from "@/db/seed";

let done = false;
export async function ensureSeeded() {
  if (done) return;
  // Skip during build phase so Cloudflare CI builds in seconds without DB network roundtrip
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }
  try {
    await initializeDatabase();
    await seedIfEmpty();
    done = true;
  } catch (e) {
    // Non-blocking
  }
}
