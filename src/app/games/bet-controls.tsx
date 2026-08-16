"use client";
import React from "react";
import { sound } from "@/lib/sound";
import { CasinoChipSVG } from "@/components/casino-icons";

export function BetControls({
  balance,
  wager,
  setWager,
  minBet,
  maxBet,
  onPlay,
  disabled,
  actionLabel = "MAIN",
  extra,
}: {
  balance: number;
  wager: number;
  setWager: (n: number) => void;
  minBet: number;
  maxBet: number;
  onPlay: () => void;
  disabled?: boolean;
  actionLabel?: string;
  extra?: React.ReactNode;
}) {
  const chips: Array<{ value: number; label: string; color: "gold" | "red" | "black" | "green" | "purple" }> = [
    { value: 100, label: "100", color: "red" },
    { value: 1_000, label: "1K", color: "black" },
    { value: 10_000, label: "10K", color: "green" },
    { value: 100_000, label: "100K", color: "purple" },
    { value: 1_000_000, label: "1M", color: "gold" },
    { value: 10_000_000, label: "10M", color: "gold" },
  ];

  const clamp = (n: number) => Math.max(minBet, Math.min(maxBet, Math.min(balance || minBet, Math.floor(n))));
  const maxPlayable = Math.max(minBet, Math.min(maxBet, balance || minBet));
  const pct = Math.min(100, Math.max(0, ((wager - minBet) / Math.max(1, maxPlayable - minBet)) * 100));

  return (
    <aside className="card-luxe space-y-5 p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">SALDO AKUN</div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[9px] font-display text-emerald-400 tracking-widest">LIVE</span>
        </div>
      </div>
      <div>
        <div className="font-display text-3xl md:text-4xl font-black tabular-nums text-gold-metal">
          {balance.toLocaleString("id-ID")}
        </div>
        <div className="mt-0.5 font-display text-[9px] tracking-[0.3em] text-ivory/40">KOIN TERSEDIA</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-display text-[10px] tracking-[0.3em] text-gold-deep">JUMLAH TARUHAN</label>
          <div className="flex items-center gap-1.5">
            <CasinoChipSVG value="" color="gold" className="w-5 h-5" />
            <input
              type="number"
              min={minBet}
              max={maxPlayable}
              value={wager}
              disabled={disabled}
              onChange={(e) => setWager(clamp(Number(e.target.value)))}
              className="w-32 rounded border border-gold/50 bg-black/80 px-2 py-1 text-right font-display text-sm font-black tabular-nums text-gold outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        <input
          type="range"
          min={minBet}
          max={maxPlayable}
          value={Math.min(wager, maxPlayable)}
          onChange={(e) => {
            sound.playChip();
            setWager(clamp(Number(e.target.value)));
          }}
          className="luxe-slider w-full cursor-pointer"
          style={{ ["--val" as string]: `${pct}%` }}
          disabled={disabled}
        />

        {/* 3D SVG Casino Chips */}
        <div className="grid grid-cols-6 gap-1 pt-2">
          {chips.map((c) => {
            const isSelected = wager === c.value;
            const canAfford = c.value <= balance;
            return (
              <button
                key={c.value}
                onClick={() => {
                  sound.playChip();
                  setWager(clamp(c.value));
                }}
                disabled={disabled || !canAfford}
                title={`${c.value.toLocaleString("id-ID")} Koin`}
                className={`group relative flex flex-col items-center justify-center p-1 transition-all ${
                  isSelected ? "scale-110 drop-shadow-[0_0_12px_#f4d03f]" : "hover:scale-105"
                } ${!canAfford ? "opacity-30 grayscale" : ""}`}
              >
                <CasinoChipSVG value={c.label} color={c.color} className="w-11 h-11 transition-transform group-hover:rotate-12" />
              </button>
            );
          })}
        </div>

        {/* Quick Bet Fractions */}
        <div className="grid grid-cols-4 gap-1.5 pt-2">
          <button
            onClick={() => {
              sound.playChip();
              setWager(clamp(minBet));
            }}
            disabled={disabled}
            className="rounded border border-line-2 bg-ink-3 py-2 font-display text-[10px] tracking-[0.2em] text-ivory/60 transition hover:border-gold-deep hover:text-gold disabled:opacity-30"
          >
            MIN
          </button>
          <button
            onClick={() => {
              sound.playChip();
              setWager(clamp(Math.floor(wager / 2)));
            }}
            disabled={disabled}
            className="rounded border border-line-2 bg-ink-3 py-2 font-display text-[10px] tracking-[0.2em] text-ivory/60 transition hover:border-gold-deep hover:text-gold disabled:opacity-30"
          >
            ½
          </button>
          <button
            onClick={() => {
              sound.playChip();
              setWager(clamp(wager * 2));
            }}
            disabled={disabled}
            className="rounded border border-line-2 bg-ink-3 py-2 font-display text-[10px] tracking-[0.2em] text-ivory/60 transition hover:border-gold-deep hover:text-gold disabled:opacity-30"
          >
            2×
          </button>
          <button
            onClick={() => {
              sound.playChip();
              setWager(clamp(balance));
            }}
            disabled={disabled || balance < minBet}
            className="rounded border border-gold/60 bg-gold/10 py-2 font-display text-[10px] tracking-[0.2em] font-bold text-gold transition hover:bg-gold/20 disabled:opacity-30"
          >
            MAX
          </button>
        </div>
      </div>

      {extra}

      <button
        onClick={onPlay}
        disabled={disabled || balance < minBet}
        className="btn-gold-luxe group relative w-full py-4 text-center font-display text-sm tracking-[0.25em] font-black uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {disabled ? "SEDANG MEMUTAR..." : actionLabel}
        </span>
      </button>
    </aside>
  );
}
