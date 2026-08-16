import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { SlotsGame } from "./slots-game";

export const dynamic = "force-dynamic";

export default async function SlotsPage() {
  const { user, games } = await getInitialState();
  if (!user) redirect("/login");
  const game = games.find((g: { slug: string }) => g.slug === "slots");
  if (!game) return <div>Game tidak ditemukan</div>;
  const cfg = game.config as {
    reels: string[][];
    payouts: Record<string, number>;
    twoMatchMultiplier: number;
  };
  return (
    <SlotsGame
      initialReels={["7", "BAR", "BELL"]}
      config={cfg}
      balance={user.balance}
      minBet={game.minBet}
      maxBet={game.maxBet}
    />
  );
}
