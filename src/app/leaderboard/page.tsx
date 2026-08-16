import { getLeaderboardAction, getActiveTournamentAction, getTournamentLeaderboardAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [leaderboard, tournament, tournamentTop] = await Promise.all([
    getLeaderboardAction(50).catch(() => []),
    getActiveTournamentAction().catch(() => null),
    getTournamentLeaderboardAction("wagered").catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-5">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— RANKINGS —</div>
        <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">LEADER</span><span className="font-serif-italic text-ivory/80">BOARD</span></h1>
      </div>

      {tournament && (
        <div className="card-luxe p-6 md:p-8">
          <div className="mb-4 border-b border-line pb-4">
            <div className="font-display text-[10px] tracking-[0.3em] text-gold">ACTIVE TOURNAMENT</div>
            <h2 className="font-display text-2xl text-gold-metal">{tournament.name}</h2>
            <p className="text-sm text-ivory/60">{tournament.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tournamentTop.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between border border-line-2 bg-ink-3 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center border border-gold bg-gold/10 font-display text-sm text-gold">{i + 1}</span>
                  <span className="font-display text-sm tracking-widest text-ivory">{p.username}</span>
                </div>
                <span className="font-mono text-sm tabular-nums text-gold">{(p.totalWagered ?? p.wins ?? 0).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-luxe overflow-hidden">
        <div className="border-b border-line bg-ink-3 px-6 py-4 font-display text-[10px] tracking-[0.3em] text-gold">TOP 50 PLAYERS</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-2 font-display text-[10px] tracking-[0.25em] text-gold-deep">
              <tr><th className="px-6 py-3 text-left">RANK</th><th className="px-6 py-3 text-left">PLAYER</th><th className="px-6 py-3 text-right">VIP</th><th className="px-6 py-3 text-right">BALANCE</th><th className="px-6 py-3 text-right">WAGERED</th><th className="px-6 py-3 text-right">STREAK</th></tr>
            </thead>
            <tbody className="font-mono text-xs">
              {leaderboard.map((p, i) => (
                <tr key={p.id} className="border-t border-line/50">
                  <td className="px-6 py-3"><span className={`flex h-6 w-6 items-center justify-center border font-display text-xs ${i < 3 ? "border-gold bg-gold/20 text-gold" : "border-line-2 bg-ink-3 text-ivory/50"}`}>{i + 1}</span></td>
                  <td className="px-6 py-3 font-display tracking-widest text-ivory">{p.username}</td>
                  <td className="px-6 py-3 text-right text-gold">{p.vipLevel}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-ivory/80">{p.balance.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-ivory/80">{p.totalWagered.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-gold-bright">{p.longestWinStreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
