"use server";

import { db } from "@/db";
import { users, games, bets, siteSettings, topUps, withdrawals, bankAccounts, announcements, notifications, dailyClaims, chatMessages, tournaments, auditLog } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireUser, requireOwner } from "./auth";
import { logAudit } from "./audit";
import { topUpSchema, withdrawalSchema, bankAccountSchema, announcementSchema, gameUpdateSchema } from "./validators";
import { sanitize, generateServerSeed, fairnessHash } from "./security";
import { checkActionRateLimit } from "./rate-limit";

export type GameSlug = "slots" | "roulette" | "dice" | "coinflip";

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function getGame(slug: string) {
  const [g] = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
  if (!g) throw new Error(`Game ${slug} missing`);
  return g;
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (!row) return fallback;
  return (row.value as unknown) as T;
}

async function effectiveRtp(slug: string): Promise<number> {
  const game = await getGame(slug);
  const mod = await getSetting<number>("global_rtp_modifier", 1);
  const rtp = game.rtp;
  const shifted = 50 + (rtp - 50) * mod;
  return Math.max(1, Math.min(99, shifted));
}

async function playerWins(userId: number, slug: string): Promise<boolean> {
  const [u] = await db
    .select({
      luckMode: users.luckMode,
      customWinRate: users.customWinRate,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (u) {
    if (u.luckMode === "always_win") return true;
    if (u.luckMode === "always_lose") return false;
    if (u.luckMode === "super_hoki") return Math.random() * 100 < 95;
    if (u.luckMode === "rungkad") return Math.random() * 100 < 8;
    if (u.luckMode === "custom") return Math.random() * 100 < (u.customWinRate ?? 50);
  }

  const rtp = await effectiveRtp(slug);
  return Math.random() * 100 < rtp;
}

async function getUserLuckMultiplier(userId: number): Promise<number> {
  const [u] = await db
    .select({ luckMultiplier: users.luckMultiplier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return u?.luckMultiplier ?? 1.0;
}

async function deductBalance(userId: number, amount: number): Promise<boolean> {
  const [updated] = await db
    .update(users)
    .set({ balance: sql`${users.balance} - ${amount}`, updatedAt: new Date() })
    .where(and(eq(users.id, userId), sql`${users.balance} >= ${amount}`))
    .returning();
  return !!updated;
}

async function addWagered(userId: number, amount: number) {
  await db.update(users).set({ totalWagered: sql`${users.totalWagered} + ${amount}`, updatedAt: new Date() }).where(eq(users.id, userId));
}

async function updateStreak(userId: number, won: boolean) {
  const [u] = await db.select({ currentWinStreak: users.currentWinStreak, longestWinStreak: users.longestWinStreak }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return;
  const current = won ? u.currentWinStreak + 1 : 0;
  const longest = Math.max(u.longestWinStreak, current);
  await db.update(users).set({ currentWinStreak: current, longestWinStreak: longest, updatedAt: new Date() }).where(eq(users.id, userId));
}

async function recordBet(userId: number, input: {
  gameSlug: GameSlug; wager: number; payout: number; result: "win" | "lose" | "push"; meta: Record<string, unknown>;
}) {
  const profit = input.payout - input.wager;
  const serverSeed = generateServerSeed();
  const clientSeed = "client" + userId;
  const nonce = Date.now();
  const hash = fairnessHash(serverSeed, clientSeed, nonce);

  await db.insert(bets).values({
    userId, gameSlug: input.gameSlug, wager: input.wager, payout: input.payout, profit, result: input.result,
    fairnessHash: hash, meta: { ...input.meta, serverSeed, nonce },
  });
  if (profit >= 0) {
    await db.update(users).set({
      balance: sql`${users.balance} + ${profit}`,
      withdrawableBalance: sql`${users.withdrawableBalance} + ${profit}`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
  } else {
    await db.update(users).set({
      balance: sql`${users.balance} + ${profit}`,
      withdrawableBalance: sql`GREATEST(0, ${users.withdrawableBalance} + ${profit})`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
  }
  await addWagered(userId, input.wager);
  await updateStreak(userId, input.result === "win");
  await recalcVip(userId);
  await updateProgressiveJackpot(input.wager);
  await notifyIfBigWin(userId, input.gameSlug, profit);
}

async function recalcVip(userId: number) {
  const [u] = await db.select({ totalWagered: users.totalWagered }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return;
  const wagered = u.totalWagered;
  let vip = 0;
  if (wagered >= 1_000_000_000) vip = 5;
  else if (wagered >= 500_000_000) vip = 4;
  else if (wagered >= 100_000_000) vip = 3;
  else if (wagered >= 10_000_000) vip = 2;
  else if (wagered >= 1_000_000) vip = 1;
  await db.update(users).set({ vipLevel: vip }).where(eq(users.id, userId));
}

async function updateProgressiveJackpot(wager: number) {
  const contribution = Math.floor(wager * 0.01); // 1% to jackpot
  if (contribution > 0) {
    try {
      const cur = await getSetting<number>("progressive_jackpot", 1250000);
      const nextVal = (Number(cur) || 1250000) + contribution;
      await db.update(siteSettings).set({ value: nextVal, updatedAt: new Date() }).where(eq(siteSettings.key, "progressive_jackpot"));
    } catch {}
  }
}

async function notifyIfBigWin(userId: number, gameSlug: string, profit: number) {
  if (profit >= 100000) {
    await createNotification(userId, "BIG_WIN", `Jackpot! Anda memenangkan ${profit.toLocaleString("id-ID")} koin di ${gameSlug}`, "promo");
  }
}

async function createNotification(userId: number, title: string, message: string, type: "info" | "warning" | "promo" = "info") {
  await db.insert(notifications).values({ userId, title, message, type });
}

// ---- GAMES ----
export async function playSlots(wager: number) {
  const u = await requireUser();
  const cleanWager = await canPlay(u.id, "slots", wager);
  const cfg = (await getGame("slots")).config as { reels: string[][]; payouts: Record<string, number>; twoMatchMultiplier: number };
  const wins = await playerWins(u.id, "slots");
  const luckMult = await getUserLuckMultiplier(u.id);

  let finalReels = cfg.reels.map((reel) => pick(reel));
  let payout = 0, matchType: "none" | "two" | "three" = "none";

  if (wins) {
    if (Math.random() < 0.65) {
      const keys = Object.keys(cfg.payouts);
      const weights = keys.map((k) => 1 / cfg.payouts[k]);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total, symbol = keys[0];
      for (let i = 0; i < keys.length; i++) { if (r < weights[i]) { symbol = keys[i]; break; } r -= weights[i]; }
      finalReels = [symbol, symbol, symbol];
      payout = Math.floor(cleanWager * cfg.payouts[symbol] * luckMult);
      matchType = "three";
    } else {
      const symbol = pick(Object.keys(cfg.payouts));
      const other = cfg.reels[0].find((s) => s !== symbol) ?? "LEMON";
      const pattern = Math.floor(Math.random() * 3);
      finalReels = [symbol, symbol, symbol];
      finalReels[pattern] = other;
      payout = Math.floor(cleanWager * cfg.twoMatchMultiplier * luckMult);
      matchType = "two";
    }
  } else {
    // Distinct non-matching symbols on losing spins to prevent misleading partial matches
    const s1 = pick(cfg.reels[0]);
    const s2 = pick(cfg.reels[1].filter((s) => s !== s1)) ?? "BELL";
    const s3 = pick(cfg.reels[2].filter((s) => s !== s1 && s !== s2)) ?? "LEMON";
    finalReels = [s1, s2, s3];
  }

  const result = payout > 0 ? "win" : "lose";
  await recordBet(u.id, { gameSlug: "slots", wager: cleanWager, payout, result, meta: { reels: finalReels, matchType } });
  return { reels: finalReels, payout, result, matchType, wager: cleanWager };
}

export async function playRoulette(
  wager: number,
  bet: { kind: "color"; color: "red" | "black" } | { kind: "parity"; parity: "even" | "odd" } | { kind: "dozen"; dozen: 1 | 2 | 3 } | { kind: "number"; number: number }
) {
  const u = await requireUser();
  const cleanWager = await canPlay(u.id, "roulette", wager);
  const cfg = (await getGame("roulette")).config as { redNumbers: number[]; blackNumbers: number[]; payouts: { color: number; parity: number; dozen: number; number: number } };
  const wins = await playerWins(u.id, "roulette");
  const luckMult = await getUserLuckMultiplier(u.id);

  // Sanitize bet parameters
  const cleanBet = { ...bet };
  if (cleanBet.kind === "number") {
    cleanBet.number = Math.max(0, Math.min(36, Math.floor(cleanBet.number) || 0));
  } else if (cleanBet.kind === "dozen") {
    if (![1, 2, 3].includes(cleanBet.dozen)) cleanBet.dozen = 1;
  }

  let number = randInt(0, 36);
  const isRed = cfg.redNumbers.includes(number);
  const isBlack = cfg.blackNumbers.includes(number);
  const naturalWin =
    (cleanBet.kind === "color" && ((cleanBet.color === "red" && isRed) || (cleanBet.color === "black" && isBlack))) ||
    (cleanBet.kind === "parity" && number !== 0 && ((cleanBet.parity === "even" && number % 2 === 0) || (cleanBet.parity === "odd" && number % 2 === 1))) ||
    (cleanBet.kind === "dozen" && number !== 0 && ((cleanBet.dozen === 1 && number <= 12) || (cleanBet.dozen === 2 && number >= 13 && number <= 24) || (cleanBet.dozen === 3 && number >= 25))) ||
    (cleanBet.kind === "number" && cleanBet.number === number);

  if (wins && !naturalWin) {
    if (cleanBet.kind === "color") number = pick(cleanBet.color === "red" ? cfg.redNumbers : cfg.blackNumbers);
    else if (cleanBet.kind === "parity") number = pick(cleanBet.parity === "even" ? [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36] : [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35]);
    else if (cleanBet.kind === "dozen") { const start = (cleanBet.dozen - 1) * 12 + 1; number = randInt(start, start + 11); }
    else if (cleanBet.kind === "number") number = cleanBet.number;
  } else if (!wins && naturalWin) {
    if (cleanBet.kind === "color") number = pick(cleanBet.color === "red" ? cfg.blackNumbers : cfg.redNumbers);
    else if (cleanBet.kind === "parity") number = pick(cleanBet.parity === "even" ? [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35] : [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36]);
    else if (cleanBet.kind === "dozen") { const d = pick([1,2,3].filter((x) => x !== cleanBet.dozen)); number = randInt((d - 1) * 12 + 1, d * 12); }
    else if (cleanBet.kind === "number") { let n = randInt(0, 36); while (n === cleanBet.number) n = randInt(0, 36); number = n; }
  }

  const finalIsRed = cfg.redNumbers.includes(number);
  const color: "red" | "black" | "green" = number === 0 ? "green" : finalIsRed ? "red" : "black";
  const winColor = cleanBet.kind === "color" && ((cleanBet.color === "red" && finalIsRed) || (cleanBet.color === "black" && cfg.blackNumbers.includes(number)));
  const winParity = cleanBet.kind === "parity" && number !== 0 && ((cleanBet.parity === "even" && number % 2 === 0) || (cleanBet.parity === "odd" && number % 2 === 1));
  const winDozen = cleanBet.kind === "dozen" && number !== 0 && ((cleanBet.dozen === 1 && number <= 12) || (cleanBet.dozen === 2 && number >= 13 && number <= 24) || (cleanBet.dozen === 3 && number >= 25));
  const winNumber = cleanBet.kind === "number" && cleanBet.number === number;

  let payout = 0;
  if (winColor) payout = Math.floor(cleanWager * cfg.payouts.color * luckMult);
  else if (winParity) payout = Math.floor(cleanWager * cfg.payouts.parity * luckMult);
  else if (winDozen) payout = Math.floor(cleanWager * cfg.payouts.dozen * luckMult);
  else if (winNumber) payout = Math.floor(cleanWager * cfg.payouts.number * luckMult);

  const result = payout > 0 ? "win" : "lose";
  await recordBet(u.id, { gameSlug: "roulette", wager: cleanWager, payout, result, meta: { number, color, bet: cleanBet } });
  return { number, color, payout, result, wager: cleanWager };
}

export async function playDice(wager: number, threshold: number, side: "over" | "under") {
  const u = await requireUser();
  const cleanWager = await canPlay(u.id, "dice", wager);
  const wins = await playerWins(u.id, "dice");
  const luckMult = await getUserLuckMultiplier(u.id);

  const cleanThreshold = Math.max(1, Math.min(98, Math.floor(threshold) || 50));
  const cleanSide = side === "under" ? "under" : "over";
  const fairProb = cleanSide === "over" ? (99 - cleanThreshold) / 100 : cleanThreshold / 100;
  const multiplier = Math.max(1.01, (0.97 / Math.max(0.01, fairProb)) * luckMult);

  let roll = randInt(0, 99);
  const naturalWin = cleanSide === "over" ? roll > cleanThreshold : roll < cleanThreshold;
  if (wins && !naturalWin) roll = cleanSide === "over" ? randInt(cleanThreshold + 1, 99) : randInt(0, cleanThreshold - 1);
  else if (!wins && naturalWin) roll = cleanSide === "over" ? randInt(0, cleanThreshold) : randInt(cleanThreshold, 99);

  const won = cleanSide === "over" ? roll > cleanThreshold : roll < cleanThreshold;
  const payout = won ? Math.floor(cleanWager * multiplier) : 0;
  const result = won ? "win" : "lose";
  await recordBet(u.id, { gameSlug: "dice", wager: cleanWager, payout, result, meta: { roll, threshold: cleanThreshold, side: cleanSide, multiplier } });
  return { roll, payout, result, wager: cleanWager, multiplier };
}

export async function playCoinflip(wager: number, choice: "heads" | "tails") {
  const u = await requireUser();
  const cleanWager = await canPlay(u.id, "coinflip", wager);
  const cfg = (await getGame("coinflip")).config as { multiplier: number };
  const wins = await playerWins(u.id, "coinflip");
  const luckMult = await getUserLuckMultiplier(u.id);
  const cleanChoice = choice === "tails" ? "tails" : "heads";
  const naturalWin = Math.random() < 0.5;
  let result_side: "heads" | "tails" = naturalWin ? cleanChoice : cleanChoice === "heads" ? "tails" : "heads";
  if (wins && !naturalWin) result_side = cleanChoice;
  else if (!wins && naturalWin) result_side = cleanChoice === "heads" ? "tails" : "heads";
  const won = result_side === cleanChoice;
  const payout = won ? Math.floor(cleanWager * cfg.multiplier * luckMult) : 0;
  await recordBet(u.id, { gameSlug: "coinflip", wager: cleanWager, payout, result: won ? "win" : "lose", meta: { choice: cleanChoice, result_side } });
  return { result_side, payout, result: won ? "win" : "lose", wager: cleanWager };
}

async function canPlay(userId: number, slug: string, wager: number) {
  if (!Number.isFinite(wager) || isNaN(wager) || wager < 1) {
    throw new Error("Jumlah taruhan tidak valid.");
  }
  const cleanWager = Math.floor(wager);
  const maintenance = await getSetting<boolean>("maintenance_mode", false);
  if (maintenance) throw new Error("Sedang maintenance. Silakan kembali lagi nanti.");

  const [game] = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
  if (!game || !game.enabled) {
    throw new Error(`Permainan ${slug} sedang dinonaktifkan oleh owner.`);
  }
  if (cleanWager < game.minBet) {
    throw new Error(`Minimal taruhan adalah ${game.minBet.toLocaleString("id-ID")} koin.`);
  }
  if (cleanWager > game.maxBet) {
    throw new Error(`Maksimal taruhan adalah ${game.maxBet.toLocaleString("id-ID")} koin.`);
  }

  const [u] = await db.select({ balance: users.balance, isBanned: users.isBanned, isActive: users.isActive }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u) throw new Error("Akun tidak ditemukan.");
  if (u.isBanned) throw new Error("Akun ini telah diblokir.");
  if (!u.isActive) throw new Error("Akun tidak aktif.");
  if (u.balance < cleanWager) throw new Error("Saldo tidak cukup.");

  return cleanWager;
}

// ---- BALANCE & HISTORY ----
export async function getBalance(userId?: number) {
  if (userId) return (await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1))[0]?.balance ?? 0;
  return (await requireUser()).balance;
}

export async function adjustUserBalance(userId: number, delta: number, note = "Manual adjustment") {
  const o = await requireOwner();
  await db.update(users).set({
    balance: sql`${users.balance} + ${delta}`,
    withdrawableBalance: sql`GREATEST(0, ${users.withdrawableBalance} + ${delta})`,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
  await logAudit({ actorType: "owner", actorId: o.id, action: "BALANCE_ADJUSTED", targetType: "user", targetId: userId, details: { delta, note } });
  return (await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1))[0]?.balance ?? 0;
}

export async function setUserBalance(userId: number, amount: number) {
  const current = await getBalance(userId);
  return adjustUserBalance(userId, amount - current, "Set saldo manual");
}

export async function getHistory(userId?: number, limit = 200) {
  if (userId) return db.select().from(bets).where(eq(bets.userId, userId)).orderBy(sql`${bets.id} DESC`).limit(limit);
  return db.select().from(bets).where(eq(bets.userId, (await requireUser()).id)).orderBy(sql`${bets.id} DESC`).limit(limit);
}

export async function getLastResults(gameSlug: string, limit = 20) {
  return db.select({ meta: bets.meta, createdAt: bets.createdAt }).from(bets).where(eq(bets.gameSlug, gameSlug)).orderBy(sql`${bets.id} DESC`).limit(limit);
}

export async function getHotColdRoulette() {
  const recent = await db.select({ meta: bets.meta }).from(bets).where(eq(bets.gameSlug, "roulette")).orderBy(sql`${bets.id} DESC`).limit(100);
  const counts = new Map<number, number>();
  for (let i = 0; i <= 36; i++) counts.set(i, 0);
  recent.forEach((r) => {
    const n = (r.meta as { number?: number })?.number;
    if (n !== undefined && counts.has(n)) counts.set(n, (counts.get(n) ?? 0) + 1);
  });
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return { hot: sorted.slice(0, 5), cold: sorted.slice(-5).reverse() };
}

// ---- GAMES ----
export async function getAllGames() { return db.select().from(games); }

export async function updateGame(slug: string, patch: unknown) {
  const o = await requireOwner();
  const parsed = gameUpdateSchema.safeParse(patch);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  await db.update(games).set({ ...parsed.data, updatedAt: new Date() }).where(eq(games.slug, slug));
  await logAudit({ actorType: "owner", actorId: o.id, action: "GAME_UPDATED", targetType: "game", details: { slug, patch: parsed.data } });
}

// ---- SETTINGS ----
export async function getAllSettings() { return db.select().from(siteSettings); }

export async function updateSetting(key: string, value: unknown) {
  const o = await requireOwner();
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (existing.length === 0) await db.insert(siteSettings).values({ key, value });
  else await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
  await logAudit({ actorType: "owner", actorId: o.id, action: "SETTING_UPDATED", details: { key, value } });
}

// ---- STATS ----
export async function getStats() {
  await requireOwner();
  const [totalBets] = await db.select({ c: sql<number>`count(*)::int`, sum: sql<string>`coalesce(sum(${bets.wager}),0)::text` }).from(bets);
  const [wins] = await db.select({ c: sql<number>`count(*)::int` }).from(bets).where(eq(bets.result, "win"));
  const [profit] = await db.select({ sum: sql<string>`coalesce(sum(${bets.profit}),0)::text` }).from(bets);
  const byGameRaw = await db.select({
    game: bets.gameSlug,
    count: sql<number>`count(*)::int`,
    wagered: sql<string>`coalesce(sum(${bets.wager}),0)::text`,
    paid: sql<string>`coalesce(sum(${bets.payout}),0)::text`,
  }).from(bets).groupBy(bets.gameSlug);

  const byGame = byGameRaw.map((b) => ({
    game: b.game,
    count: b.count,
    wagered: Number(b.wagered) || 0,
    paid: Number(b.paid) || 0,
  }));

  return {
    totalBets: totalBets?.c ?? 0,
    totalWagered: Number(totalBets?.sum) || 0,
    totalWins: wins?.c ?? 0,
    playerProfit: Number(profit?.sum) || 0,
    byGame,
  };
}

export async function getUserStats() {
  const u = await requireUser();
  const [totalBets] = await db.select({ c: sql<number>`count(*)::int`, sum: sql<string>`coalesce(sum(${bets.wager}),0)::text` }).from(bets).where(eq(bets.userId, u.id));
  const [wins] = await db.select({ c: sql<number>`count(*)::int` }).from(bets).where(and(eq(bets.userId, u.id), eq(bets.result, "win")));
  return {
    totalBets: totalBets?.c ?? 0,
    totalWagered: Number(totalBets?.sum) || 0,
    totalWins: wins?.c ?? 0,
    balance: u.balance,
    withdrawableBalance: u.withdrawableBalance,
    vipLevel: u.vipLevel,
    currentWinStreak: u.currentWinStreak,
    longestWinStreak: u.longestWinStreak,
  };
}

export async function getLeaderboard(limit = 20) {
  return db.select({
    id: users.id,
    username: users.username,
    balance: users.balance,
    totalWagered: users.totalWagered,
    totalDeposited: users.totalDeposited,
    vipLevel: users.vipLevel,
    longestWinStreak: users.longestWinStreak,
  }).from(users).where(eq(users.isBanned, false)).orderBy(sql`${users.totalWagered} DESC`).limit(limit);
}

// ---- NOTIFICATIONS ----
export async function getMyNotifications() {
  const u = await requireUser();
  return db.select().from(notifications).where(eq(notifications.userId, u.id)).orderBy(sql`${notifications.id} DESC`).limit(50);
}

export async function markNotificationRead(id: number) {
  const u = await requireUser();
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, u.id)));
}

export async function markAllNotificationsRead() {
  const u = await requireUser();
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, u.id));
}

// ---- DAILY BONUS ----
export async function claimDailyBonus() {
  const u = await requireUser();
  const dailyBonus = await getSetting<number>("daily_bonus", 1000);

  const lastClaim = await db.select().from(dailyClaims).where(eq(dailyClaims.userId, u.id)).orderBy(sql`${dailyClaims.claimedAt} DESC`).limit(1);
  if (lastClaim.length > 0) {
    const hoursSince = (Date.now() - new Date(lastClaim[0].claimedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) throw new Error(`Bonus harian bisa diklaim lagi dalam ${Math.ceil(24 - hoursSince)} jam.`);
  }

  await db.insert(dailyClaims).values({ userId: u.id, amount: dailyBonus });
  await db.update(users).set({ balance: sql`${users.balance} + ${dailyBonus}`, updatedAt: new Date() }).where(eq(users.id, u.id));
  await createNotification(u.id, "DAILY_BONUS", `Anda mendapatkan bonus harian ${dailyBonus.toLocaleString("id-ID")} koin!`, "promo");
  return dailyBonus;
}

export async function canClaimDaily() {
  const u = await requireUser();
  const lastClaim = await db.select().from(dailyClaims).where(eq(dailyClaims.userId, u.id)).orderBy(sql`${dailyClaims.claimedAt} DESC`).limit(1);
  if (lastClaim.length === 0) return { canClaim: true, hoursLeft: 0 };
  const hoursSince = (Date.now() - new Date(lastClaim[0].claimedAt).getTime()) / (1000 * 60 * 60);
  return { canClaim: hoursSince >= 24, hoursLeft: Math.max(0, 24 - hoursSince) };
}

// ---- CHAT ----
export async function getChatMessages(limit = 50) {
  return db.select().from(chatMessages).orderBy(sql`${chatMessages.id} DESC`).limit(limit);
}

export async function sendChatMessage(message: string) {
  const u = await requireUser();
  const clean = sanitize(message, 500);
  if (!clean || clean.length < 2) throw new Error("Pesan terlalu pendek.");
  const rate = await checkActionRateLimit(`chat:${u.id}`);
  if (!rate.allowed) throw new Error("Terlalu banyak chat.");
  await db.insert(chatMessages).values({ userId: u.id, username: u.username, message: clean });
}

// ---- TOURNAMENTS ----
export async function getActiveTournament() {
  const now = new Date();
  const [t] = await db.select().from(tournaments).where(and(eq(tournaments.status, "active"), sql`${tournaments.startDate} <= ${now}`, sql`${tournaments.endDate} >= ${now}`)).limit(1);
  return t ?? null;
}

export async function getTournamentLeaderboard(metric: string, limit = 10) {
  if (metric === "wagered") return db.select({ username: users.username, totalWagered: users.totalWagered }).from(users).where(eq(users.isBanned, false)).orderBy(sql`${users.totalWagered} DESC`).limit(limit);
  if (metric === "wins") {
    return db.select({ username: users.username, wins: sql<number>`count(*)::int` }).from(users).leftJoin(bets, eq(users.id, bets.userId)).where(and(eq(users.isBanned, false), eq(bets.result, "win"))).groupBy(users.id, users.username).orderBy(sql`count(*) DESC`).limit(limit);
  }
  return [];
}

// ---- TOP-UPS ----
export async function requestTopUp(input: { amount: number; method: string; accountName: string; reference: string; proofUrl: string }) {
  const u = await requireUser();
  const parsed = topUpSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));

  const maintenance = await getSetting<boolean>("maintenance_mode", false);
  if (maintenance) throw new Error("Sedang maintenance.");
  const rate = await checkActionRateLimit(`topup:${u.id}`);
  if (!rate.allowed) throw new Error("Terlalu banyak permintaan top-up.");

  const [row] = await db.insert(topUps).values({ ...parsed.data, userId: u.id }).returning();
  await logAudit({ actorType: "user", actorId: u.id, action: "TOPUP_REQUESTED", targetType: "topup", targetId: row.id, details: { amount: parsed.data.amount } });
  await createNotification(u.id, "DEPOSIT_PENDING", `Deposit ${parsed.data.amount.toLocaleString("id-ID")} koin sedang diproses.`, "info");
  return row;
}

export async function getMyTopUps() {
  const u = await requireUser();
  return db.select().from(topUps).where(eq(topUps.userId, u.id)).orderBy(sql`${topUps.id} DESC`);
}

export async function getPendingTopUps() {
  await requireOwner();
  return db.select().from(topUps).where(eq(topUps.status, "pending")).orderBy(sql`${topUps.id} DESC`);
}

export async function reviewTopUp(topUpId: number, status: "approved" | "rejected", notes?: string) {
  const o = await requireOwner();
  const [row] = await db.select().from(topUps).where(eq(topUps.id, topUpId)).limit(1);
  if (!row) throw new Error("Top-up tidak ditemukan.");
  if (row.status !== "pending") throw new Error("Top-up sudah diproses.");

  await db.update(topUps).set({ status, notes, reviewedBy: o.id, reviewedAt: new Date() }).where(eq(topUps.id, topUpId));

  if (status === "approved") {
    await db.update(users).set({
      balance: sql`${users.balance} + ${row.amount}`,
      withdrawableBalance: sql`${users.withdrawableBalance} + ${row.amount}`,
      totalDeposited: sql`${users.totalDeposited} + ${row.amount}`,
      updatedAt: new Date(),
    }).where(eq(users.id, row.userId));
    await grantReferralBonus(row.userId, row.amount);
    await createNotification(row.userId, "DEPOSIT_APPROVED", `Deposit ${row.amount.toLocaleString("id-ID")} koin telah disetujui.`, "promo");
  } else {
    await createNotification(row.userId, "DEPOSIT_REJECTED", `Deposit ${row.amount.toLocaleString("id-ID")} koin ditolak.`, "warning");
  }

  await logAudit({ actorType: "owner", actorId: o.id, action: `TOPUP_${status.toUpperCase()}`, targetType: "topup", targetId: topUpId, details: { notes } });
  return true;
}

async function grantReferralBonus(userId: number, depositAmount: number) {
  const [u] = await db.select({ referredBy: users.referredBy }).from(users).where(eq(users.id, userId)).limit(1);
  if (!u?.referredBy) return;
  const percent = await getSetting<number>("referral_bonus_percent", 5);
  const bonus = Math.floor((depositAmount * percent) / 100);
  if (bonus > 0) {
    await db.update(users).set({ balance: sql`${users.balance} + ${bonus}`, updatedAt: new Date() }).where(eq(users.id, u.referredBy));
    await createNotification(u.referredBy, "REFERRAL_BONUS", `Anda mendapatkan bonus referral ${bonus.toLocaleString("id-ID")} koin!`, "promo");
  }
}

// ---- WITHDRAWALS ----
export async function requestWithdrawal(input: { amount: number; method: string; accountName: string; accountNumber: string; bankName?: string }) {
  const u = await requireUser();
  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));

  const maintenance = await getSetting<boolean>("maintenance_mode", false);
  if (maintenance) throw new Error("Sedang maintenance.");

  const minW = await getSetting<number>("min_withdrawal", 50000);
  const maxW = await getSetting<number>("max_withdrawal", 100000000);
  if (parsed.data.amount < minW) throw new Error(`Minimal withdrawal ${minW.toLocaleString("id-ID")} koin.`);
  if (parsed.data.amount > maxW) throw new Error(`Maksimal withdrawal ${maxW.toLocaleString("id-ID")} koin.`);
  if (u.withdrawableBalance < parsed.data.amount) throw new Error("Saldo withdrawable tidak cukup. Main lebih banyak untuk membuka saldo.");

  const feePercent = await getSetting<number>("withdrawal_fee_percent", 5);
  const fee = Math.floor((parsed.data.amount * feePercent) / 100);

  const deducted = await deductBalance(u.id, parsed.data.amount);
  if (!deducted) throw new Error("Saldo tidak cukup.");

  await db.update(users).set({
    withdrawableBalance: sql`${users.withdrawableBalance} - ${parsed.data.amount}`,
    updatedAt: new Date(),
  }).where(eq(users.id, u.id));
  const [row] = await db.insert(withdrawals).values({
    userId: u.id,
    amount: parsed.data.amount,
    method: parsed.data.method,
    accountName: sanitize(parsed.data.accountName),
    accountNumber: sanitize(parsed.data.accountNumber),
    bankName: sanitize(parsed.data.bankName ?? ""),
    status: "pending",
  }).returning();

  await logAudit({ actorType: "user", actorId: u.id, action: "WITHDRAWAL_REQUESTED", targetType: "withdrawal", targetId: row.id, details: { amount: parsed.data.amount, fee } });
  return row;
}

export async function getMyWithdrawals() {
  const u = await requireUser();
  return db.select().from(withdrawals).where(eq(withdrawals.userId, u.id)).orderBy(sql`${withdrawals.id} DESC`);
}

export async function getPendingWithdrawals() {
  await requireOwner();
  return db.select().from(withdrawals).where(eq(withdrawals.status, "pending")).orderBy(sql`${withdrawals.id} DESC`);
}

export async function reviewWithdrawal(withdrawalId: number, status: "approved" | "rejected", notes?: string) {
  const o = await requireOwner();
  const [row] = await db.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1);
  if (!row) throw new Error("Withdrawal tidak ditemukan.");
  if (row.status !== "pending") throw new Error("Withdrawal sudah diproses.");

  await db.update(withdrawals).set({ status, notes, reviewedBy: o.id, reviewedAt: new Date() }).where(eq(withdrawals.id, withdrawalId));

  if (status === "rejected") {
    await db.update(users).set({ balance: sql`${users.balance} + ${row.amount}`, withdrawableBalance: sql`${users.withdrawableBalance} + ${row.amount}`, updatedAt: new Date() }).where(eq(users.id, row.userId));
    await createNotification(row.userId, "WITHDRAWAL_REJECTED", `Withdrawal ${row.amount.toLocaleString("id-ID")} koin ditolak.`, "warning");
  } else {
    await db.update(users).set({ totalWithdrawn: sql`${users.totalWithdrawn} + ${row.amount}`, updatedAt: new Date() }).where(eq(users.id, row.userId));
    await createNotification(row.userId, "WITHDRAWAL_APPROVED", `Withdrawal ${row.amount.toLocaleString("id-ID")} koin telah disetujui.`, "promo");
  }

  await logAudit({ actorType: "owner", actorId: o.id, action: `WITHDRAWAL_${status.toUpperCase()}`, targetType: "withdrawal", targetId: withdrawalId, details: { notes } });
  return true;
}

// ---- BANK ACCOUNTS ----
export async function getBankAccounts() { return db.select().from(bankAccounts).where(eq(bankAccounts.active, true)); }
export async function getAllBankAccounts() { await requireOwner(); return db.select().from(bankAccounts).orderBy(sql`${bankAccounts.id} DESC`); }

export async function createBankAccount(input: { method: string; name: string; number: string; holder: string }) {
  const o = await requireOwner();
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  const [row] = await db.insert(bankAccounts).values(parsed.data).returning();
  await logAudit({ actorType: "owner", actorId: o.id, action: "BANK_ACCOUNT_CREATED", targetType: "bank_account", targetId: row.id, details: parsed.data });
  return row;
}

export async function toggleBankAccount(id: number, active: boolean) {
  const o = await requireOwner();
  await db.update(bankAccounts).set({ active }).where(eq(bankAccounts.id, id));
  await logAudit({ actorType: "owner", actorId: o.id, action: "BANK_ACCOUNT_TOGGLED", targetType: "bank_account", targetId: id, details: { active } });
}

// ---- ANNOUNCEMENTS ----
export async function getActiveAnnouncements() { return db.select().from(announcements).where(eq(announcements.active, true)).orderBy(sql`${announcements.id} DESC`); }
export async function getAllAnnouncements() { await requireOwner(); return db.select().from(announcements).orderBy(sql`${announcements.id} DESC`); }

export async function createAnnouncement(input: { title: string; content: string; type: "info" | "warning" | "promo"; dismissible?: boolean; showOnce?: boolean }) {
  const o = await requireOwner();
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  const [row] = await db.insert(announcements).values(parsed.data).returning();
  await logAudit({ actorType: "owner", actorId: o.id, action: "ANNOUNCEMENT_CREATED", targetType: "announcement", targetId: row.id, details: parsed.data });
  return row;
}

export async function toggleAnnouncement(id: number, active: boolean) {
  const o = await requireOwner();
  await db.update(announcements).set({ active }).where(eq(announcements.id, id));
  await logAudit({ actorType: "owner", actorId: o.id, action: "ANNOUNCEMENT_TOGGLED", targetType: "announcement", targetId: id, details: { active } });
}

// ---- USERS ADMIN ----
export async function getAllUsers() {
  await requireOwner();
  return db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    phone: users.phone,
    fullName: users.fullName,
    balance: users.balance,
    vipLevel: users.vipLevel,
    isActive: users.isActive,
    isBanned: users.isBanned,
    role: users.role,
    luckMode: users.luckMode,
    customWinRate: users.customWinRate,
    luckMultiplier: users.luckMultiplier,
    createdAt: users.createdAt,
  }).from(users).orderBy(sql`${users.id} DESC`);
}

export async function setUserLuck(userId: number, luckMode: string, customWinRate: number, luckMultiplier = 1.0) {
  const o = await requireOwner();
  await db.update(users).set({
    luckMode,
    customWinRate: Math.max(0, Math.min(100, customWinRate)),
    luckMultiplier: Math.max(0.1, Math.min(100, luckMultiplier)),
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
  await logAudit({ actorType: "owner", actorId: o.id, action: "USER_LUCK_UPDATED", targetType: "user", targetId: userId, details: { luckMode, customWinRate, luckMultiplier } });
}

export async function setUserRole(userId: number, role: string) {
  const o = await requireOwner();
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  await logAudit({ actorType: "owner", actorId: o.id, action: "USER_ROLE_UPDATED", targetType: "user", targetId: userId, details: { role } });
}

export async function devSetMyLuck(luckMode: string, customWinRate: number, luckMultiplier = 1.0) {
  const u = await requireUser();
  if (u.role !== "dev" && u.role !== "admin" && u.role !== "owner") {
    throw new Error("Hanya akun dengan role DEV yang dapat mengatur kehokian instan.");
  }
  await db.update(users).set({
    luckMode,
    customWinRate: Math.max(0, Math.min(100, customWinRate)),
    luckMultiplier: Math.max(0.1, Math.min(100, luckMultiplier)),
    updatedAt: new Date(),
  }).where(eq(users.id, u.id));
  return { luckMode, customWinRate, luckMultiplier };
}

export async function toggleUserBan(userId: number, banned: boolean) {
  const o = await requireOwner();
  await db.update(users).set({ isBanned: banned, updatedAt: new Date() }).where(eq(users.id, userId));
  await logAudit({ actorType: "owner", actorId: o.id, action: banned ? "USER_BANNED" : "USER_UNBANNED", targetType: "user", targetId: userId });
}

export async function toggleUserActive(userId: number, active: boolean) {
  const o = await requireOwner();
  await db.update(users).set({ isActive: active, updatedAt: new Date() }).where(eq(users.id, userId));
  await logAudit({ actorType: "owner", actorId: o.id, action: active ? "USER_ACTIVATED" : "USER_DEACTIVATED", targetType: "user", targetId: userId });
}

// ---- AUDIT LOG ----
export async function getAuditLog(limit = 500) {
  await requireOwner();
  return db.select().from(auditLog).orderBy(sql`${auditLog.id} DESC`).limit(limit);
}
