import crypto from "crypto";

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "127.0.0.1";
  return headers.get("x-real-ip") ?? "127.0.0.1";
}

export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") ?? "";
}

export function fingerprint(ip: string, userAgent: string): string {
  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex").slice(0, 32);
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function generateRandomCode(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function fairnessHash(serverSeed: string, clientSeed: string, nonce: number): string {
  return crypto.createHmac("sha256", serverSeed).update(`${clientSeed}:${nonce}`).digest("hex");
}

export function sanitize(input: string, maxLength = 255): string {
  return input.trim().replace(/[<>]/g, "").slice(0, maxLength);
}

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat", "Ekstra Kuat"];
  return { score, label: labels[score] ?? "Sangat Lemah" };
}
