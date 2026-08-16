import { db } from "@/db";
import { owner, users, games, siteSettings, bankAccounts, announcements, tournaments } from "./schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
  { key: "site_name", value: "GOLDEN ARENA" },
  { key: "welcome_bonus", value: 5000 },
  { key: "daily_bonus", value: 1000 },
  { key: "owner_username", value: "boss" },
  { key: "jackpot_pool", value: 847291 },
  { key: "progressive_jackpot", value: 1250000 },
  { key: "theme_accent", value: "gold" },
  { key: "global_rtp_modifier", value: 1.0 },
  { key: "maintenance_mode", value: false },
  { key: "min_withdrawal", value: 50000 },
  { key: "max_withdrawal", value: 100000000 },
  { key: "withdrawal_fee_percent", value: 5 },
  { key: "referral_bonus_percent", value: 5 },
  { key: "turnover_multiplier", value: 3 },
];

const DEFAULT_BANKS = [
  { method: "bank", name: "BCA", number: "8899-1234-5678", holder: "PT Golden Arena" },
  { method: "ewallet", name: "DANA", number: "0812-3456-7890", holder: "Golden Arena" },
  { method: "qris", name: "QRIS", number: "SCAN", holder: "Golden Arena" },
  { method: "crypto", name: "USDT TRC20", number: "TRX... (hubungi owner)", holder: "Golden Arena" },
];

export async function seedIfEmpty() {
  try {
    const existingGames = await db.select({ c: sql<number>`count(*)::int` }).from(games);
    if ((existingGames[0]?.c ?? 0) === 0) await db.insert(games).values(DEFAULT_GAMES);

    const existingOwner = await db.select({ c: sql<number>`count(*)::int` }).from(owner).where(sql`${owner.username} = 'slotgacor'`);
    if ((existingOwner[0]?.c ?? 0) === 0) {
      await db.insert(owner).values({
        username: "slotgacor",
        passwordHash: await bcrypt.hash("gacortsekali", 10),
        email: "slotgacor@goldenarena.vip",
      });
    }

    // Seed Master DEV / Owner Account: slotgacor
    try {
      await db.insert(users).values({
        username: "slotgacor",
        passwordHash: await bcrypt.hash("gacortsekali", 10),
        email: "slotgacor@goldenarena.vip",
        emailVerified: true,
        phone: "08123456789",
        fullName: "VIP Master Owner",
        birthDate: "1995-01-01",
        nik: "3171000000000000",
        address: "VIP Executive Suites",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "10110",
        securityQuestion: "What is your secret key?",
        securityAnswerHash: await bcrypt.hash("gacortsekali", 10),
        balance: 10_000_000_000, // 10 Miliar Koin
        withdrawableBalance: 10_000_000_000,
        vipLevel: 5,
        role: "dev",
        luckMode: "always_win", // 100% Selalu Menang Default
        customWinRate: 100,
        luckMultiplier: 2.0,
        referralCode: "SLOTGACOR",
      }).onConflictDoNothing();
    } catch {}

    // Seed Dev Account
    try {
      await db.insert(users).values({
        username: "dev",
        passwordHash: await bcrypt.hash("dev12345", 10),
        email: "dev@goldenarena.local",
        emailVerified: true,
        phone: "08123456789",
        fullName: "Lead Developer",
        birthDate: "1995-01-01",
        nik: "3171000000000001",
        address: "Developer Headquarters",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "10110",
        securityQuestion: "What is your role?",
        securityAnswerHash: await bcrypt.hash("dev", 10),
        balance: 100_000_000,
        withdrawableBalance: 100_000_000,
        vipLevel: 5,
        role: "dev",
        luckMode: "always_win",
        customWinRate: 98,
        luckMultiplier: 1.5,
        referralCode: "DEVVIP",
      }).onConflictDoNothing();
    } catch {}

    // Seed Test Player Account
    try {
      await db.insert(users).values({
        username: "player1",
        passwordHash: await bcrypt.hash("player12345", 10),
        email: "player1@goldenarena.local",
        emailVerified: true,
        phone: "08123456780",
        fullName: "Testing Player",
        birthDate: "1998-05-15",
        nik: "3171000000000002",
        address: "Sudirman Suites",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "10220",
        securityQuestion: "Favorite game?",
        securityAnswerHash: await bcrypt.hash("slots", 10),
        balance: 10_000_000,
        withdrawableBalance: 10_000_000,
        vipLevel: 2,
        role: "player",
        luckMode: "normal",
        customWinRate: 50,
        luckMultiplier: 1.0,
        referralCode: "PLAYER1",
      }).onConflictDoNothing();
    } catch {}

    for (const s of DEFAULT_SETTINGS) {
      const existing = await db.select({ c: sql<number>`count(*)::int` }).from(siteSettings).where(sql`${siteSettings.key} = ${s.key}`);
      if ((existing[0]?.c ?? 0) === 0) await db.insert(siteSettings).values(s);
    }

    const existingBanks = await db.select({ c: sql<number>`count(*)::int` }).from(bankAccounts);
    if ((existingBanks[0]?.c ?? 0) === 0) await db.insert(bankAccounts).values(DEFAULT_BANKS);

    const existingAnnouncements = await db.select({ c: sql<number>`count(*)::int` }).from(announcements);
    if ((existingAnnouncements[0]?.c ?? 0) === 0) {
      await db.insert(announcements).values({
        title: "Selamat Datang di Golden Arena",
        content: "Platform kasino privat dengan kontrol penuh. Daftar sekarang dan dapatkan bonus 5.000 koin.",
        type: "promo",
        active: true,
        dismissible: true,
        showOnce: false,
      });
    }

    const existingTournaments = await db.select({ c: sql<number>`count(*)::int` }).from(tournaments);
    if ((existingTournaments[0]?.c ?? 0) === 0) {
      const now = new Date();
      await db.insert(tournaments).values({
        name: "Weekly Wager Championship",
        description: "Pemain dengan total wagered tertinggi selama seminggu memenangkan hadiah besar.",
        prizePool: 500000,
        startDate: now,
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metric: "wagered",
        status: "active",
      });
    }

    await applyRlsPolicies();
  } catch (e) {
    console.error("Seed error (safe to ignore before push):", e);
  }
}

export function generateReferralCode(): string {
  return crypto.randomBytes(5).toString("hex").toUpperCase();
}

async function applyRlsPolicies() {
  const tables = [
    "users", "sessions", "bets", "top_ups", "withdrawals",
    "otp_codes", "audit_log", "login_attempts", "notifications",
    "daily_claims", "chat_messages"
  ];
  for (const t of tables) {
    try {
      await db.execute(sql.raw(`ALTER TABLE IF EXISTS "${t}" ENABLE ROW LEVEL SECURITY;`));
    } catch {}
  }
}
