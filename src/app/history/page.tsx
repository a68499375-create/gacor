import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHistory } from "@/lib/games";
import { RecentWins } from "../recent-wins";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const history = await getHistory(user.id, 200);
  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-5">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— LEDGER —</div>
        <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">HISTORY</span><span className="font-serif-italic text-ivory/80"> of Plays</span></h1>
        <p className="mt-2 text-sm text-ivory/50">Setiap taruhan yang pernah kamu pasang, tercatat permanen.</p>
      </div>
      <RecentWins history={history} />
    </div>
  );
}
