import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function initializeDatabase() {
  const statements = [
    sql`CREATE TABLE IF NOT EXISTS "owner" (
      "id" SERIAL PRIMARY KEY,
      "username" VARCHAR(64) NOT NULL UNIQUE,
      "password_hash" TEXT NOT NULL,
      "email" TEXT NOT NULL DEFAULT 'owner@goldenarena.local',
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL PRIMARY KEY,
      "username" VARCHAR(64) NOT NULL UNIQUE,
      "password_hash" TEXT NOT NULL,
      "email" VARCHAR(255) NOT NULL UNIQUE,
      "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
      "avatar_url" TEXT,
      "phone" VARCHAR(32) NOT NULL,
      "full_name" TEXT NOT NULL,
      "birth_date" DATE NOT NULL,
      "nik" VARCHAR(32) NOT NULL UNIQUE,
      "address" TEXT NOT NULL,
      "city" VARCHAR(64) NOT NULL,
      "province" VARCHAR(64) NOT NULL,
      "postal_code" VARCHAR(12) NOT NULL,
      "security_question" TEXT NOT NULL,
      "security_answer_hash" TEXT NOT NULL,
      "balance" BIGINT NOT NULL DEFAULT 0,
      "withdrawable_balance" BIGINT NOT NULL DEFAULT 0,
      "total_wagered" BIGINT NOT NULL DEFAULT 0,
      "total_deposited" BIGINT NOT NULL DEFAULT 0,
      "total_withdrawn" BIGINT NOT NULL DEFAULT 0,
      "current_win_streak" INTEGER NOT NULL DEFAULT 0,
      "longest_win_streak" INTEGER NOT NULL DEFAULT 0,
      "referral_code" VARCHAR(32) UNIQUE,
      "referred_by" INTEGER,
      "vip_level" INTEGER NOT NULL DEFAULT 0,
      "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
      "is_banned" BOOLEAN NOT NULL DEFAULT FALSE,
      "role" VARCHAR(16) NOT NULL DEFAULT 'player',
      "luck_mode" VARCHAR(32) NOT NULL DEFAULT 'normal',
      "custom_win_rate" INTEGER NOT NULL DEFAULT 50,
      "luck_multiplier" REAL NOT NULL DEFAULT 1.0,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "otp_codes" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "code" VARCHAR(8) NOT NULL,
      "purpose" VARCHAR(32) NOT NULL,
      "used" BOOLEAN NOT NULL DEFAULT FALSE,
      "expires_at" TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "sessions" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "ip" TEXT,
      "user_agent" TEXT,
      "fingerprint" TEXT,
      "expires_at" TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "login_attempts" (
      "id" SERIAL PRIMARY KEY,
      "key" VARCHAR(128) NOT NULL,
      "count" INTEGER NOT NULL DEFAULT 1,
      "last_attempt_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "locked_until" TIMESTAMP
    );`,

    sql`CREATE TABLE IF NOT EXISTS "games" (
      "id" SERIAL PRIMARY KEY,
      "slug" VARCHAR(64) NOT NULL UNIQUE,
      "name" VARCHAR(128) NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "rtp" REAL NOT NULL DEFAULT 50,
      "min_bet" INTEGER NOT NULL DEFAULT 10,
      "max_bet" INTEGER NOT NULL DEFAULT 10000,
      "config" JSONB NOT NULL DEFAULT '{}',
      "enabled" INTEGER NOT NULL DEFAULT 1,
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "bets" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "game_slug" VARCHAR(64) NOT NULL,
      "wager" INTEGER NOT NULL,
      "payout" INTEGER NOT NULL DEFAULT 0,
      "profit" INTEGER NOT NULL DEFAULT 0,
      "result" VARCHAR(32) NOT NULL,
      "fairness_hash" TEXT,
      "meta" JSONB NOT NULL DEFAULT '{}',
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "top_ups" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "amount" INTEGER NOT NULL,
      "method" VARCHAR(32) NOT NULL,
      "account_name" TEXT NOT NULL,
      "reference" TEXT NOT NULL,
      "proof_url" TEXT NOT NULL,
      "status" VARCHAR(16) NOT NULL DEFAULT 'pending',
      "reviewed_by" INTEGER,
      "reviewed_at" TIMESTAMP,
      "notes" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "withdrawals" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "amount" INTEGER NOT NULL,
      "method" VARCHAR(32) NOT NULL,
      "account_name" TEXT NOT NULL,
      "account_number" TEXT NOT NULL,
      "bank_name" TEXT,
      "status" VARCHAR(16) NOT NULL DEFAULT 'pending',
      "reviewed_by" INTEGER,
      "reviewed_at" TIMESTAMP,
      "notes" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "bank_accounts" (
      "id" SERIAL PRIMARY KEY,
      "method" VARCHAR(32) NOT NULL,
      "name" TEXT NOT NULL,
      "number" TEXT NOT NULL,
      "holder" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "announcements" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "type" VARCHAR(16) NOT NULL DEFAULT 'info',
      "active" BOOLEAN NOT NULL DEFAULT TRUE,
      "dismissible" BOOLEAN NOT NULL DEFAULT TRUE,
      "show_once" BOOLEAN NOT NULL DEFAULT FALSE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "notifications" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" VARCHAR(16) NOT NULL DEFAULT 'info',
      "read" BOOLEAN NOT NULL DEFAULT FALSE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "daily_claims" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "claimed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "amount" INTEGER NOT NULL
    );`,

    sql`CREATE TABLE IF NOT EXISTS "chat_messages" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "username" VARCHAR(64) NOT NULL,
      "message" TEXT NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "tournaments" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "prize_pool" INTEGER NOT NULL DEFAULT 0,
      "start_date" TIMESTAMP NOT NULL,
      "end_date" TIMESTAMP NOT NULL,
      "metric" VARCHAR(32) NOT NULL DEFAULT 'wagered',
      "status" VARCHAR(16) NOT NULL DEFAULT 'active',
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "audit_log" (
      "id" SERIAL PRIMARY KEY,
      "actor_type" VARCHAR(16) NOT NULL,
      "actor_id" INTEGER NOT NULL,
      "action" VARCHAR(64) NOT NULL,
      "target_type" VARCHAR(32),
      "target_id" INTEGER,
      "details" JSONB NOT NULL DEFAULT '{}',
      "ip" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,

    sql`CREATE TABLE IF NOT EXISTS "site_settings" (
      "id" SERIAL PRIMARY KEY,
      "key" VARCHAR(64) NOT NULL UNIQUE,
      "value" JSONB NOT NULL,
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
  ];

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
    } catch (e) {
      console.warn("Statement execution error:", e);
    }
  }

  // Add luck columns and avatar_url to users table if table already existed without them
  const columnMigrations = [
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "luck_mode" VARCHAR(32) NOT NULL DEFAULT 'normal';`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_win_rate" INTEGER NOT NULL DEFAULT 50;`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "luck_multiplier" REAL NOT NULL DEFAULT 1.0;`,
  ];

  for (const colStmt of columnMigrations) {
    try {
      await db.execute(colStmt);
    } catch {
      // Ignored if already exists
    }
  }

  // Alter integer columns to BIGINT for massive payouts and bets
  const typeMigrations = [
    sql`ALTER TABLE "bets" ALTER COLUMN "wager" TYPE BIGINT;`,
    sql`ALTER TABLE "bets" ALTER COLUMN "payout" TYPE BIGINT;`,
    sql`ALTER TABLE "bets" ALTER COLUMN "profit" TYPE BIGINT;`,
    sql`ALTER TABLE "top_ups" ALTER COLUMN "amount" TYPE BIGINT;`,
    sql`ALTER TABLE "withdrawals" ALTER COLUMN "amount" TYPE BIGINT;`,
    sql`ALTER TABLE "daily_claims" ALTER COLUMN "amount" TYPE BIGINT;`,
    sql`ALTER TABLE "tournaments" ALTER COLUMN "prize_pool" TYPE BIGINT;`,
  ];

  for (const typeStmt of typeMigrations) {
    try {
      await db.execute(typeStmt);
    } catch {}
  }

  // Uncap limits across all games
  try {
    await db.execute(sql`UPDATE "games" SET "min_bet" = 1, "max_bet" = 1000000000;`);
  } catch {}
}
