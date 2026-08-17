import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { RouletteGame } from "./roulette-game";

export const dynamic = "force-dynamic";

export default async function RoulettePage() {
  const { user, games } = await getInitialState();
  if (!user) {
    return (
      <div className="mx-auto max-w-md card-luxe p-10 text-center space-y-4 my-12">
        <div className="font-display text-2xl text-gold-metal">AKSES MEMBER DIPERLUKAN</div>
        <p className="text-sm text-ivory/60">Silakan masuk ke akun Anda untuk membuka meja permainan Royal Roulette.</p>
        <div className="pt-2">
          <a href="/login" className="btn-luxe inline-block w-full">Masuk Sekarang</a>
        </div>
      </div>
    );
  }
  const game = games.find((g: { slug: string }) => g.slug === "roulette");
  const cfg = (game?.config as { redNumbers: number[]; blackNumbers: number[]; payouts: Record<string, number> }) || {
    redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    payouts: { straight: 36, red_black: 2, even_odd: 2, low_high: 2, dozen: 3, column: 3 },
  };
  return (
    <RouletteGame
      balance={user.balance}
      minBet={game?.minBet ?? 1}
      maxBet={game?.maxBet ?? 1_000_000_000}
      config={cfg}
    />
  );
}
