"use client";
import { useState, useEffect } from "react";
import { flipCoin } from "@/app/actions";
import { BetControls } from "../bet-controls";
import { LastResults } from "../last-results";
import { Confetti } from "@/components/confetti";
import { showToast } from "@/components/toast";
import { sound } from "@/lib/sound";
import { CrownHeadIcon, ArenaTailsIcon } from "@/components/casino-icons";

export function CoinflipGame({ balance, minBet, maxBet }: { balance: number; minBet: number; maxBet: number }) {
  const [wager, setWager] = useState(Math.max(minBet, 100));
  const [balanceLocal, setBalanceLocal] = useState(balance);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ result_side: string; payout: number; result: string } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // 3D Coin Flip Transform
  const [coinRotX, setCoinRotX] = useState(0);
  const [coinElev, setCoinElev] = useState(0);

  useEffect(() => {
    sound.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    setBalanceLocal(balance);
  }, [balance]);

  async function handlePlay() {
    if (flipping) return;
    if (wager > balanceLocal) {
      showToast("Saldo tidak cukup!", "error");
      return;
    }

    setFlipping(true);
    setBalanceLocal((b) => b - wager);
    setResult(null);
    setConfetti(false);
    sound.playCoinSpin();

    try {
      const r = await flipCoin(wager, choice);

      // Multi-rotation flip physics
      const isHeads = r.result_side === "heads";
      const totalTurns = 8;
      const targetDeg = totalTurns * 360 + (isHeads ? 0 : 180);

      // Launch upwards in air
      setCoinElev(-140);
      setCoinRotX((prev) => prev + targetDeg);

      setTimeout(() => {
        // Drop down onto table
        setCoinElev(0);
        sound.playBallBounce();
      }, 1500);

      setTimeout(() => {
        setResult(r);
        setBalanceLocal((b) => b + r.payout);

        if (r.result === "win") {
          sound.playWin(r.payout >= wager * 10);
          if (r.payout >= wager * 10) setConfetti(true);
          showToast(`MENANG! +${r.payout.toLocaleString("id-ID")} koin`, "success");
        }
        setFlipping(false);
      }, 1900);
    } catch (e) {
      setFlipping(false);
      setCoinElev(0);
      showToast((e as Error).message, "error");
    }
  }

  const extra = (
    <div className="space-y-4">
      <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">PILIH SISI KOIN</div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { sound.playChip(); setChoice("heads"); }}
          className={`relative overflow-hidden rounded-xl border-2 p-4 text-center transition ${
            choice === "heads"
              ? "border-gold bg-gradient-to-b from-amber-600/40 via-yellow-600/20 to-amber-900/40 shadow-lg shadow-gold/30 ring-2 ring-gold"
              : "border-line-2 bg-ink-3 hover:border-gold/50"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-bright bg-gradient-to-br from-zinc-950 to-amber-950 p-2 shadow-md">
            <CrownHeadIcon className="w-12 h-12" />
          </div>
          <div className="mt-2 font-display text-sm font-black tracking-widest text-gold-bright">HEADS (KEPALA)</div>
          <div className="text-[10px] text-ivory/60">Mahkota Emas · 1.95×</div>
        </button>

        <button
          onClick={() => { sound.playChip(); setChoice("tails"); }}
          className={`relative overflow-hidden rounded-xl border-2 p-4 text-center transition ${
            choice === "tails"
              ? "border-gold bg-gradient-to-b from-amber-600/40 via-yellow-600/20 to-amber-900/40 shadow-lg shadow-gold/30 ring-2 ring-gold"
              : "border-line-2 bg-ink-3 hover:border-gold/50"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-bright bg-gradient-to-br from-zinc-950 to-amber-950 p-2 shadow-md">
            <ArenaTailsIcon className="w-12 h-12" />
          </div>
          <div className="mt-2 font-display text-sm font-black tracking-widest text-gold-bright">TAILS (EKOR)</div>
          <div className="text-[10px] text-ivory/60">Bintang Arena · 1.95×</div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Confetti active={confetti} />

      {/* Header */}
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— 3D COIN FLIP —</div>
          <h1 className="font-display text-4xl md:text-5xl">
            <span className="text-gold-metal">DOUBLE</span>
            <span className="font-serif-italic text-ivory/80"> or Nothing</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-1.5 rounded border border-line-2 bg-ink-3 px-3 py-1.5 text-xs text-gold hover:border-gold"
          >
            <span>{soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}</span>
          </button>
          <span className="hidden font-serif-italic text-xs text-ivory/50 md:inline">1.95× Payout</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        {/* 3D Coin Arena */}
        <div className="card-luxe relative overflow-hidden p-6 md:p-10">
          <div className="relative mx-auto flex h-80 max-w-sm flex-col items-center justify-center" style={{ perspective: 1200 }}>
            {/* Spotlight Lighting Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,208,63,0.2),transparent_65%)]" />

            {/* Dynamic Ground Shadow */}
            <div
              className="absolute bottom-6 h-8 rounded-full bg-black/80 blur-md transition-all duration-300"
              style={{
                width: flipping ? "80px" : "180px",
                opacity: flipping ? 0.3 : 0.9,
              }}
            />

            {/* 3D Rotating Minted Gold Coin with SVG Vector Relief Artwork */}
            <div
              className="relative h-48 w-48 transition-all"
              style={{
                transformStyle: "preserve-3d",
                transform: `translateY(${coinElev}px) rotateX(${coinRotX}deg)`,
                transition: flipping
                  ? "transform 1.9s cubic-bezier(0.25, 1, 0.5, 1), translateY 0.95s cubic-bezier(0.33, 1, 0.68, 1)"
                  : "transform 0.5s ease-out",
                willChange: "transform",
              }}
            >
              {/* Front Face: HEADS (Mahkota Raja Emas) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-[6px] border-amber-300 shadow-2xl p-4"
                style={{
                  backfaceVisibility: "hidden",
                  background: "radial-gradient(circle at 35% 30%, #fff6c2 0%, #f4d03f 40%, #c89611 75%, #634704 100%)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.6), 0 15px 35px rgba(0,0,0,0.8)",
                }}
              >
                <div className="absolute inset-2.5 rounded-full border border-dashed border-amber-900/60" />
                <CrownHeadIcon className="w-24 h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
                <span className="font-display text-[11px] font-black tracking-[0.25em] text-amber-950">
                  HEADS
                </span>
              </div>

              {/* Back Face: TAILS (Bintang Arena) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-[6px] border-amber-300 shadow-2xl p-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  background: "radial-gradient(circle at 35% 30%, #fff6c2 0%, #f4d03f 40%, #c89611 75%, #634704 100%)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.6), 0 15px 35px rgba(0,0,0,0.8)",
                }}
              >
                <div className="absolute inset-2.5 rounded-full border border-dashed border-amber-900/60" />
                <ArenaTailsIcon className="w-24 h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
                <span className="font-display text-[11px] font-black tracking-[0.25em] text-amber-950">
                  TAILS
                </span>
              </div>
            </div>
          </div>

          {/* Result Announcement */}
          <div className="mt-2 text-center">
            {result ? (
              <div
                className={`inline-block rounded-xl border-2 px-8 py-3.5 shadow-2xl ${
                  result.result === "win" ? "border-gold bg-gold/15 animate-in zoom-in-95" : "border-line-2 bg-ink-3"
                }`}
              >
                <div className={`font-display text-xs tracking-widest ${result.result === "win" ? "text-emerald-400 font-bold" : "text-wine-light"}`}>
                  {result.result === "win" ? "🎉 TEBAKAN TEPAT! MENANG!" : "TEBAKAN SALAH"}
                </div>
                <div className="mt-1 font-display text-3xl font-black text-gold-metal">
                  {result.result === "win"
                    ? `+${result.payout.toLocaleString("id-ID")} KOIN`
                    : `Sisi Keluar: ${result.result_side.toUpperCase()}`}
                </div>
                <div className="mt-1 font-serif-italic text-xs text-ivory/50">
                  Pilihanmu: <strong className="text-gold uppercase">{choice}</strong>
                </div>
              </div>
            ) : (
              <div className="py-2 font-serif-italic text-ivory/40">Pilih Kepala atau Ekor, lalu lempar koin!</div>
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
            disabled={flipping}
            actionLabel="LEMPAR KOIN"
            extra={extra}
          />
          <LastResults gameSlug="coinflip" />
        </div>
      </div>
    </div>
  );
}
