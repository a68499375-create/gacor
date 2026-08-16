"use client";
import { useState, useEffect } from "react";
import { rollDice } from "@/app/actions";
import { BetControls } from "../bet-controls";
import { LastResults } from "../last-results";
import { Confetti } from "@/components/confetti";
import { showToast } from "@/components/toast";
import { sound } from "@/lib/sound";

export function DiceGame({ balance, minBet, maxBet }: { balance: number; minBet: number; maxBet: number }) {
  const [wager, setWager] = useState(Math.max(minBet, 50));
  const [balanceLocal, setBalanceLocal] = useState(balance);
  const [threshold, setThreshold] = useState(50);
  const [side, setSide] = useState<"over" | "under">("over");
  const [rolling, setRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState<number>(50);
  const [result, setResult] = useState<{ roll: number; payout: number; result: string; multiplier: number } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [diceRotation, setDiceRotation] = useState({ x: 0, y: 0, z: 0 });

  const fairProb = side === "over" ? (99 - threshold) / 100 : threshold / 100;
  const multiplier = Math.max(1.01, 0.97 / Math.max(0.01, fairProb));
  const winChance = Math.round(fairProb * 100);

  useEffect(() => {
    sound.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    setBalanceLocal(balance);
  }, [balance]);

  async function handlePlay() {
    if (rolling) return;
    if (wager > balanceLocal) {
      showToast("Saldo tidak cukup!", "error");
      return;
    }

    setRolling(true);
    setBalanceLocal((b) => b - wager);
    setResult(null);
    setConfetti(false);
    sound.playChip();

    // Fast digital rolling counter
    const rollInterval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 100));
      setDiceRotation({
        x: Math.floor(Math.random() * 360),
        y: Math.floor(Math.random() * 360),
        z: Math.floor(Math.random() * 360),
      });
      sound.playBallBounce();
    }, 60);

    try {
      const r = await rollDice(wager, threshold, side);

      setTimeout(() => {
        clearInterval(rollInterval);
        setDisplayRoll(r.roll);
        setDiceRotation({ x: 0, y: 0, z: 0 });
        setResult(r);
        setBalanceLocal((b) => b + r.payout);

        if (r.result === "win") {
          sound.playWin(r.payout >= wager * 10);
          if (r.payout >= wager * 10) setConfetti(true);
          showToast(`MENANG! +${r.payout.toLocaleString("id-ID")} koin`, "success");
        } else {
          sound.playReelStop(0.8);
        }
        setRolling(false);
      }, 1600);
    } catch (e) {
      clearInterval(rollInterval);
      setRolling(false);
      showToast((e as Error).message, "error");
    }
  }

  const extra = (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-line-2 bg-ink-3 p-1">
        <button
          onClick={() => { sound.playChip(); setSide("over"); }}
          className={`flex-1 py-2.5 rounded font-display text-xs tracking-widest transition ${
            side === "over"
              ? "bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-900/50"
              : "text-white/60 hover:text-gold"
          }`}
        >
          ROLL OVER ({">"} {threshold})
        </button>
        <button
          onClick={() => { sound.playChip(); setSide("under"); }}
          className={`flex-1 py-2.5 rounded font-display text-xs tracking-widest transition ${
            side === "under"
              ? "bg-red-600 font-bold text-white shadow-lg shadow-red-900/50"
              : "text-white/60 hover:text-gold"
          }`}
        >
          ROLL UNDER ({"<"} {threshold})
        </button>
      </div>

      {/* Target Slider with Live Glow */}
      <div className="rounded-xl border border-line-2 bg-black/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[10px] tracking-[0.3em] text-gold-deep">TARGET ANGKA</span>
          <span className="font-display text-2xl font-black tabular-nums text-gold-metal">{threshold}</span>
        </div>
        <input
          type="range"
          min={2}
          max={97}
          value={threshold}
          onChange={(e) => { sound.playChip(); setThreshold(Number(e.target.value)); }}
          className="luxe-slider dice-slider w-full cursor-pointer"
          style={{ ["--val" as string]: `${threshold}%` }}
        />
        <div className="mt-2 flex justify-between text-[10px] font-display text-ivory/40">
          <span>0 (Aman)</span>
          <span>50 (Seimbang)</span>
          <span>99 (Ekstrem)</span>
        </div>
      </div>

      {/* Win Chance & Multiplier Card */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-line-2 bg-ink-3 p-3 text-center">
          <div className="font-display text-[9px] tracking-widest text-ivory/50">PELUANG MENANG</div>
          <div className="mt-1 font-display text-2xl font-black tabular-nums text-emerald-400">{winChance}%</div>
        </div>
        <div className="rounded-lg border border-line-2 bg-ink-3 p-3 text-center">
          <div className="font-display text-[9px] tracking-widest text-ivory/50">MULTIPLIER BAYARAN</div>
          <div className="mt-1 font-display text-2xl font-black tabular-nums text-gold">×{multiplier.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Confetti active={confetti} />

      {/* Header */}
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— CRYPTO DICE —</div>
          <h1 className="font-display text-4xl md:text-5xl">
            <span className="text-gold-metal">CRYPTO</span>
            <span className="font-serif-italic text-ivory/80"> Dice</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-1.5 rounded border border-line-2 bg-ink-3 px-3 py-1.5 text-xs text-gold hover:border-gold"
          >
            <span>{soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}</span>
          </button>
          <span className="hidden font-serif-italic text-xs text-ivory/50 md:inline">0-99 Provably Fair</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        {/* Main 3D Dice Showcase Arena */}
        <div className="card-luxe relative overflow-hidden p-6 md:p-10">
          <div className="relative mx-auto flex max-w-lg flex-col items-center justify-center py-8">
            {/* Interactive Color Spectrum Track */}
            <div className="relative mb-10 h-6 w-full overflow-hidden rounded-full border-2 border-gold-deep/60 bg-zinc-950 shadow-inner">
              {/* Win Zone vs Loss Zone colored spectrum */}
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${threshold}%`,
                  background:
                    side === "under"
                      ? "linear-gradient(90deg, #10b981, #059669)"
                      : "linear-gradient(90deg, #dc2626, #991b1b)",
                }}
              />
              <div
                className="absolute inset-y-0 right-0 transition-all duration-200"
                style={{
                  left: `${threshold}%`,
                  background:
                    side === "over"
                      ? "linear-gradient(90deg, #059669, #10b981)"
                      : "linear-gradient(90deg, #991b1b, #dc2626)",
                }}
              />

              {/* Target Marker Pin */}
              <div
                className="absolute -top-1 z-10 h-8 w-2 -translate-x-1/2 rounded bg-gold shadow-[0_0_12px_#f4d03f]"
                style={{ left: `${threshold}%` }}
              />

              {/* Roll Result Marker */}
              {result && (
                <div
                  className="absolute -top-2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-black font-display text-xs font-black text-white shadow-2xl animate-bounce"
                  style={{ left: `${result.roll}%` }}
                >
                  {result.roll}
                </div>
              )}
            </div>

            {/* Futuristic 3D Floating Holographic Dice Box */}
            <div
              className={`relative flex h-52 w-52 items-center justify-center rounded-3xl border-4 border-gold-bright bg-gradient-to-br from-amber-950 via-zinc-950 to-black p-6 shadow-2xl transition-all duration-300 ${
                rolling ? "scale-105 shadow-gold/50" : "scale-100"
              } ${result?.result === "win" ? "ring-4 ring-emerald-400 shadow-emerald-500/50" : ""}`}
              style={{
                perspective: 1000,
                transform: `rotateX(${diceRotation.x}deg) rotateY(${diceRotation.y}deg)`,
                boxShadow: "inset 0 0 30px rgba(244,208,63,0.3), 0 10px 40px rgba(0,0,0,0.9)",
              }}
            >
              {/* Radial Hologram Aura */}
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(244,208,63,0.2),transparent_70%)]" />

              {/* Number Value */}
              <div className="relative text-center">
                <div className="font-display text-8xl font-black tabular-nums tracking-tight text-gold-bright drop-shadow-[0_4px_16px_rgba(244,208,63,0.8)]">
                  {displayRoll}
                </div>
                <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">
                  {rolling ? "ROLLING..." : result ? (result.result === "win" ? "WINNER!" : "MISSED") : "READY"}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Announcement */}
          <div className="mt-4 text-center">
            {result ? (
              <div
                className={`inline-block rounded-xl border-2 px-8 py-3 shadow-xl ${
                  result.result === "win" ? "border-gold bg-gold/10 animate-in zoom-in-95" : "border-line-2 bg-ink-3"
                }`}
              >
                <div className={`font-display text-xs tracking-widest ${result.result === "win" ? "text-emerald-400 font-bold" : "text-wine-light"}`}>
                  {result.result === "win" ? "🎉 SELAMAT ANDA MENANG!" : "BELUM BERUNTUNG"}
                </div>
                <div className="mt-1 font-display text-3xl font-black text-gold-metal">
                  {result.result === "win" ? `+${result.payout.toLocaleString("id-ID")} KOIN` : `Dadu Keluar: ${result.roll}`}
                </div>
                <div className="mt-1 font-serif-italic text-xs text-ivory/50">
                  Target: {side === "over" ? ">" : "<"} {threshold} (Dadu: {result.roll})
                </div>
              </div>
            ) : (
              <div className="py-2 font-serif-italic text-ivory/40">Tentukan target dan lempar dadu untuk memulai!</div>
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
            onPlay={handlePlay}
            disabled={rolling}
            actionLabel="LEMPAR DADU"
            extra={extra}
          />
          <LastResults gameSlug="dice" />
        </div>
      </div>
    </div>
  );
}
