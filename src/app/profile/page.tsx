import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { userGetProfile, getMyTopUpsAction, getMyWithdrawalsAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await userGetProfile();
  const [topups, withdrawals] = await Promise.all([getMyTopUpsAction(), getMyWithdrawalsAction()]);

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-5">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— MEMBER PROFILE —</div>
        <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">PROFIL</span><span className="font-serif-italic text-ivory/80"> Saya</span></h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card-luxe p-6">
          <div className="mb-4 border-b border-line pb-3 font-display text-[10px] tracking-[0.3em] text-gold">DATA AKUN</div>
          <ProfileRow label="Username" value={profile.username} />
          <ProfileRow label="Email" value={profile.email} />
          <ProfileRow label="Telepon" value={profile.phone} />
          <ProfileRow label="Saldo" value={`${profile.balance.toLocaleString("id-ID")} KOIN`} gold />
          <ProfileRow label="Withdrawable" value={`${profile.withdrawableBalance.toLocaleString("id-ID")} KOIN`} />
          <ProfileRow label="Kode Referral" value={profile.referralCode || "-"} />
        </div>
        <div className="card-luxe p-6">
          <div className="mb-4 border-b border-line pb-3 font-display text-[10px] tracking-[0.3em] text-gold">DATA PRIBADI</div>
          <ProfileRow label="Nama Lengkap" value={profile.fullName} />
          <ProfileRow label="Tanggal Lahir" value={new Date(profile.birthDate).toLocaleDateString("id-ID")} />
          <ProfileRow label="NIK" value={profile.nik} />
          <ProfileRow label="Status" value={profile.isBanned ? "Diblokir" : profile.isActive ? "Aktif" : "Nonaktif"} />
          <ProfileRow label="VIP Level" value={`${profile.vipLevel}`} gold />
          <ProfileRow label="Total Wagered" value={`${profile.totalWagered.toLocaleString("id-ID")}`} />
        </div>
        <div className="card-luxe p-6 md:col-span-2">
          <div className="mb-4 border-b border-line pb-3 font-display text-[10px] tracking-[0.3em] text-gold">ALAMAT</div>
          <p className="text-sm leading-relaxed text-ivory/80">{profile.address}</p>
          <p className="mt-2 text-sm text-ivory/60">{profile.city}, {profile.province} — {profile.postalCode}</p>
        </div>
      </div>

      <TxHistory title="RIWAYAT DEPOSIT / TOP-UP" rows={topups} type="topup" />
      <TxHistory title="RIWAYAT WITHDRAWAL" rows={withdrawals} type="withdrawal" />
    </div>
  );
}

function ProfileRow({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line/40 py-3 last:border-b-0">
      <span className="font-display text-[10px] tracking-[0.25em] text-ivory/50">{label.toUpperCase()}</span>
      <span className={`text-sm font-medium ${gold ? "font-display text-gold" : "text-ivory"}`}>{value}</span>
    </div>
  );
}

function TxHistory({ title, rows, type }: { title: string; rows: any[]; type: "topup" | "withdrawal" }) {
  return (
    <div className="card-luxe overflow-hidden">
      <div className="border-b border-line bg-ink-3 px-5 py-3 font-display text-[10px] tracking-[0.3em] text-gold">{title}</div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-2 font-display text-[10px] tracking-[0.25em] text-gold-deep"><tr><th className="px-5 py-3 text-left">TANGGAL</th><th className="px-5 py-3 text-right">JUMLAH</th><th className="px-5 py-3 text-left">METODE</th><th className="px-5 py-3 text-center">STATUS</th></tr></thead>
          <tbody className="font-mono text-xs">
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-line/50">
                <td className="px-5 py-3 text-ivory/60">{new Date(t.createdAt).toLocaleString("id-ID")}</td>
                <td className="px-5 py-3 text-right font-bold tabular-nums text-gold">{t.amount.toLocaleString("id-ID")}</td>
                <td className="px-5 py-3 uppercase text-ivory/60">{t.method}</td>
                <td className="px-5 py-3 text-center"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center font-serif-italic text-ivory/40">Belum ada riwayat</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "border-gold bg-gold/5 text-gold", approved: "border-felt bg-felt/10 text-felt", rejected: "border-wine bg-wine-deep/20 text-wine-light" };
  return <span className={`border px-2 py-0.5 font-display text-[9px] tracking-widest ${map[status] || map.pending}`}>{status.toUpperCase()}</span>;
}
