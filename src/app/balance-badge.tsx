import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function BalanceBadge() {
  let balance = 0;
  try {
    const user = await getCurrentUser();
    balance = user?.balance ?? 0;
  } catch {}
  return (
    <div className="flex items-center gap-2.5 rounded-sm border border-gold-deep/60 bg-ink-3 px-3 py-1.5 shadow-inner shadow-black/50">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-inner">
          <div className="absolute inset-1 rounded-full border border-gold-deep/60 bg-gradient-to-br from-gold to-gold-deep" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center font-display text-[10px] font-black text-wine-deep">K</div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-display text-[9px] tracking-[0.25em] text-gold-deep">SALDO</span>
        <span className="font-display text-sm font-black tabular-nums text-gold-metal">{balance.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
