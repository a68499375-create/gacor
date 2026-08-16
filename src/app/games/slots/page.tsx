import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { SlotsGame } from "./slots-game";

export const dynamic = "force-dynamic";

export default async function SlotsPage() {
  const { user, games } = await getInitialState();
  if (!user) redirect("/login");
  const game = games.find((g: { slug: string }) => g.slug === "slots");
  const cfg = (game?.config as {
    reels: string[][];
    payouts: Record<string, number>;
    twoMatchMultiplier: number;
  }) || {
    reels: [
      ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
      ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
      ["7", "BAR", "BELL", "CHERRY", "LEMON", "DIAMOND", "STAR"],
    ],
    payouts: { "7": 50, DIAMOND: 25, STAR: 15, BELL: 10, BAR: 6, CHERRY: 4, LEMON: 3 },
    twoMatchMultiplier: 1.5,
  };
  return (
    <SlotsGame
      initialReels={["7", "BAR", "BELL"]}
      config={cfg}
      balance={user.balance}
      minBet={game?.minBet ?? 1}
      maxBet={game?.maxBet ?? 1_000_000_000}
    />
  );
}
