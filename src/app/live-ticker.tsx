"use client";

const TICKER_ITEMS = [
  { user: "R***r", game: "Lucky Reels", amount: 124800, mult: "50x" },
  { user: "K****a", game: "Royal Roulette", amount: 48200, mult: "36x" },
  { user: "B**o", game: "Crypto Dice", amount: 8900, mult: "4.2x" },
  { user: "M***i", game: "Coin Flip", amount: 15000, mult: "1.95x" },
  { user: "D***a", game: "Lucky Reels", amount: 250000, mult: "50x JACKPOT" },
  { user: "S***a", game: "Royal Roulette", amount: 22100, mult: "36x" },
  { user: "A***o", game: "Crypto Dice", amount: 6750, mult: "2.1x" },
  { user: "N***n", game: "Lucky Reels", amount: 75000, mult: "25x" },
  { user: "T***i", game: "Coin Flip", amount: 9800, mult: "1.95x" },
  { user: "P***a", game: "Royal Roulette", amount: 18400, mult: "3x" },
];

export function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-t border-line bg-ink-2 py-2">
      <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-ink-2 to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-ink-2 to-transparent" />
      <div className="marquee-track flex gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="live-dot" />
            <span className="font-display tracking-wider text-ivory/50">{t.user}</span>
            <span className="text-ivory/30">menang</span>
            <span className="font-bold text-gold tabular-nums">+{t.amount.toLocaleString("id-ID")}</span>
            <span className="text-ivory/30">di</span>
            <span className="text-ivory/70">{t.game}</span>
            <span className="rounded-sm border border-gold-deep/50 bg-gold/5 px-1.5 py-0.5 font-display text-[10px] tracking-wider text-gold-bright">{t.mult}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
