"use client";
import type { bets } from "@/db/schema";
type Bet = typeof bets.$inferSelect;

export function RecentWins({ history }: { history: Bet[] }) {
  if (history.length === 0) {
    return (
      <div className="card-luxe p-12 text-center">
        <div className="mx-auto mb-3 font-serif-italic text-3xl text-gold-deep">—</div>
        <div className="font-display text-sm tracking-widest text-ivory/40">BELUM ADA CATATAN</div>
        <div className="mt-1 text-xs text-ivory/30">Jadilah yang pertama membuka meja</div>
      </div>
    );
  }
  return (
    <div className="card-luxe overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-ink-3 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-display text-xs tracking-[0.25em] text-gold">LIVE LEDGER</span>
        </div>
        <span className="font-mono text-[10px] text-ivory/40">{history.length} records</span>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ink-2 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
            <tr>
              <th className="px-5 py-3 text-left font-display">Game</th>
              <th className="px-5 py-3 text-left font-display">Waktu</th>
              <th className="px-5 py-3 text-right font-display">Wager</th>
              <th className="px-5 py-3 text-right font-display">Payout</th>
              <th className="px-5 py-3 text-right font-display">Profit</th>
              <th className="px-5 py-3 text-center font-display">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {history.map((b, i) => (
              <tr
                key={b.id}
                className={`border-t border-line/50 transition hover:bg-gold/[0.03] ${i === 0 ? "bg-gold/[0.02]" : ""}`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${b.result === "win" ? "bg-emerald-500" : "bg-wine-light"}`} />
                    <span className="font-display text-xs tracking-widest text-ivory capitalize">{b.gameSlug}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-ivory/40">
                  {new Date(b.createdAt).toLocaleTimeString("id-ID")}
                </td>
                <td className="px-5 py-3 text-right text-ivory/80 tabular-nums">
                  {b.wager.toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3 text-right text-ivory/80 tabular-nums">
                  {b.payout.toLocaleString("id-ID")}
                </td>
                <td
                  className={`px-5 py-3 text-right font-bold tabular-nums ${
                    b.profit > 0 ? "text-gold-bright" : b.profit < 0 ? "text-wine-light" : "text-ivory/40"
                  }`}
                >
                  {b.profit > 0 ? "+" : ""}
                  {b.profit.toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-block border px-2 py-0.5 font-display text-[9px] tracking-[0.2em] ${
                      b.result === "win"
                        ? "border-gold-deep bg-gold/5 text-gold"
                        : "border-wine-deep bg-wine-deep/10 text-wine-light"
                    }`}
                  >
                    {b.result === "win" ? "WIN" : "LOSS"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
