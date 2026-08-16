import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {}
  if (!user) redirect("/login");

  const referralPercent = await getSetting<number>("referral_bonus_percent", 5).catch(() => 5);
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://goldenarena.local"}/register?ref=${user.referralCode}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-luxe ornament p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— AFFILIATE —</div>
          <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">REFER</span><span className="font-serif-italic text-ivory/80"> & Earn</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Ajak teman bergabung dan dapatkan komisi dari setiap deposit mereka.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-gold-deep/30 bg-gold/5 p-5 text-center">
            <div className="font-display text-[10px] tracking-[0.3em] text-gold">KOMISI</div>
            <div className="mt-1 font-display text-3xl font-black text-gold-metal">{referralPercent}%</div>
            <div className="text-xs text-ivory/50">dari deposit downline</div>
          </div>
          <div className="border border-gold-deep/30 bg-gold/5 p-5 text-center">
            <div className="font-display text-[10px] tracking-[0.3em] text-gold">KODE ANDA</div>
            <div className="mt-1 font-display text-2xl font-black text-gold-metal">{user.referralCode || "-"}</div>
            <div className="text-xs text-ivory/50">unik untuk setiap member</div>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block font-display text-[10px] tracking-[0.3em] text-gold-deep">LINK REFERRAL</label>
          <div className="flex gap-2">
            <input readOnly value={referralLink} className="flex-1 border border-line-2 bg-ink-3 px-4 py-3 font-mono text-xs text-ivory outline-none" />
            <button onClick={() => navigator.clipboard.writeText(referralLink)} className="btn-luxe text-[10px]">Copy</button>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="font-display text-sm tracking-widest text-gold">Cara Kerja</h3>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-ivory/70">
            <li>Bagikan link referral ke teman Anda.</li>
            <li>Teman mendaftar melalui link tersebut.</li>
            <li>Setiap kali teman deposit, Anda otomatis mendapatkan {referralPercent}% komisi.</li>
            <li>Komisi masuk langsung ke saldo akun Anda.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
