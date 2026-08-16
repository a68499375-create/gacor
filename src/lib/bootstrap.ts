// Ensures database tables and seed data are present. Called once per cold start.
import "server-only";
import { initializeDatabase } from "@/db/migrate";
import { seedIfEmpty } from "@/db/seed";

let done = false;
export async function ensureSeeded() {
  if (done) return;
  done = true;
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }
  try {
    await seedIfEmpty();
  } catch (e) {
    // Non-blocking
  }
}
