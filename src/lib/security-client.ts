// Client-safe utilities (no server-only imports).

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
