import { redirect } from "next/navigation";
import { getInitialState } from "@/app/actions";
import { DiceGame } from "./dice-game";

export const dynamic = "force-dynamic";

export default async function DicePage() {
  const { user, games } = await getInitialState();
  if (!user) {
    return (
      <div className="mx-auto max-w-md card-luxe p-10 text-center space-y-4 my-12">
        <div className="font-display text-2xl text-gold-metal">AKSES MEMBER DIPERLUKAN</div>
        <p className="text-sm text-ivory/60">Silakan masuk ke akun Anda untuk membuka meja permainan Crypto Dice.</p>
        <div className="pt-2">
          <a href="/login" className="btn-luxe inline-block w-full">Masuk Sekarang</a>
        </div>
      </div>
    );
  }
  const game = games.find((g: { slug: string }) => g.slug === "dice");
  return <DiceGame balance={user.balance} minBet={Number(game?.minBet) || 1} maxBet={Number(game?.maxBet) || 1_000_000_000} />;
}
