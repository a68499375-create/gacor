"use client";

import { useState, useEffect } from "react";
import { claimDailyBonusAction, canClaimDailyAction } from "@/app/actions";
import { showToast } from "@/components/toast";

export default function DailyBonusPage() {
  const [status, setStatus] = useState<{ canClaim: boolean; hoursLeft: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const s = await canClaimDailyAction();
    setStatus(s);
  }

  async function claim() {
    setBusy(true);
    try {
      const amount = await claimDailyBonusAction();
      setClaimed(true);
      showToast(`Berhasil klaim ${amount.toLocaleString("id-ID")} koin!`, "success");
      await refresh();
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card-luxe ornament p-10 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-2xl shadow-gold/30 animate-float">
          <span className="font-display text-4xl text-wine-deep">G</span>
        </div>
        <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— DAILY REWARD —</div>
        <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">BONUS</span><span className="font-serif-italic text-ivory/80"> Harian</span></h1>
        <p className="mt-3 text-sm text-ivory/60">Klaim bonus gratis setiap 24 jam. Semakin rutin, semakin besar kesempatanmu.</p>

        <div className="mt-8 border border-gold-deep/30 bg-gold/5 p-6">
          <div className="font-display text-[10px] tracking-[0.3em] text-gold">HADIAH HARI INI</div>
          <div className="mt-2 font-display text-5xl font-black tabular-nums text-gold-metal">1,000</div>
          <div className="text-xs text-ivory/50">KOIN GRATIS</div>
        </div>

        {status && (
          <div className="mt-6">
            {status.canClaim ? (
              <button onClick={claim} disabled={busy || claimed} className="btn-luxe w-full">{busy ? "Memproses..." : claimed ? "Sudah Diklaim" : "Klaim Sekarang"}</button>
            ) : (
              <div className="border border-wine-deep bg-wine-deep/10 p-4">
                <div className="font-display text-[10px] tracking-[0.3em] text-wine-light">BONUS SUDAH DIKLAIM</div>
                <div className="mt-1 text-sm text-ivory/70">Kembali dalam {Math.ceil(status.hoursLeft)} jam lagi</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
