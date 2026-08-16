"use client";
import { useState, useEffect, useRef } from "react";
import { spinSlots } from "@/app/actions";
import { BetControls } from "../bet-controls";
import { LastResults } from "../last-results";
import { Confetti } from "@/components/confetti";
import { showToast } from "@/components/toast";
import { sound } from "@/lib/sound";
import { SlotSymbolIcon } from "@/components/casino-icons";

const ALL_SYMBOLS = ["7", "DIAMOND", "STAR", "BELL", "BAR", "CHERRY", "LEMON"];

export function SlotsGame({
  initialReels,
  config,
  balance,
  minBet,
  maxBet,
}: {
  initialReels: string[];
  config: { reels: string[][]; payouts: Record<string, number>; twoMatchMultiplier: number };
  balance: number;
  minBet: number;
  maxBet: number;
}) {
  const [reels, setReels] = useState(initialReels);
  const [spinning, setSpinning] = useState(false);
  const [reelSpinning, setReelSpinning] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [wager, setWager] = useState(Math.max(minBet, 100));
  const [lastResult, setLastResult] = useState<{
    payout: number;
    result: string;
    matchType: string;
    reels: string[];
  } | null>(null);
  const [balanceLocal, setBalanceLocal] = useState(balance);
  const [glow, setGlow] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Animated reel visual strips (for smooth high-speed rolling motion)
  const [reelStrips, setReelStrips] = useState<[string[], string[], string[]]>([
    [initialReels[0] || "7", "DIAMOND", "7", "CHERRY", "STAR"],
    [initialReels[1] || "STAR", "BELL", "DIAMOND", "7", "BAR"],
    [initialReels[2] || "CHERRY", "7", "BELL", "LEMON", "DIAMOND"],
  ]);

  useEffect(() => {
    sound.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    setBalanceLocal(balance);
  }, [balance]);

  async function handleSpin() {
    if (spinning) return;
    if (wager > balanceLocal) {
      showToast("Saldo koin tidak cukup!", "error");
      return;
    }

    setSpinning(true);
    setGlow(false);
    setConfetti(false);
    setLastResult(null);
    setBalanceLocal((b) => b - wager);
    setReelSpinning([true, true, true]);
    sound.playChip();

    // High speed rolling blur strips
    const spinInterval = setInterval(() => {
      setReelStrips([
        Array.from({ length: 5 }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]),
        Array.from({ length: 5 }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]),
        Array.from({ length: 5 }, () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]),
      ]);
    }, 55);

    try {
      const result = await spinSlots(wager);

      // Staggered stop timing
      setTimeout(() => {
        setReelSpinning([false, true, true]);
        sound.playReelStop(0.9);
        setReels((prev) => [result.reels[0], prev[1], prev[2]]);
      }, 1500);

      setTimeout(() => {
        setReelSpinning([false, false, true]);
        sound.playReelStop(1.1);
        setReels((prev) => [result.reels[0], result.reels[1], prev[2]]);
      }, 2100);

      setTimeout(() => {
        clearInterval(spinInterval);
        setReelSpinning([false, false, false]);
        sound.playReelStop(1.3);
        setReels(result.reels);
        setLastResult(result);
        setBalanceLocal((b) => b + result.payout);

        if (result.result === "win") {
          setGlow(true);
          sound.playWin(result.payout >= wager * 10);
          if (result.payout >= wager * 10) setConfetti(true);
          showToast(`MENANG! +${result.payout.toLocaleString("id-ID")} koin`, "success");
        }
        setSpinning(false);
      }, 2700);
    } catch (e) {
      clearInterval(spinInterval);
      setReelSpinning([false, false, false]);
      setSpinning(false);
      showToast((e as Error).message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <Confetti active={confetti} />

      {/* Header */}
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— VEGAS SLOTS —</div>
          <h1 className="font-display text-4xl md:text-5xl">
            <span className="text-gold-metal">LUCKY</span>
            <span className="font-serif-italic text-ivory/80"> Reels</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-1.5 rounded border border-line-2 bg-ink-3 px-3 py-1.5 text-xs text-gold hover:border-gold"
          >
            <span>{soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}</span>
          </button>
          <PayoutTable payouts={config.payouts} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        {/* Main Slot Machine Cabinet */}
        <div className={`card-luxe relative overflow-hidden p-6 md:p-10 ${glow ? "ring-4 ring-gold shadow-2xl shadow-gold/40" : ""}`}>
          <div className="slot-frame mx-auto max-w-lg overflow-hidden rounded-2xl border-4 border-gold-deep bg-gradient-to-b from-amber-950 via-stone-950 to-black p-4 shadow-2xl md:p-6">
            {/* Top Marquee Lighting */}
            <div className="mb-4 flex items-center justify-between rounded-t-lg border-b-2 border-gold/40 bg-gradient-to-r from-yellow-900/60 via-amber-600/40 to-yellow-900/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-display text-xs tracking-widest text-gold-bright font-black">
                  GOLDEN ARENA 777 JACKPOT
                </span>
              </div>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse delay-75" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
              </div>
            </div>

            {/* 3 Physical Reel Display Windows with Horizontal Payline */}
            <div className="relative overflow-hidden rounded-xl border-4 border-zinc-800 bg-gradient-to-b from-black via-zinc-950 to-black p-4 shadow-inner">
              {/* Payline Laser Center Line */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_#f4d03f]" />

              {/* Top & Bottom Glass Shadow Gradients */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-black via-black/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-black via-black/80 to-transparent" />

              {/* 3 Reels Grid */}
              <div className="flex gap-3">
                {[0, 1, 2].map((idx) => {
                  const isThisSpinning = reelSpinning[idx];
                  const currentSymbol = isThisSpinning ? reelStrips[idx][0] : reels[idx];

                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-gold-deep/70 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-8 shadow-2xl transition-all ${
                        isThisSpinning ? "scale-[0.98]" : "scale-100"
                      }`}
                      style={{
                        minHeight: 220,
                        boxShadow: "inset 0 0 25px rgba(0,0,0,0.9)",
                      }}
                    >
                      {/* Inner Spinning Content with SVG Vector Graphic */}
                      <div
                        className={`flex flex-col items-center justify-center transition-all duration-150 ${
                          isThisSpinning
                            ? "blur-[2px] opacity-75 translate-y-3"
                            : "blur-0 opacity-100 translate-y-0"
                        }`}
                      >
                        <SlotSymbolIcon symbol={currentSymbol} className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(244,208,63,0.5)]" />
                      </div>

                      {/* Subtle Reel Divider Lights */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl border border-gold/20" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Panel */}
            <div className="mt-4 flex items-center justify-between rounded-b-lg border-t border-gold/30 bg-black/80 px-4 py-2.5">
              <span className="font-display text-[10px] tracking-widest text-gold-deep">
                STATUS: {spinning ? "GULUNGAN BERPUTAR..." : lastResult?.result === "win" ? "WINNER!" : "READY"}
              </span>
              <span className="font-display text-sm font-bold text-gold">
                {lastResult?.result === "win"
                  ? `+${lastResult.payout.toLocaleString("id-ID")}`
                  : "TARUHAN: " + wager.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Win / Match Announcement */}
          <div className="mt-6 text-center">
            {lastResult ? (
              <div
                className={`inline-block rounded-xl border-2 px-8 py-3.5 shadow-2xl transition-all ${
                  lastResult.result === "win"
                    ? "border-gold bg-gold/15 animate-in zoom-in-95"
                    : "border-line-2 bg-ink-3"
                }`}
              >
                <div className="font-display text-xs tracking-[0.3em] text-gold uppercase font-bold">
                  {lastResult.matchType === "three_match"
                    ? "🌟 TRIPLE MATCH JACKPOT 🌟"
                    : lastResult.matchType === "two_match"
                    ? "✨ DOUBLE MATCH ✨"
                    : "NO MATCH"}
                </div>
                <div
                  className={`mt-1 font-display text-3xl font-black ${
                    lastResult.result === "win" ? "text-gold-metal" : "text-ivory/50"
                  }`}
                >
                  {lastResult.result === "win"
                    ? `+${lastResult.payout.toLocaleString("id-ID")} KOIN`
                    : "Belum Beruntung"}
                </div>
              </div>
            ) : (
              <div className="font-serif-italic text-ivory/40">Pasang koin dan putar slot untuk memicu Jackpot!</div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          <BetControls
            balance={balanceLocal}
            wager={wager}
            setWager={setWager}
            minBet={minBet}
            maxBet={maxBet}
            onPlay={handleSpin}
            disabled={spinning}
            actionLabel="PUTAR SLOTS (SPIN)"
          />
          <LastResults gameSlug="slots" />
        </div>
      </div>
    </div>
  );
}

function PayoutTable({ payouts }: { payouts: Record<string, number> }) {
  return (
    <div className="hidden border border-line-2 bg-ink-3/90 p-2.5 text-[10px] md:flex items-center gap-3 rounded-lg">
      <div className="font-display text-[9px] tracking-widest text-gold-deep border-r border-line-2 pr-2">
        PAYOUT (3 MATCH)
      </div>
      <div className="flex items-center gap-3">
        {Object.entries(payouts).slice(0, 5).map(([sym, mult]) => (
          <div key={sym} className="flex items-center gap-1">
            <SlotSymbolIcon symbol={sym} className="w-5 h-5" />
            <strong className="text-gold">×{mult}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
