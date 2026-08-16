"use client";

import { useState } from "react";
import { devSetMyLuckAction, adminAddBalance } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DevToolbarProps {
  user: {
    id: number;
    username: string;
    role: string;
    luckMode?: string;
    customWinRate?: number;
    luckMultiplier?: number;
  } | null;
}

export function DevToolbar({ user }: DevToolbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLuck, setCurrentLuck] = useState(user?.luckMode || "always_win");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user || (user.role !== "dev" && user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  async function setLuck(mode: string, winRate = 50, multiplier = 1.0) {
    setBusy(true);
    setMsg("");
    try {
      await devSetMyLuckAction(mode, winRate, multiplier);
      setCurrentLuck(mode);
      setMsg(`Kehokian diubah: ${mode.toUpperCase()} (${winRate}%)`);
      router.refresh();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function injectCoins(amount: number) {
    if (!user) return;
    setBusy(true);
    try {
      await adminAddBalance(user.id, amount);
      setMsg(`+${amount.toLocaleString("id-ID")} koin ditambahkan!`);
      router.refresh();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const luckOptions = [
    { key: "always_win", label: "🍀 100% Menang", desc: "Selalu Maxwin / Win", winRate: 100, mult: 2.0, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
    { key: "super_hoki", label: "🌟 95% Super Hoki", desc: "Sangat mudah menang", winRate: 95, mult: 1.5, color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    { key: "normal", label: "🎲 Normal (Game RTP)", desc: "Standar kasino", winRate: 50, mult: 1.0, color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
    { key: "rungkad", label: "💀 8% Rungkad / Apes", desc: "Hampir selalu kalah", winRate: 8, mult: 0.8, color: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
    { key: "always_lose", label: "🚫 0% Selalu Kalah", desc: "Pasti kalah 100%", winRate: 0, mult: 0.0, color: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Collapsed Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border-2 border-gold bg-gradient-to-r from-wine-deep via-ink-2 to-wine-deep px-4 py-2.5 shadow-2xl shadow-gold/20 backdrop-blur transition hover:scale-105"
        >
          <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-display text-[11px] font-black tracking-widest text-gold-metal">
            ⚡ DEV HUD: <span className="text-ivory">{currentLuck.toUpperCase()}</span>
          </span>
        </button>
      )}

      {/* Expanded Control Box */}
      {open && (
        <div className="w-[340px] rounded-xl border-2 border-gold/60 bg-ink-2/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-display text-xs font-black tracking-widest text-gold-metal">
                DEV CONTROL PANEL
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-ivory/50 hover:text-ivory"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 text-[10px] text-ivory/60">
            Akun: <strong className="text-gold">{user.username}</strong> | Role: <span className="rounded bg-gold/20 px-1 py-0.5 font-mono text-[9px] text-gold">{user.role.toUpperCase()}</span>
          </div>

          {msg && (
            <div className="mt-2 rounded border border-gold/40 bg-gold/10 p-2 text-center text-xs text-gold">
              {msg}
            </div>
          )}

          {/* Quick Luck Mode Selectors */}
          <div className="mt-3">
            <div className="mb-1.5 font-display text-[9px] tracking-[0.2em] text-gold-deep">
              SETTING KEHOKIAN KAMU SAAT INI:
            </div>
            <div className="space-y-1.5">
              {luckOptions.map((opt) => (
                <button
                  key={opt.key}
                  disabled={busy}
                  onClick={() => setLuck(opt.key, opt.winRate, opt.mult)}
                  className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-xs transition ${
                    currentLuck === opt.key
                      ? `${opt.color} ring-1 ring-gold font-bold`
                      : "border-line-2 bg-ink-3 text-ivory/70 hover:border-gold/40 hover:text-ivory"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] opacity-60">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balance Injections */}
          <div className="mt-3 border-t border-line pt-2.5">
            <div className="mb-1.5 font-display text-[9px] tracking-[0.2em] text-gold-deep">
              INJECT SALDO INSTAN:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                disabled={busy}
                onClick={() => injectCoins(1_000_000)}
                className="rounded border border-line-2 bg-ink-3 py-1 font-mono text-[10px] text-gold hover:border-gold hover:bg-gold/10"
              >
                +1 Juta
              </button>
              <button
                disabled={busy}
                onClick={() => injectCoins(10_000_000)}
                className="rounded border border-line-2 bg-ink-3 py-1 font-mono text-[10px] text-gold hover:border-gold hover:bg-gold/10"
              >
                +10 Juta
              </button>
              <button
                disabled={busy}
                onClick={() => injectCoins(100_000_000)}
                className="rounded border border-line-2 bg-ink-3 py-1 font-mono text-[10px] text-gold hover:border-gold hover:bg-gold/10"
              >
                +100 Juta
              </button>
            </div>
          </div>

          {/* Jump to Admin Panel */}
          <div className="mt-3 border-t border-line pt-2.5 flex items-center justify-between text-xs">
            <Link
              href="/admin"
              className="text-[11px] font-display tracking-widest text-gold hover:underline"
            >
              Buka Owner / Admin Panel →
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="text-[10px] text-ivory/40 hover:text-ivory"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
