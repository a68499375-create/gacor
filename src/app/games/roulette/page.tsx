import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { RouletteGame } from "./roulette-game";

export const dynamic = "force-dynamic";

export default async function RoulettePage() {
  const { user, games } = await getInitialState();
  if (!user) redirect("/login");
  const game = games.find((g: { slug: string }) => g.slug === "roulette");
  if (!game) return <div>Game tidak ditemukan</div>;
  return (
    <RouletteGame
      balance={user.balance}
      minBet={game.minBet}
      maxBet={game.maxBet}
      config={game.config as { redNumbers: number[]; blackNumbers: number[]; payouts: Record<string, number> }}
    />
  );
}
