import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  timestamp,
  jsonb,
  real,
  varchar,
  boolean,
  date,
  index,
} from "drizzle-orm/pg-core";

export const owner = pgTable("owner", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email").notNull().default("owner@goldenarena.local"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 64 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    avatarUrl: text("avatar_url"),
    phone: varchar("phone", { length: 32 }).notNull(),
    fullName: text("full_name").notNull(),
    birthDate: date("birth_date").notNull(),
    nik: varchar("nik", { length: 32 }).notNull().unique(),
    address: text("address").notNull(),
    city: varchar("city", { length: 64 }).notNull(),
    province: varchar("province", { length: 64 }).notNull(),
    postalCode: varchar("postal_code", { length: 12 }).notNull(),
    securityQuestion: text("security_question").notNull(),
    securityAnswerHash: text("security_answer_hash").notNull(),
    balance: bigint("balance", { mode: "number" }).notNull().default(0),
    withdrawableBalance: bigint("withdrawable_balance", { mode: "number" }).notNull().default(0),
    totalWagered: bigint("total_wagered", { mode: "number" }).notNull().default(0),
    totalDeposited: bigint("total_deposited", { mode: "number" }).notNull().default(0),
    totalWithdrawn: bigint("total_withdrawn", { mode: "number" }).notNull().default(0),
    currentWinStreak: integer("current_win_streak").notNull().default(0),
    longestWinStreak: integer("longest_win_streak").notNull().default(0),
    referralCode: varchar("referral_code", { length: 32 }).unique(),
    referredBy: integer("referred_by"),
    vipLevel: integer("vip_level").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isBanned: boolean("is_banned").notNull().default(false),
    role: varchar("role", { length: 16 }).notNull().default("player"),
    luckMode: varchar("luck_mode", { length: 32 }).notNull().default("normal"),
    customWinRate: integer("custom_win_rate").notNull().default(50),
    luckMultiplier: real("luck_multiplier").notNull().default(1.0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    emailIdx: index("users_email_idx").on(table.email),
    referralIdx: index("users_referral_idx").on(table.referralCode),
    referredByIdx: index("users_referred_by_idx").on(table.referredBy),
  })
);

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    purpose: varchar("purpose", { length: 32 }).notNull(),
    used: boolean("used").notNull().default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userPurposeIdx: index("otp_user_purpose_idx").on(table.userId, table.purpose),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    token: text("token").notNull().unique(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    fingerprint: text("fingerprint"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: index("sessions_token_idx").on(table.token),
    userIdx: index("sessions_user_idx").on(table.userId),
  })
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 128 }).notNull(),
    count: integer("count").notNull().default(1),
    lastAttemptAt: timestamp("last_attempt_at").notNull().defaultNow(),
    lockedUntil: timestamp("locked_until"),
  },
  (table) => ({
    keyIdx: index("login_attempts_key_idx").on(table.key),
  })
);

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull().default(""),
  rtp: real("rtp").notNull().default(50),
  minBet: integer("min_bet").notNull().default(10),
  maxBet: integer("max_bet").notNull().default(10000),
  config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
  enabled: integer("enabled").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bets = pgTable(
  "bets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    gameSlug: varchar("game_slug", { length: 64 }).notNull(),
    wager: bigint("wager", { mode: "number" }).notNull(),
    payout: bigint("payout", { mode: "number" }).notNull().default(0),
    profit: bigint("profit", { mode: "number" }).notNull().default(0),
    result: varchar("result", { length: 32 }).notNull(),
    fairnessHash: text("fairness_hash"),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("bets_user_idx").on(table.userId),
    createdIdx: index("bets_created_idx").on(table.createdAt),
  })
);

export const topUps = pgTable(
  "top_ups",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    method: varchar("method", { length: 32 }).notNull(),
    accountName: text("account_name").notNull(),
    reference: text("reference").notNull(),
    proofUrl: text("proof_url").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("topups_user_idx").on(table.userId),
    statusIdx: index("topups_status_idx").on(table.status),
  })
);

export const withdrawals = pgTable(
  "withdrawals",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    method: varchar("method", { length: 32 }).notNull(),
    accountName: text("account_name").notNull(),
    accountNumber: text("account_number").notNull(),
    bankName: text("bank_name"),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("withdrawals_user_idx").on(table.userId),
    statusIdx: index("withdrawals_status_idx").on(table.status),
  })
);

export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: serial("id").primaryKey(),
    method: varchar("method", { length: 32 }).notNull(),
    name: text("name").notNull(),
    number: text("number").notNull(),
    holder: text("holder").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const announcements = pgTable(
  "announcements",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: varchar("type", { length: 16 }).notNull().default("info"),
    active: boolean("active").notNull().default(true),
    dismissible: boolean("dismissible").notNull().default(true),
    showOnce: boolean("show_once").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 16 }).notNull().default("info"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

export const dailyClaims = pgTable(
  "daily_claims",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    claimedAt: timestamp("claimed_at").notNull().defaultNow(),
    amount: integer("amount").notNull(),
  },
  (table) => ({
    userIdx: index("daily_claims_user_idx").on(table.userId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index("chat_created_idx").on(table.createdAt),
  })
);

export const tournaments = pgTable(
  "tournaments",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    prizePool: integer("prize_pool").notNull().default(0),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    metric: varchar("metric", { length: 32 }).notNull().default("wagered"), // wagered | wins | profit
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    actorType: varchar("actor_type", { length: 16 }).notNull(),
    actorId: integer("actor_id").notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 32 }),
    targetId: integer("target_id"),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    ip: text("ip"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index("audit_created_idx").on(table.createdAt),
    actorIdx: index("audit_actor_idx").on(table.actorType, table.actorId),
  })
);

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
