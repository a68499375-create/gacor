"use server";

import { revalidatePath } from "next/cache";
import { ensureSeeded } from "@/lib/bootstrap";
import * as G from "@/lib/games";
import { registerUser, loginUser, loginOwner, logoutUser, logoutOwner, requireUser, requireOwner, getCurrentUser, getCurrentOwner, changeUserPassword, changeOwnerPassword } from "@/lib/auth";
import type { RegisterInput } from "@/lib/auth";
import { checkActionRateLimit } from "@/lib/rate-limit";

let bootstrapped: Promise<void> | null = null;
async function boot() {
  if (!bootstrapped) bootstrapped = ensureSeeded();
  await bootstrapped;
}

async function rateLimitAction(key: string) {
  const rate = await checkActionRateLimit(key);
  if (!rate.allowed) throw new Error("Terlalu banyak permintaan. Coba lagi nanti.");
}

export async function getInitialState() {
  try {
    await boot();
  } catch {}
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {}

  const [games, history, stats, announcements, leaderboard, tournament] = await Promise.all([
    G.getAllGames().catch(() => []),
    user ? G.getHistory(user.id, 30).catch(() => []) : Promise.resolve([]),
    user ? G.getUserStats().catch(() => null) : Promise.resolve(null),
    G.getActiveAnnouncements().catch(() => []),
    G.getLeaderboard(10).catch(() => []),
    G.getActiveTournament().catch(() => null),
  ]);
  return JSON.parse(JSON.stringify({ user, games, history, stats, announcements, leaderboard, tournament }));
}

// ============== AUTH ==============
export async function registerAction(input: RegisterInput) {
  await boot();
  await rateLimitAction(`register_action`);
  const res = await registerUser(input);
  return JSON.parse(JSON.stringify(res));
}

export async function loginAction(username: string, password: string) {
  await boot();
  await rateLimitAction(`login_action`);
  const res = await loginUser(username, password);
  return JSON.parse(JSON.stringify(res));
}

export async function loginAdminAction(username: string, password: string) {
  await boot();
  await rateLimitAction(`owner_login_action`);
  const res = await loginOwner(username, password);
  return JSON.parse(JSON.stringify(res));
}

export async function logoutAction() {
  await logoutUser();
  revalidatePath("/", "layout");
}

export async function logoutAdminAction() {
  await logoutOwner();
  revalidatePath("/admin", "layout");
}

export async function whoami() {
  await boot();
  const [user, owner] = await Promise.all([getCurrentUser(), getCurrentOwner()]);
  return JSON.parse(JSON.stringify({ user, owner }));
}

// ============== GAMES ==============
export async function spinSlots(wager: number) {
  await boot();
  const result = await G.playSlots(wager);
  revalidatePath("/", "layout");
  return JSON.parse(JSON.stringify(result));
}

export async function spinRoulette(wager: number, bet: Parameters<typeof G.playRoulette>[1]) {
  await boot();
  const result = await G.playRoulette(wager, bet);
  revalidatePath("/", "layout");
  return JSON.parse(JSON.stringify(result));
}

export async function rollDice(wager: number, threshold: number, side: "over" | "under") {
  await boot();
  const result = await G.playDice(wager, threshold, side);
  revalidatePath("/", "layout");
  return JSON.parse(JSON.stringify(result));
}

export async function flipCoin(wager: number, choice: "heads" | "tails") {
  await boot();
  const result = await G.playCoinflip(wager, choice);
  revalidatePath("/", "layout");
  return JSON.parse(JSON.stringify(result));
}

export async function getLastResultsAction(gameSlug: string) {
  await boot();
  return G.getLastResults(gameSlug, 15);
}

export async function getHotColdRouletteAction() {
  await boot();
  return G.getHotColdRoulette();
}

// ============== TOP-UP ==============
export async function requestTopUpAction(input: Parameters<typeof G.requestTopUp>[0]) { await boot(); return G.requestTopUp(input); }
export async function getMyTopUpsAction() { await boot(); return G.getMyTopUps(); }

// ============== WITHDRAWAL ==============
export async function requestWithdrawalAction(input: Parameters<typeof G.requestWithdrawal>[0]) {
  await boot();
  await rateLimitAction(`withdrawal`);
  return G.requestWithdrawal(input);
}
export async function getMyWithdrawalsAction() { await boot(); return G.getMyWithdrawals(); }

// ============== BANK ACCOUNTS ==============
export async function getBankAccountsAction() { await boot(); return G.getBankAccounts(); }

// ============== NOTIFICATIONS ==============
export async function getMyNotificationsAction() { await boot(); return G.getMyNotifications(); }
export async function markNotificationReadAction(id: number) { await boot(); return G.markNotificationRead(id); }
export async function markAllNotificationsReadAction() { await boot(); return G.markAllNotificationsRead(); }

// ============== DAILY BONUS ==============
export async function claimDailyBonusAction() {
  await boot();
  await rateLimitAction(`daily_bonus`);
  return G.claimDailyBonus();
}
export async function canClaimDailyAction() { await boot(); return G.canClaimDaily(); }

// ============== CHAT ==============
export async function getChatMessagesAction() { await boot(); return G.getChatMessages(50); }
export async function sendChatMessageAction(message: string) {
  await boot();
  await rateLimitAction(`chat`);
  return G.sendChatMessage(message);
}

// ============== LEADERBOARD ==============
export async function getLeaderboardAction(limit = 20) { await boot(); return G.getLeaderboard(limit); }
export async function getTournamentLeaderboardAction(metric: string) { await boot(); return G.getTournamentLeaderboard(metric); }
export async function getActiveTournamentAction() { await boot(); return G.getActiveTournament(); }

// ============== ADMIN ==============
export async function getAdminData() {
  await boot();
  const o = await requireOwner();
  const [games, stats, users, pendingTopUps, pendingWithdrawals, allBankAccounts, allAnnouncements, auditLogData] = await Promise.all([
    G.getAllGames(), G.getStats(), G.getAllUsers(), G.getPendingTopUps(), G.getPendingWithdrawals(),
    G.getAllBankAccounts(), G.getAllAnnouncements(), G.getAuditLog(200),
  ]);
  return JSON.parse(JSON.stringify({ owner: o, games, stats, users, pendingTopUps, pendingWithdrawals, allBankAccounts, allAnnouncements, auditLog: auditLogData }));
}

export async function adminUpdateGame(slug: string, patch: unknown) { await boot(); await G.updateGame(slug, patch); revalidatePath("/", "layout"); }
export async function adminUpdateSetting(key: string, value: unknown) { await boot(); await G.updateSetting(key, value); revalidatePath("/", "layout"); }
export async function adminSetBalance(userId: number, amount: number) { await boot(); await G.setUserBalance(userId, amount); revalidatePath("/", "layout"); }
export async function adminAddBalance(userId: number, amount: number) { await boot(); await G.adjustUserBalance(userId, amount); revalidatePath("/", "layout"); }
export async function adminSetUserLuck(userId: number, luckMode: string, customWinRate: number, luckMultiplier = 1.0) {
  await boot();
  await G.setUserLuck(userId, luckMode, customWinRate, luckMultiplier);
  revalidatePath("/", "layout");
}
export async function adminSetUserRole(userId: number, role: string) {
  await boot();
  await G.setUserRole(userId, role);
  revalidatePath("/", "layout");
}
export async function devSetMyLuckAction(luckMode: string, customWinRate: number, luckMultiplier = 1.0) {
  await boot();
  const res = await G.devSetMyLuck(luckMode, customWinRate, luckMultiplier);
  revalidatePath("/", "layout");
  return res;
}
export async function adminToggleUserBan(userId: number, banned: boolean) { await boot(); await G.toggleUserBan(userId, banned); revalidatePath("/", "layout"); }
export async function adminToggleUserActive(userId: number, active: boolean) { await boot(); await G.toggleUserActive(userId, active); revalidatePath("/", "layout"); }
export async function adminReviewTopUp(topUpId: number, status: "approved" | "rejected", notes?: string) { await boot(); await G.reviewTopUp(topUpId, status, notes); revalidatePath("/", "layout"); }
export async function adminReviewWithdrawal(withdrawalId: number, status: "approved" | "rejected", notes?: string) { await boot(); await G.reviewWithdrawal(withdrawalId, status, notes); revalidatePath("/", "layout"); }
export async function adminCreateBankAccount(input: Parameters<typeof G.createBankAccount>[0]) { await boot(); return G.createBankAccount(input); }
export async function adminToggleBankAccount(id: number, active: boolean) { await boot(); await G.toggleBankAccount(id, active); revalidatePath("/", "layout"); }
export async function adminCreateAnnouncement(input: Parameters<typeof G.createAnnouncement>[0]) { await boot(); return G.createAnnouncement(input); }
export async function adminToggleAnnouncement(id: number, active: boolean) { await boot(); await G.toggleAnnouncement(id, active); revalidatePath("/", "layout"); }
export async function adminChangePassword(oldPassword: string, newPassword: string) { await boot(); await changeOwnerPassword(oldPassword, newPassword); }

export async function userChangePassword(oldPassword: string, newPassword: string) { await boot(); await changeUserPassword(oldPassword, newPassword); }
export async function userGetProfile() { await boot(); return requireUser(); }
