"use server";

import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { eq, gt, sql } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Simple PostgreSQL-backed rate limiter for login attempts.
export async function checkLoginRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; lockedUntil?: Date }> {
  try {
    const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
    const now = new Date();

    if (row?.lockedUntil && row.lockedUntil > now) {
      return { allowed: false, remaining: 0, lockedUntil: row.lockedUntil };
    }

    if (!row) {
      return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }

    // Reset after lockout expired.
    if (row.lockedUntil && row.lockedUntil <= now) {
      await db.update(loginAttempts).set({ count: 1, lockedUntil: null, lastAttemptAt: now }).where(eq(loginAttempts.key, key));
      return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - row.count);
    if (row.count >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
      await db.update(loginAttempts).set({ lockedUntil, lastAttemptAt: now }).where(eq(loginAttempts.key, key));
      return { allowed: false, remaining: 0, lockedUntil };
    }

    return { allowed: true, remaining };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
}

export async function recordFailedLogin(key: string) {
  try {
    const now = new Date();
    const existing = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);

    if (existing.length === 0) {
      await db.insert(loginAttempts).values({ key, count: 1, lastAttemptAt: now });
    } else {
      const newCount = existing[0].count + 1;
      const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000) : existing[0].lockedUntil;
      await db.update(loginAttempts).set({ count: newCount, lastAttemptAt: now, lockedUntil }).where(eq(loginAttempts.key, key));
    }
  } catch {}
}

export async function resetLoginAttempts(key: string) {
  try {
    await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
  } catch {}
}

// In-memory rate limiter with high capacity so gameplay/testing is never throttled.
const actionBuckets = new Map<string, { count: number; resetAt: number }>();
const ACTION_LIMIT = 100_000;
const ACTION_WINDOW_MS = 60_000;

export async function checkActionRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const bucket = actionBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    actionBuckets.set(key, { count: 1, resetAt: now + ACTION_WINDOW_MS });
    return { allowed: true, remaining: ACTION_LIMIT - 1 };
  }
  if (bucket.count >= ACTION_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count++;
  return { allowed: true, remaining: ACTION_LIMIT - bucket.count };
}
