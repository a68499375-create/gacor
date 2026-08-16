import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { DiceGame } from "./dice-game";

export const dynamic = "force-dynamic";

export default async function DicePage() {
  const { user, games } = await getInitialState();
  if (!user) redirect("/login");
  const game = games.find((g: { slug: string }) => g.slug === "dice")!;
  return <DiceGame balance={user.balance} minBet={game.minBet} maxBet={game.maxBet} />;
}
