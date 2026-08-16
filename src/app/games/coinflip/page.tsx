import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { CoinflipGame } from "./coinflip-game";

export const dynamic = "force-dynamic";

export default async function CoinflipPage() {
  const { user, games } = await getInitialState();
  if (!user) redirect("/login");
  const game = games.find((g: { slug: string }) => g.slug === "coinflip");
  return <CoinflipGame balance={user.balance} minBet={game?.minBet ?? 1} maxBet={game?.maxBet ?? 1_000_000_000} />;
}
