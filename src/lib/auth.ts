"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { users, owner, sessions, otpCodes } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getClientIp, getUserAgent, fingerprint, generateRandomCode, sanitize, passwordStrength } from "./security";
import { getRequestHeaders } from "./request";
import { checkLoginRateLimit, recordFailedLogin, resetLoginAttempts, checkActionRateLimit } from "./rate-limit";
import { logAudit } from "./audit";
import { registerSchema } from "./validators";
import { generateReferralCode } from "@/db/seed";

const SESSION_DAYS = 7;

function randomToken() { return crypto.randomBytes(48).toString("hex"); }

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain: string, hash: string) {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

async function createSession(userId: number) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const h = await getRequestHeaders();
  const ip = getClientIp(h);
  const userAgent = getUserAgent(h);
  await db.insert(sessions).values({
    userId,
    token,
    ip,
    userAgent,
    fingerprint: fingerprint(ip, userAgent),
    expiresAt,
  });
  return token;
}

async function setSessionCookie(name: string, token: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export type RegisterInput = {
  username: string; password: string; confirmPassword: string; email: string; phone: string;
  fullName: string; birthDate: string; nik: string; address: string; city: string;
  province: string; postalCode: string; securityQuestion: string; securityAnswer: string;
  referralCode?: string;
};

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues.map((e) => e.message).join(", "));

  const strength = passwordStrength(input.password);
  if (strength.score < 2) throw new Error("Password terlalu lemah. Minimal 8 karakter dengan huruf besar & angka.");

  const h = await getRequestHeaders();
  const ip = getClientIp(h);
  const rate = await checkActionRateLimit(`register:${ip}`);
  if (!rate.allowed) throw new Error("Terlalu banyak pendaftaran. Coba lagi nanti.");

  const username = sanitize(input.username.toLowerCase());
  const email = sanitize(input.email.toLowerCase());

  const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existingUser) throw new Error("Username sudah digunakan.");
  const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingEmail) throw new Error("Email sudah terdaftar.");
  const [existingNik] = await db.select().from(users).where(eq(users.nik, input.nik)).limit(1);
  if (existingNik) throw new Error("NIK sudah terdaftar.");

  let referredBy: number | null = null;
  if (input.referralCode) {
    const [refUser] = await db.select().from(users).where(eq(users.referralCode, input.referralCode.toUpperCase())).limit(1);
    if (refUser) referredBy = refUser.id;
  }

  const welcomeBonus = 5000;
  const code = generateReferralCode();

  const [inserted] = await db.insert(users).values({
    username,
    passwordHash: await hashPassword(input.password),
    email,
    phone: sanitize(input.phone),
    fullName: sanitize(input.fullName),
    birthDate: input.birthDate,
    nik: input.nik,
    address: sanitize(input.address),
    city: sanitize(input.city),
    province: sanitize(input.province),
    postalCode: input.postalCode,
    securityQuestion: sanitize(input.securityQuestion),
    securityAnswerHash: await hashPassword(input.securityAnswer.toLowerCase().trim()),
    balance: welcomeBonus,
    referralCode: code,
    referredBy,
  }).returning();

  await logAudit({ actorType: "system", actorId: 0, action: "USER_REGISTERED", targetType: "user", targetId: inserted.id, details: { username } });
  return { id: inserted.id, referralCode: code };
}

export async function loginUser(username: string, password: string) {
  const rateKey = `login:${username.toLowerCase()}`;
  const rate = await checkLoginRateLimit(rateKey);
  if (!rate.allowed) throw new Error(`Akun terkunci. Coba lagi ${rate.lockedUntil ? rate.lockedUntil.toLocaleTimeString("id-ID") : "nanti"}.`);

  const [u] = await db.select().from(users).where(eq(users.username, sanitize(username.toLowerCase()))).limit(1);
  if (!u || !(await verifyPassword(password, u.passwordHash))) {
    await recordFailedLogin(rateKey);
    throw new Error("Username atau kata sandi salah.");
  }
  if (u.isBanned) throw new Error("Akun ini telah diblokir.");
  if (!u.isActive) throw new Error("Akun tidak aktif.");

  await resetLoginAttempts(rateKey);
  const token = await createSession(u.id);
  await setSessionCookie("session", token);
  await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, u.id));
  await logAudit({ actorType: "user", actorId: u.id, action: "USER_LOGIN" });
  return { id: u.id, username: u.username, role: u.role };
}

export async function loginOwner(username: string, password: string) {
  const rateKey = `owner_login:${username.toLowerCase()}`;
  const rate = await checkLoginRateLimit(rateKey);
  if (!rate.allowed) throw new Error("Terlalu banyak percobaan. Coba lagi nanti.");

  const cleanUser = sanitize(username.toLowerCase());

  // Check owner table first (for 'boss')
  const [o] = await db.select().from(owner).where(eq(owner.username, cleanUser)).limit(1);
  if (o && (await verifyPassword(password, o.passwordHash))) {
    await resetLoginAttempts(rateKey);
    const token = await createSession(0);
    await setSessionCookie("admin_session", token);
    await logAudit({ actorType: "owner", actorId: o.id, action: "OWNER_LOGIN" });
    return { username: o.username };
  }

  // Also check dev / admin users from users table
  const [u] = await db.select().from(users).where(eq(users.username, cleanUser)).limit(1);
  if (u && (u.role === "dev" || u.role === "admin" || u.role === "owner") && (await verifyPassword(password, u.passwordHash))) {
    if (u.isBanned) throw new Error("Akun ini telah diblokir.");
    if (!u.isActive) throw new Error("Akun tidak aktif.");
    await resetLoginAttempts(rateKey);
    const token = await createSession(u.id);
    await setSessionCookie("admin_session", token);
    await setSessionCookie("session", token);
    await logAudit({ actorType: "owner", actorId: u.id, action: "OWNER_DEV_LOGIN" });
    return { username: u.username };
  }

  await recordFailedLogin(rateKey);
  throw new Error("Kredensial owner / dev salah.");
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  cookieStore.set("session", "", { maxAge: 0, path: "/" });
}

export async function logoutOwner() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  cookieStore.set("admin_session", "", { maxAge: 0, path: "/" });
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const [s] = await db.select().from(sessions).where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()))).limit(1);
    if (!s) return null;

    const [u] = await db.select().from(users).where(eq(users.id, s.userId)).limit(1);
    if (!u || u.isBanned) return null;

    return {
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      fullName: u.fullName,
      birthDate: typeof u.birthDate === "string" ? u.birthDate : String(u.birthDate),
      nik: u.nik,
      address: u.address,
      city: u.city,
      province: u.province,
      postalCode: u.postalCode,
      securityQuestion: u.securityQuestion,
      balance: Number(u.balance) || 0,
      withdrawableBalance: Number(u.withdrawableBalance) || 0,
      totalWagered: Number(u.totalWagered) || 0,
      totalDeposited: Number(u.totalDeposited) || 0,
      totalWithdrawn: Number(u.totalWithdrawn) || 0,
      currentWinStreak: u.currentWinStreak,
      longestWinStreak: u.longestWinStreak,
      vipLevel: u.vipLevel,
      isActive: u.isActive,
      isBanned: u.isBanned,
      role: u.role,
      luckMode: u.luckMode,
      customWinRate: u.customWinRate,
      luckMultiplier: u.luckMultiplier,
      referralCode: u.referralCode,
      avatarUrl: u.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("Silakan login terlebih dahulu.");
  return u;
}

export async function getCurrentOwner() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (token) {
      const [s] = await db.select().from(sessions).where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()))).limit(1);
      if (s) {
        if (s.userId === 0) {
          const [o] = await db.select().from(owner).limit(1);
          if (o) return { id: o.id, username: o.username, email: o.email };
        } else {
          const [u] = await db.select().from(users).where(eq(users.id, s.userId)).limit(1);
          if (u && (u.role === "dev" || u.role === "admin" || u.role === "owner")) {
            return {
              id: u.id,
              username: u.username,
              email: u.email,
              role: u.role,
            };
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireOwner() {
  const o = await getCurrentOwner();
  if (!o) throw new Error("Akses ditolak. Hanya owner / dev yang boleh masuk.");
  return o;
}

export async function changeUserPassword(oldPassword: string, newPassword: string) {
  const u = await requireUser();
  const strength = passwordStrength(newPassword);
  if (strength.score < 2) throw new Error("Password baru terlalu lemah.");
  const [row] = await db.select({ pw: users.passwordHash }).from(users).where(eq(users.id, u.id)).limit(1);
  if (!row || !(await verifyPassword(oldPassword, row.pw))) throw new Error("Kata sandi lama salah.");
  await db.update(users).set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() }).where(eq(users.id, u.id));
  await logAudit({ actorType: "user", actorId: u.id, action: "USER_PASSWORD_CHANGED" });
  return true;
}

export async function changeOwnerPassword(oldPassword: string, newPassword: string) {
  const o = await requireOwner();
  const strength = passwordStrength(newPassword);
  if (strength.score < 2) throw new Error("Password baru terlalu lemah.");
  const [row] = await db.select({ pw: owner.passwordHash }).from(owner).where(eq(owner.id, o.id)).limit(1);
  if (!row || !(await verifyPassword(oldPassword, row.pw))) throw new Error("Kata sandi lama salah.");
  await db.update(owner).set({ passwordHash: await hashPassword(newPassword) }).where(eq(owner.id, o.id));
  await logAudit({ actorType: "owner", actorId: o.id, action: "OWNER_PASSWORD_CHANGED" });
  return true;
}

export async function createOtp(userId: number, purpose: "email_verify" | "password_reset") {
  const code = generateRandomCode(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.insert(otpCodes).values({ userId, code, purpose, expiresAt });
  console.log(`[OTP ${purpose}] userId=${userId} code=${code}`);
  return { code };
}

export async function verifyOtp(userId: number, purpose: "email_verify" | "password_reset", code: string) {
  const [row] = await db.select().from(otpCodes).where(and(eq(otpCodes.userId, userId), eq(otpCodes.purpose, purpose), eq(otpCodes.code, code), eq(otpCodes.used, false), gt(otpCodes.expiresAt, new Date()))).limit(1);
  if (!row) return false;
  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, row.id));
  return true;
}
