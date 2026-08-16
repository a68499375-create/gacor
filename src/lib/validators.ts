import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(5).max(32).regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, dan underscore"),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(16).regex(/^[0-9+\-\s()]+$/, "Nomor telepon tidak valid"),
  fullName: z.string().min(2).max(128),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nik: z.string().min(16).max(20).regex(/^[0-9]+$/),
  address: z.string().min(10).max(500),
  city: z.string().min(2).max(64),
  province: z.string().min(2).max(64),
  postalCode: z.string().min(3).max(12).regex(/^[0-9]+$/),
  securityQuestion: z.string().min(5).max(255),
  securityAnswer: z.string().min(2).max(128),
  referralCode: z.string().max(16).optional(),
}).refine((data) => data.password === data.confirmPassword, { message: "Password tidak cocok", path: ["confirmPassword"] });

export const topUpSchema = z.object({
  amount: z.number().int().min(1000).max(1_000_000_000),
  method: z.enum(["bank", "ewallet", "qris", "crypto"]),
  accountName: z.string().min(2).max(128),
  reference: z.string().min(3).max(128),
  proofUrl: z.string().url().max(2048),
});

export const withdrawalSchema = z.object({
  amount: z.number().int().min(1000),
  method: z.enum(["bank", "ewallet", "crypto"]),
  accountName: z.string().min(2).max(128),
  accountNumber: z.string().min(5).max(128),
  bankName: z.string().max(128).optional(),
});

export const bankAccountSchema = z.object({
  method: z.enum(["bank", "ewallet", "qris", "crypto"]),
  name: z.string().min(2).max(64),
  number: z.string().min(3).max(128),
  holder: z.string().min(2).max(128),
});

export const announcementSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(5).max(2000),
  type: z.enum(["info", "warning", "promo"]),
  dismissible: z.boolean().default(true),
  showOnce: z.boolean().default(false),
});

export const gameUpdateSchema = z.object({
  rtp: z.number().int().min(1).max(99).optional(),
  minBet: z.number().int().min(1).optional(),
  maxBet: z.number().int().min(1).optional(),
  enabled: z.number().int().min(0).max(1).optional(),
  name: z.string().min(2).max(128).optional(),
});
