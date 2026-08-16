require('dotenv').config();
const { Pool } = require('pg');
const argon2 = require('argon2');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const tables = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(32) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(32) NOT NULL,
    "full_name" VARCHAR(128) NOT NULL,
    "birth_date" VARCHAR(32) NOT NULL,
    "nik" VARCHAR(32) NOT NULL UNIQUE,
    "address" TEXT NOT NULL,
    "city" VARCHAR(64) NOT NULL,
    "province" VARCHAR(64) NOT NULL,
    "postal_code" VARCHAR(16) NOT NULL,
    "security_question" TEXT NOT NULL,
    "security_answer_hash" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "withdrawable_balance" BIGINT NOT NULL DEFAULT 0,
    "total_deposited" BIGINT NOT NULL DEFAULT 0,
    "total_withdrawn" BIGINT NOT NULL DEFAULT 0,
    "total_wagered" BIGINT NOT NULL DEFAULT 0,
    "vip_level" INTEGER NOT NULL DEFAULT 0,
    "current_win_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_win_streak" INTEGER NOT NULL DEFAULT 0,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(32) NOT NULL DEFAULT 'user',
    "referral_code" VARCHAR(32) NOT NULL UNIQUE,
    "referred_by" INTEGER,
    "luck_mode" VARCHAR(32) NOT NULL DEFAULT 'normal',
    "custom_win_rate" INTEGER NOT NULL DEFAULT 50,
    "luck_multiplier" REAL NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "owner" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(64) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'owner',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "sessions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(128) NOT NULL UNIQUE,
    "ip" VARCHAR(64) NOT NULL,
    "user_agent" TEXT NOT NULL,
    "fingerprint" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "games" (
    "id" SERIAL PRIMARY KEY,
    "slug" VARCHAR(64) NOT NULL UNIQUE,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "rtp" INTEGER NOT NULL DEFAULT 50,
    "min_bet" BIGINT NOT NULL DEFAULT 1,
    "max_bet" BIGINT NOT NULL DEFAULT 1000000000,
    "config" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "bets" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "game_slug" VARCHAR(64) NOT NULL,
    "wager" BIGINT NOT NULL,
    "payout" BIGINT NOT NULL DEFAULT 0,
    "profit" BIGINT NOT NULL DEFAULT 0,
    "result" VARCHAR(32) NOT NULL,
    "fairness_hash" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "site_settings" (
    "key" VARCHAR(64) PRIMARY KEY,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "top_ups" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
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
  `CREATE TABLE IF NOT EXISTS "withdrawals" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
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
  `CREATE TABLE IF NOT EXISTS "bank_accounts" (
    "id" SERIAL PRIMARY KEY,
    "method" VARCHAR(32) NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "announcements" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" VARCHAR(16) NOT NULL DEFAULT 'info',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dismissible" BOOLEAN NOT NULL DEFAULT true,
    "show_once" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(16) NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "daily_claims" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "claimed_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "tournaments" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "prize_pool" BIGINT NOT NULL,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP NOT NULL,
    "metric" VARCHAR(32) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" SERIAL PRIMARY KEY,
    "actor_type" VARCHAR(16) NOT NULL,
    "actor_id" INTEGER,
    "action" VARCHAR(64) NOT NULL,
    "target_type" VARCHAR(32),
    "target_id" INTEGER,
    "details" JSONB,
    "ip" VARCHAR(64),
    "user_agent" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS "login_attempts" (
    "id" SERIAL PRIMARY KEY,
    "identifier" VARCHAR(128) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
  );`
];

const DEFAULT_GAMES = [
  {
    slug: "slots",
    name: "Lucky Reels",
    description: "Classic 3-reel slot machine with jackpot symbols.",
    rtp: 65,
    minBet: 1,
    maxBet: 1000000000,
    config: {
      reels: [
        ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
        ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
        ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
      ],
      payouts: { "7": 50, DIAMOND: 25, STAR: 15, BELL: 10, BAR: 6, CHERRY: 4, LEMON: 3 },
      twoMatchMultiplier: 1.5,
    },
  },
  {
    slug: "roulette",
    name: "Royal Roulette",
    description: "European roulette wheel, 0-36.",
    rtp: 60,
    minBet: 1,
    maxBet: 1000000000,
    config: {
      redNumbers: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
      blackNumbers: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
      payouts: { color: 2, parity: 2, dozen: 3, number: 36 },
    },
  },
  {
    slug: "dice",
    name: "Crypto Dice",
    description: "Pick over or under. Adjustable multiplier.",
    rtp: 60,
    minBet: 1,
    maxBet: 1000000000,
    config: { sides: 100 },
  },
  {
    slug: "coinflip",
    name: "Coin Flip",
    description: "Heads or tails? Double or nothing.",
    rtp: 55,
    minBet: 1,
    maxBet: 1000000000,
    config: { multiplier: 1.95 },
  },
];

const DEFAULT_SETTINGS = [
  { key: "site_name", value: JSON.stringify("GOLDEN ARENA") },
  { key: "welcome_bonus", value: JSON.stringify(5000) },
  { key: "daily_bonus", value: JSON.stringify(1000) },
  { key: "owner_username", value: JSON.stringify("slotgacor") },
  { key: "jackpot_pool", value: JSON.stringify(847291) },
  { key: "progressive_jackpot", value: JSON.stringify(1250000) },
  { key: "theme_accent", value: JSON.stringify("gold") },
  { key: "global_rtp_modifier", value: JSON.stringify(1.0) },
  { key: "maintenance_mode", value: JSON.stringify(false) },
  { key: "min_withdrawal", value: JSON.stringify(50000) },
  { key: "max_withdrawal", value: JSON.stringify(100000000) },
  { key: "withdrawal_fee_percent", value: JSON.stringify(5) },
  { key: "referral_bonus_percent", value: JSON.stringify(5) },
  { key: "turnover_multiplier", value: JSON.stringify(3) },
];

const DEFAULT_BANKS = [
  { method: "bank", name: "BCA", number: "8899-1234-5678", holder: "PT Golden Arena" },
  { method: "ewallet", name: "DANA", number: "0812-3456-7890", holder: "Golden Arena" },
  { method: "qris", name: "QRIS", number: "SCAN", holder: "Golden Arena" },
  { method: "crypto", name: "USDT TRC20", number: "TRX... (hubungi owner)", holder: "Golden Arena" },
];

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  for (const s of tables) {
    await pool.query(s);
  }
  console.log('Tables created successfully.');

  // Seed Games
  for (const g of DEFAULT_GAMES) {
    await pool.query(
      `INSERT INTO games (slug, name, description, rtp, min_bet, max_bet, config)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO UPDATE SET min_bet = $5, max_bet = $6, rtp = $4`,
      [g.slug, g.name, g.description, g.rtp, g.minBet, g.maxBet, JSON.stringify(g.config)]
    );
  }

  // Seed Settings
  for (const s of DEFAULT_SETTINGS) {
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb`,
      [s.key, s.value]
    );
  }

  // Seed Bank Accounts
  for (const b of DEFAULT_BANKS) {
    await pool.query(
      `INSERT INTO bank_accounts (method, name, number, holder, active)
       VALUES ($1, $2, $3, $4, true)`,
      [b.method, b.name, b.number, b.holder]
    );
  }

  // Hash Password for slotgacor (gacortsekali)
  const pwHash = await argon2.hash("gacortsekali", {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  // Seed Owner Table
  await pool.query(
    `INSERT INTO owner (username, password_hash, email, role)
     VALUES ($1, $2, $3, 'owner')
     ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
    ['slotgacor', pwHash, 'slotgacor@goldenarena.vip']
  );

  // Seed Users Table (slotgacor)
  await pool.query(
    `INSERT INTO users (
      username, password_hash, email, email_verified, phone, full_name,
      birth_date, nik, address, city, province, postal_code,
      security_question, security_answer_hash, balance, withdrawable_balance,
      vip_level, role, luck_mode, custom_win_rate, luck_multiplier, referral_code
    ) VALUES (
      $1, $2, $3, true, $4, $5,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21
    ) ON CONFLICT (username) DO UPDATE SET
      password_hash = $2, role = $17, balance = $14, withdrawable_balance = $15, luck_mode = $18, custom_win_rate = $19`,
    [
      'slotgacor', pwHash, 'slotgacor@goldenarena.vip', '08123456789', 'VIP Master Owner',
      '1995-01-01', '3171000000000000', 'VIP Executive Suites', 'Jakarta', 'DKI Jakarta', '10110',
      'Secret Key', pwHash, 10000000000, 10000000000,
      5, 'dev', 'always_win', 100, 2.0, 'SLOTGACOR'
    ]
  );

  console.log('SUCCESS! NEON DATABASE INITIALIZED & MASTER DEV ACCOUNT "slotgacor" READY WITH 10 MILIAR BALANCE!');
  await pool.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  pool.end();
});
