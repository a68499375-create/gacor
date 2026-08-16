"use client";
import { useState, useRef, useEffect } from "react";
import { spinRoulette } from "@/app/actions";
import { BetControls } from "../bet-controls";
import { LastResults } from "../last-results";
import { HotColdRoulette } from "../hot-cold";
import { Confetti } from "@/components/confetti";
import { showToast } from "@/components/toast";
import { sound } from "@/lib/sound";
import { CasinoChipSVG } from "@/components/casino-icons";

// Standard European Roulette Wheel Numbers sequence (37 slots)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

type Bet =
  | { kind: "color"; color: "red" | "black" }
  | { kind: "parity"; parity: "even" | "odd" }
  | { kind: "dozen"; dozen: 1 | 2 | 3 }
  | { kind: "number"; number: number };

export function RouletteGame({
  balance,
  minBet,
  maxBet,
  config,
}: {
  balance: number;
  minBet: number;
  maxBet: number;
  config: { redNumbers: number[]; blackNumbers: number[]; payouts: Record<string, number> };
}) {
  const [bet, setBet] = useState<Bet>({ kind: "color", color: "red" });
  const [wager, setWager] = useState(Math.max(minBet, 50));
  const [balanceLocal, setBalanceLocal] = useState(balance);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ number: number; color: string; payout: number; result: string } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Wheel and Ball Physics state
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [ballRadius, setBallRadius] = useState(165); // distance from center
  const [winningSlot, setWinningSlot] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    sound.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    setBalanceLocal(balance);
  }, [balance]);

  async function handlePlay() {
    if (spinning) return;
    if (wager > balanceLocal) {
      showToast("Saldo tidak cukup!", "error");
      return;
    }

    setSpinning(true);
    setBalanceLocal((b) => b - wager);
    setResult(null);
    setConfetti(false);
    setWinningSlot(null);
    sound.playChip();

    try {
      // 1. Trigger server calculation
      const serverResultPromise = spinRoulette(wager, bet);

      // 2. Start high-speed initial spin animation
      const startTime = performance.now();
      const spinDuration = 4800; // 4.8 seconds realistic casino spin
      const initialWheelRot = wheelRotation % 360;
      const initialBallRot = ballRotation % 360;

      // Random 5-8 full rotations for wheel
      const totalWheelRotations = 360 * 5;
      // Ball spins in opposite direction (counter-clockwise) 9-12 full rotations
      const totalBallRotations = -360 * 9;

      const serverResult = await serverResultPromise;

      // Target slot angle on wheel
      const targetIndex = WHEEL_NUMBERS.indexOf(serverResult.number);
      const slotAngle = (targetIndex / 37) * 360;

      // Calculate exact final landing angles
      const finalWheelRotation = initialWheelRot + totalWheelRotations;
      // Ball lands relative to the wheel slot
      const finalBallRotation = initialBallRot + totalBallRotations - (finalWheelRotation % 360) + slotAngle;

      let bounceInterval: NodeJS.Timeout | null = null;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // Smooth cubic-bezier deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3.5);

        const currentWheel = initialWheelRot + totalWheelRotations * easeOut;
        const currentBall = initialBallRot + (finalBallRotation - initialBallRot) * easeOut;

        setWheelRotation(currentWheel);
        setBallRotation(currentBall);

        // Ball track dropping from outer rim (165px) down to inner pockets (118px)
        if (progress < 0.6) {
          setBallRadius(165);
        } else {
          // Ball drops & bounces onto pocket
          const dropProgress = (progress - 0.6) / 0.4;
          const bounce = Math.sin(dropProgress * Math.PI * 4) * (1 - dropProgress) * 8;
          setBallRadius(165 - (165 - 118) * dropProgress + bounce);
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Finished spin
          if (bounceInterval) clearInterval(bounceInterval);
          sound.playBallBounce();
          setWinningSlot(serverResult.number);
          setResult(serverResult);
          setBalanceLocal((b) => b + serverResult.payout);

          if (serverResult.result === "win") {
            sound.playWin(serverResult.payout >= wager * 10);
            if (serverResult.payout >= wager * 10) setConfetti(true);
            showToast(`MENANG! +${serverResult.payout.toLocaleString("id-ID")} koin`, "success");
          }
          setSpinning(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } catch (e) {
      showToast((e as Error).message, "error");
      setSpinning(false);
    }
  }

  return (
    <div className="space-y-6">
      <Confetti active={confetti} />

      {/* Header */}
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— EUROPEAN ROULETTE —</div>
          <h1 className="font-display text-4xl md:text-5xl">
            <span className="text-gold-metal">ROYAL</span>
            <span className="font-serif-italic text-ivory/80"> Roulette</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-1.5 rounded border border-line-2 bg-ink-3 px-3 py-1.5 text-xs text-gold hover:border-gold"
          >
            <span>{soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}</span>
          </button>
          <span className="hidden font-serif-italic text-xs text-ivory/50 md:inline">European Single Zero (0-36)</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        {/* Main Roulette Table & Wheel Showcase */}
        <div className="space-y-6">
          {/* Visual 3D Roulette Wheel */}
          <div className="card-luxe relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,208,63,0.12),transparent_70%)]" />

            <div className="relative mx-auto flex aspect-square max-w-[380px] items-center justify-center">
              {/* Outer Mahogany Wood Bowl */}
              <div
                className="absolute inset-0 rounded-full border-[14px] shadow-2xl shadow-black/90"
                style={{
                  borderColor: "#2c150c",
                  background: "radial-gradient(circle, #3d1c06 0%, #1a0802 80%, #0d0401 100%)",
                  boxShadow: "inset 0 0 25px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.8)",
                }}
              />

              {/* Brass Ball Track Rim */}
              <div
                className="absolute inset-[14px] rounded-full border-[4px]"
                style={{
                  borderColor: "#d4af37",
                  background: "radial-gradient(circle, #2a1b12 0%, #150d09 100%)",
                  boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)",
                }}
              />

              {/* Rotating Inner Wheel with 37 Pockets */}
              <div
                className="absolute inset-[24px] rounded-full shadow-inner transition-transform"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  willChange: "transform",
                }}
              >
                <svg viewBox="-200 -200 400 400" className="h-full w-full">
                  <defs>
                    <radialGradient id="brassHub" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff2a8" />
                      <stop offset="40%" stopColor="#d4af37" />
                      <stop offset="85%" stopColor="#8b6914" />
                      <stop offset="100%" stopColor="#4a3706" />
                    </radialGradient>
                    <radialGradient id="woodCenter" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#4a1a08" />
                      <stop offset="80%" stopColor="#240c03" />
                      <stop offset="100%" stopColor="#120501" />
                    </radialGradient>
                  </defs>

                  {/* 37 Slices */}
                  {WHEEL_NUMBERS.map((num, i) => {
                    const angleDeg = (i / 37) * 360;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const nextAngleRad = (((i + 1) / 37) * 360 * Math.PI) / 180;
                    const isRed = RED_NUMBERS.includes(num);
                    const isGreen = num === 0;
                    const fillColor = isGreen ? "#047857" : isRed ? "#b91c1c" : "#18181b";
                    const isWinner = winningSlot === num;

                    const r1 = 110;
                    const r2 = 168;

                    const x1 = Math.sin(angleRad) * r1;
                    const y1 = -Math.cos(angleRad) * r1;
                    const x2 = Math.sin(nextAngleRad) * r1;
                    const y2 = -Math.cos(nextAngleRad) * r1;
                    const x3 = Math.sin(nextAngleRad) * r2;
                    const y3 = -Math.cos(nextAngleRad) * r2;
                    const x4 = Math.sin(angleRad) * r2;
                    const y4 = -Math.cos(angleRad) * r2;

                    const textAngle = angleDeg + 360 / 37 / 2;
                    const textRad = (textAngle * Math.PI) / 180;
                    const textX = Math.sin(textRad) * 140;
                    const textY = -Math.cos(textRad) * 140;

                    return (
                      <g key={num}>
                        <path
                          d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
                          fill={isWinner ? "#f4d03f" : fillColor}
                          stroke="#d4af37"
                          strokeWidth="0.8"
                          className={isWinner ? "animate-pulse" : ""}
                        />
                        {/* Number text */}
                        <text
                          x={textX}
                          y={textY}
                          fill={isWinner ? "#000" : "#fff"}
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                        >
                          {num}
                        </text>
                      </g>
                    );
                  })}

                  {/* Inner Polished Ring & Hub */}
                  <circle cx="0" cy="0" r="105" fill="url(#woodCenter)" stroke="#d4af37" strokeWidth="3" />
                  <circle cx="0" cy="0" r="65" fill="url(#brassHub)" stroke="#5a4509" strokeWidth="2" />
                  <circle cx="0" cy="0" r="30" fill="#240c03" stroke="#d4af37" strokeWidth="2" />

                  {/* 4-Armed Brass Turret Cross */}
                  <line x1="-50" y1="0" x2="50" y2="0" stroke="#f4d03f" strokeWidth="4" strokeLinecap="round" />
                  <line x1="0" y1="-50" x2="0" y2="50" stroke="#f4d03f" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="12" fill="url(#brassHub)" />
                </svg>
              </div>

              {/* Animated White Ivory Ball */}
              {spinning && (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 z-30"
                  style={{
                    transform: `rotate(${ballRotation}deg) translateY(-${ballRadius}px)`,
                    willChange: "transform",
                  }}
                >
                  <div className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-gradient-to-br from-white via-zinc-200 to-zinc-400 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                </div>
              )}

              {/* Top Win Pointer / Indicator */}
              <div className="absolute -top-1 left-1/2 z-30 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-gold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

              {/* Center Status Display */}
              <div className="relative z-20 flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold bg-gradient-to-br from-ink-3 via-ink-2 to-ink shadow-2xl">
                <div className="text-center">
                  <div className="font-display text-3xl font-black tabular-nums text-gold-metal">
                    {result ? result.number : winningSlot !== null ? winningSlot : "—"}
                  </div>
                  <div className="font-display text-[8px] tracking-[0.3em] text-gold-deep">
                    {spinning ? "SPINNING" : result ? result.color.toUpperCase() : "READY"}
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Announcement Banner */}
            {result && (
              <div className="mt-6 flex items-center justify-center gap-4 animate-in fade-in zoom-in-95">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 font-display text-2xl font-black tabular-nums shadow-xl ${
                    result.color === "red"
                      ? "border-gold bg-wine text-white"
                      : result.color === "black"
                      ? "border-gold bg-zinc-900 text-white"
                      : "border-gold bg-emerald-700 text-white"
                  }`}
                >
                  {result.number}
                </div>
                <div className="text-left">
                  <div className={`font-display text-xs tracking-widest ${result.result === "win" ? "text-emerald-400 font-bold" : "text-wine-light"}`}>
                    {result.result === "win" ? "🎉 WINNER!" : "NO WIN"}
                  </div>
                  <div className="font-display text-2xl font-black text-gold-metal">
                    {result.result === "win" ? `+${result.payout.toLocaleString("id-ID")} KOIN` : "Coba lagi"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Casino Green Felt Table (0-36 Grid) */}
          <div className="card-luxe overflow-hidden p-5">
            <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
              <span className="font-display text-[10px] tracking-[0.3em] text-gold">
                MEJA TARUHAN (KLIK NOMOR ATAU KOTAK TARUHAN):
              </span>
              <span className="text-xs text-gold-deep">
                Pilihan Aktif:{" "}
                <strong className="text-gold uppercase">
                  {bet.kind === "number"
                    ? `Angka ${bet.number} (×36)`
                    : bet.kind === "color"
                    ? `Warna ${bet.color} (×2)`
                    : bet.kind === "parity"
                    ? `Genap/Ganjil ${bet.parity} (×2)`
                    : `Dozen ${bet.dozen} (×3)`}
                </strong>
              </span>
            </div>

            <div className="space-y-2 select-none">
              {/* Single Zero 0 */}
              <button
                onClick={() => { sound.playChip(); setBet({ kind: "number", number: 0 }); }}
                className={`relative w-full rounded border-2 py-2 font-display text-sm font-bold text-white transition ${
                  bet.kind === "number" && bet.number === 0
                    ? "border-gold bg-emerald-600 ring-2 ring-gold"
                    : "border-emerald-700/60 bg-emerald-800/80 hover:bg-emerald-700"
                }`}
              >
                0 (NOL HIJAU · ×36)
                {bet.kind === "number" && bet.number === 0 && <ChipBadge wager={wager} />}
              </button>

              {/* 36 Number Grid (12 columns x 3 rows) */}
              <div className="grid grid-cols-12 gap-1 font-display text-xs">
                {Array.from({ length: 36 }).map((_, i) => {
                  const num = i + 1;
                  const isRed = RED_NUMBERS.includes(num);
                  const isSelected = bet.kind === "number" && bet.number === num;

                  return (
                    <button
                      key={num}
                      onClick={() => { sound.playChip(); setBet({ kind: "number", number: num }); }}
                      className={`relative flex aspect-square items-center justify-center rounded border transition ${
                        isSelected
                          ? "border-gold ring-2 ring-gold font-black z-10 scale-105"
                          : "border-line-2 hover:scale-105 hover:border-gold/60"
                      } ${isRed ? "bg-red-700 text-white" : "bg-zinc-900 text-white"}`}
                    >
                      {num}
                      {isSelected && <ChipBadge wager={wager} />}
                    </button>
                  );
                })}
              </div>

              {/* Dozens (1-12, 13-24, 25-36) */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { d: 1 as const, label: "1st 12 (1-12)" },
                  { d: 2 as const, label: "2nd 12 (13-24)" },
                  { d: 3 as const, label: "3rd 12 (25-36)" },
                ].map(({ d, label }) => {
                  const isSelected = bet.kind === "dozen" && (bet as { dozen?: number }).dozen === d;
                  return (
                    <button
                      key={d}
                      onClick={() => { sound.playChip(); setBet({ kind: "dozen", dozen: d }); }}
                      className={`relative rounded border-2 py-2 font-display text-[11px] font-bold transition ${
                        isSelected
                          ? "border-gold bg-gold/20 text-gold ring-1 ring-gold"
                          : "border-line-2 bg-ink-3 text-ivory/70 hover:border-gold/40"
                      }`}
                    >
                      {label} · ×3
                      {isSelected && <ChipBadge wager={wager} />}
                    </button>
                  );
                })}
              </div>

              {/* Outside Bets (Red, Black, Even, Odd, Low, High) */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => { sound.playChip(); setBet({ kind: "color", color: "red" }); }}
                  className={`relative rounded border-2 py-2.5 font-display text-xs font-bold text-white transition ${
                    bet.kind === "color" && (bet as { color?: string }).color === "red"
                      ? "border-gold bg-red-700 ring-2 ring-gold"
                      : "border-red-900/60 bg-red-800/60 hover:bg-red-700"
                  }`}
                >
                  🔴 MERAH (×2)
                  {bet.kind === "color" && (bet as { color?: string }).color === "red" && <ChipBadge wager={wager} />}
                </button>
                <button
                  onClick={() => { sound.playChip(); setBet({ kind: "color", color: "black" }); }}
                  className={`relative rounded border-2 py-2.5 font-display text-xs font-bold text-white transition ${
                    bet.kind === "color" && (bet as { color?: string }).color === "black"
                      ? "border-gold bg-zinc-900 ring-2 ring-gold"
                      : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                  }`}
                >
                  ⚫ HITAM (×2)
                  {bet.kind === "color" && (bet as { color?: string }).color === "black" && <ChipBadge wager={wager} />}
                </button>
                <button
                  onClick={() => { sound.playChip(); setBet({ kind: "parity", parity: "even" }); }}
                  className={`relative rounded border-2 py-2.5 font-display text-xs font-bold transition ${
                    bet.kind === "parity" && (bet as { parity?: string }).parity === "even"
                      ? "border-gold bg-gold/20 text-gold ring-1 ring-gold"
                      : "border-line-2 bg-ink-3 text-ivory/80 hover:border-gold/40"
                  }`}
                >
                  GENAP (×2)
                  {bet.kind === "parity" && (bet as { parity?: string }).parity === "even" && <ChipBadge wager={wager} />}
                </button>
                <button
                  onClick={() => { sound.playChip(); setBet({ kind: "parity", parity: "odd" }); }}
                  className={`relative rounded border-2 py-2.5 font-display text-xs font-bold transition ${
                    bet.kind === "parity" && (bet as { parity?: string }).parity === "odd"
                      ? "border-gold bg-gold/20 text-gold ring-1 ring-gold"
                      : "border-line-2 bg-ink-3 text-ivory/80 hover:border-gold/40"
                  }`}
                >
                  GANJIL (×2)
                  {bet.kind === "parity" && (bet as { parity?: string }).parity === "odd" && <ChipBadge wager={wager} />}
                </button>
              </div>
            </div>
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
            disabled={spinning}
            actionLabel="PUTAR RODA ROULETTE"
          />
          <HotColdRoulette />
          <LastResults gameSlug="roulette" />
        </div>
      </div>
    </div>
  );
}

function ChipBadge({ wager }: { wager: number }) {
  return (
    <div className="absolute -top-2.5 -right-2.5 z-20 animate-bounce drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
      <CasinoChipSVG value="" color="gold" className="w-6 h-6" />
    </div>
  );
}
