"use client";
import { useState, useEffect } from "react";
import {
  getAdminData,
  loginAdminAction,
  adminUpdateGame,
  adminUpdateSetting,
  adminSetBalance,
  adminAddBalance,
  adminSetUserLuck,
  adminSetUserRole,
  adminToggleUserBan,
  adminToggleUserActive,
  adminReviewTopUp,
  adminReviewWithdrawal,
  adminCreateBankAccount,
  adminToggleBankAccount,
  adminCreateAnnouncement,
  adminToggleAnnouncement,
  adminChangePassword,
  logoutAdminAction,
} from "@/app/actions";

type GameRow = { slug: string; name: string; description: string; rtp: number; minBet: number; maxBet: number; enabled: number };
type UserRow = {
  id: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  nik?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  balance: number;
  withdrawableBalance?: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  totalWagered?: number;
  vipLevel: number;
  currentWinStreak?: number;
  longestWinStreak?: number;
  referralCode?: string | null;
  isActive: boolean;
  isBanned: boolean;
  role: string;
  luckMode?: string;
  customWinRate?: number;
  luckMultiplier?: number;
  createdAt: Date;
};
type TxRow = { id: number; userId: number; amount: number; method: string; accountName: string; reference?: string; accountNumber?: string; bankName?: string | null; status: string; createdAt: Date };
type BankRow = { id: number; method: string; name: string; number: string; holder: string; active: boolean };
type AnnouncementRow = { id: number; title: string; content: string; type: string; active: boolean; dismissible: boolean; showOnce: boolean; createdAt: Date };
type AuditRow = { id: number; actorType: string; actorId: number; action: string; targetType: string | null; targetId: number | null; details: Record<string, unknown>; ip: string | null; createdAt: Date };
type Stats = { totalBets: number; totalWagered: number; totalWins: number; playerProfit: number; byGame: { game: string; count: number; wagered: number; paid: number }[] };

export function AdminPanel() {
  const [adminUsername, setAdminUsername] = useState("boss");
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [games, setGames] = useState<GameRow[]>([]);
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [pendingTopUps, setPendingTopUps] = useState<TxRow[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<TxRow[]>([]);
  const [allBankAccounts, setAllBankAccounts] = useState<BankRow[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"games" | "users" | "finance" | "announcements" | "security">("games");
  
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState(10000000);
  const [bonus, setBonus] = useState(1000000);
  const [userLuckMode, setUserLuckMode] = useState("normal");
  const [userWinRate, setUserWinRate] = useState(50);
  const [userLuckMult, setUserLuckMult] = useState(1.0);
  const [userRole, setUserRole] = useState("player");
  
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.nik && u.nik.includes(q))
    );
  });

  // Check if already authenticated on load
  useEffect(() => {
    getAdminData()
      .then((data) => {
        setGames((data.games as GameRow[]).map((g: GameRow) => ({ slug: g.slug, name: g.name, description: g.description, rtp: g.rtp, minBet: g.minBet, maxBet: g.maxBet, enabled: g.enabled })));
        setUsersList(data.users as UserRow[]);
        setPendingTopUps(data.pendingTopUps as TxRow[]);
        setPendingWithdrawals(data.pendingWithdrawals as TxRow[]);
        setAllBankAccounts(data.allBankAccounts as BankRow[]);
        setAllAnnouncements(data.allAnnouncements as AnnouncementRow[]);
        setAuditLog(data.auditLog as AuditRow[]);
        setStats(data.stats as Stats);
        setAuthed(true);
      })
      .catch(() => {
        // Not authenticated yet
      });
  }, []);

  async function loginWithCredentials(userToLogin = adminUsername, passToLogin = pw) {
    setError("");
    setBusy(true);
    try {
      await loginAdminAction(userToLogin, passToLogin);
      const data = await getAdminData();
      setGames((data.games as GameRow[]).map((g: GameRow) => ({ slug: g.slug, name: g.name, description: g.description, rtp: g.rtp, minBet: g.minBet, maxBet: g.maxBet, enabled: g.enabled })));
      setUsersList(data.users as UserRow[]);
      setPendingTopUps(data.pendingTopUps as TxRow[]);
      setPendingWithdrawals(data.pendingWithdrawals as TxRow[]);
      setAllBankAccounts(data.allBankAccounts as BankRow[]);
      setAllAnnouncements(data.allAnnouncements as AnnouncementRow[]);
      setAuditLog(data.auditLog as AuditRow[]);
      setStats(data.stats as Stats);
      setAuthed(true);
    } catch (e) {
      setError((e as Error).message || "Login gagal");
    } finally {
      setBusy(false);
    }
  }

  function handleSelectUser(u: UserRow) {
    setSelectedUserId(u.id);
    setNewBalance(u.balance);
    setUserLuckMode(u.luckMode || "normal");
    setUserWinRate(u.customWinRate ?? 50);
    setUserLuckMult(u.luckMultiplier ?? 1.0);
    setUserRole(u.role || "player");
  }

  async function saveGame(slug: string, patch: Partial<GameRow>) {
    setBusy(true);
    try { await adminUpdateGame(slug, patch); setGames((gs) => gs.map((g) => (g.slug === slug ? { ...g, ...patch } : g))); }
    finally { setBusy(false); }
  }

  async function saveSetting(key: string, value: unknown) {
    setBusy(true);
    try { await adminUpdateSetting(key, value); }
    finally { setBusy(false); }
  }

  async function applyBalance() {
    if (!selectedUserId) return alert("Pilih user");
    setBusy(true);
    try {
      await adminSetBalance(selectedUserId, newBalance);
      alert("Saldo diperbarui");
      await refresh();
    } finally { setBusy(false); }
  }

  async function applyBonus() {
    if (!selectedUserId) return alert("Pilih user");
    setBusy(true);
    try {
      await adminAddBalance(selectedUserId, bonus);
      alert(`Bonus +${bonus.toLocaleString("id-ID")} diterapkan`);
      await refresh();
    } finally { setBusy(false); }
  }

  async function applyLuck(mode: string, rate: number, mult: number) {
    if (!selectedUserId) return alert("Pilih user");
    setBusy(true);
    try {
      await adminSetUserLuck(selectedUserId, mode, rate, mult);
      setUserLuckMode(mode);
      setUserWinRate(rate);
      setUserLuckMult(mult);
      alert(`Kehokian user diperbarui: ${mode.toUpperCase()} (${rate}%)`);
      await refresh();
    } finally { setBusy(false); }
  }

  async function applyRole(role: string) {
    if (!selectedUserId) return alert("Pilih user");
    setBusy(true);
    try {
      await adminSetUserRole(selectedUserId, role);
      setUserRole(role);
      alert(`Role user diubah menjadi: ${role.toUpperCase()}`);
      await refresh();
    } finally { setBusy(false); }
  }

  async function doChangePassword() {
    setBusy(true);
    try {
      await adminChangePassword(oldPw, newPw);
      alert("Password diganti");
      setOldPw("");
      setNewPw("");
    } catch (e) {
      alert((e as Error).message);
    } finally { setBusy(false); }
  }

  async function toggleBan(id: number, banned: boolean) {
    setBusy(true);
    try {
      await adminToggleUserBan(id, banned);
      setUsersList((us) => us.map((u) => (u.id === id ? { ...u, isBanned: banned } : u)));
    } finally { setBusy(false); }
  }

  async function toggleActive(id: number, active: boolean) {
    setBusy(true);
    try {
      await adminToggleUserActive(id, active);
      setUsersList((us) => us.map((u) => (u.id === id ? { ...u, isActive: active } : u)));
    } finally { setBusy(false); }
  }

  async function reviewTopUp(id: number, status: "approved" | "rejected") {
    setBusy(true);
    try {
      await adminReviewTopUp(id, status, "");
      setPendingTopUps((ts) => ts.filter((t) => t.id !== id));
    } finally { setBusy(false); }
  }

  async function reviewWithdrawal(id: number, status: "approved" | "rejected") {
    setBusy(true);
    try {
      await adminReviewWithdrawal(id, status, "");
      setPendingWithdrawals((ts) => ts.filter((t) => t.id !== id));
    } finally { setBusy(false); }
  }

  async function addBank(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await adminCreateBankAccount({
        method: fd.get("method") as string,
        name: fd.get("name") as string,
        number: fd.get("number") as string,
        holder: fd.get("holder") as string,
      });
      e.currentTarget.reset();
      await refresh();
    } finally { setBusy(false); }
  }

  async function addAnnouncement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await adminCreateAnnouncement({
        title: fd.get("title") as string,
        content: fd.get("content") as string,
        type: fd.get("type") as any,
      });
      e.currentTarget.reset();
      await refresh();
    } finally { setBusy(false); }
  }

  async function refresh() {
    setBusy(true);
    try {
      const data = await getAdminData();
      setGames((data.games as GameRow[]).map((g: GameRow) => ({ slug: g.slug, name: g.name, description: g.description, rtp: g.rtp, minBet: g.minBet, maxBet: g.maxBet, enabled: g.enabled })));
      setUsersList(data.users as UserRow[]);
      setPendingTopUps(data.pendingTopUps as TxRow[]);
      setPendingWithdrawals(data.pendingWithdrawals as TxRow[]);
      setAllBankAccounts(data.allBankAccounts as BankRow[]);
      setAllAnnouncements(data.allAnnouncements as AnnouncementRow[]);
      setAuditLog(data.auditLog as AuditRow[]);
      setStats(data.stats as Stats);
    } finally { setBusy(false); }
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card-luxe ornament p-8 md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 rotate-45 items-center justify-center border-2 border-gold bg-gradient-to-br from-wine-deep via-wine to-wine-deep shadow-xl">
              <div className="-rotate-45 font-display text-3xl text-gold">A</div>
            </div>
            <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— RESTRICTED ACCESS —</div>
            <h1 className="mt-2 font-display text-3xl">
              <span className="text-gold-metal">OWNER / DEV</span>
              <span className="font-serif-italic text-ivory/80"> Login</span>
            </h1>
            <p className="mt-2 text-xs text-ivory/50">Masuk dengan akun Boss atau Dev untuk mengendalikan sistem.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-display text-[10px] tracking-[0.3em] text-gold-deep">USERNAME</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="dev / boss"
                className="w-full border-2 border-line-2 bg-ink-3 px-4 py-2.5 font-mono text-sm text-gold outline-none transition focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] tracking-[0.3em] text-gold-deep">PASSWORD</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginWithCredentials()}
                placeholder="dev12345 / goldenboss2026"
                className="w-full border-2 border-line-2 bg-ink-3 px-4 py-2.5 font-mono text-sm text-gold outline-none transition focus:border-gold"
              />
            </div>

            <button
              onClick={() => loginWithCredentials()}
              disabled={busy}
              className="btn-luxe mt-3 w-full"
            >
              {busy ? "Memproses..." : "Masuk ke Control Room"}
            </button>
          </div>

          {error && <div className="mt-4 border border-wine bg-wine-deep/20 p-3 text-center text-xs text-wine-light">{error}</div>}

          {/* Quick 1-Click Login Presets for testing */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-2.5 font-display text-[10px] tracking-[0.3em] text-gold-deep text-center">
              ⚡ AKUN TES CEPAT (KLIK UNTUK LOGIN):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setAdminUsername("dev"); setPw("dev12345"); loginWithCredentials("dev", "dev12345"); }}
                className="rounded border border-gold/40 bg-gold/10 p-2.5 text-center transition hover:bg-gold/20 hover:border-gold"
              >
                <div className="font-display text-xs font-bold text-gold">🚀 AKUN DEV</div>
                <div className="font-mono text-[10px] text-ivory/60">dev / dev12345</div>
              </button>
              <button
                type="button"
                onClick={() => { setAdminUsername("boss"); setPw("goldenboss2026"); loginWithCredentials("boss", "goldenboss2026"); }}
                className="rounded border border-wine-light/40 bg-wine-deep/30 p-2.5 text-center transition hover:bg-wine-deep/60 hover:border-wine-light"
              >
                <div className="font-display text-xs font-bold text-wine-light">👑 OWNER BOSS</div>
                <div className="font-mono text-[10px] text-ivory/60">boss / goldenboss2026</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "games", label: "Permainan", icon: "G" },
    { key: "users", label: "Member & Kehokian", icon: "M" },
    { key: "finance", label: "Keuangan", icon: "$" },
    { key: "announcements", label: "Pengumuman", icon: "P" },
    { key: "security", label: "Keamanan", icon: "S" },
  ] as const;

  const selectedUser = usersList.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— CONTROL ROOM —</div>
          <h1 className="font-display text-3xl md:text-4xl">
            <span className="text-gold-metal">OWNER & DEV</span>
            <span className="font-serif-italic text-ivory/80"> Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={busy} className="btn-ghost py-2 text-xs">
            {busy ? "Loading..." : "↻ Refresh Data"}
          </button>
          <form action={logoutAdminAction}>
            <button type="submit" className="btn-ghost border-wine/50 py-2 text-xs text-wine-light hover:border-wine hover:text-wine-light">
              Keluar
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-display text-xs tracking-widest transition ${
              tab === t.key
                ? "border-b-2 border-gold bg-gold/10 font-bold text-gold"
                : "text-ivory/50 hover:bg-ink-3 hover:text-ivory"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GAMES TAB */}
      {tab === "games" && (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {games.map((g) => (
              <div key={g.slug} className="card-luxe p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl text-gold-metal">{g.name}</h3>
                    <p className="mt-1 text-xs text-ivory/50">{g.description}</p>
                  </div>
                  <button
                    onClick={() => saveGame(g.slug, { enabled: g.enabled ? 0 : 1 })}
                    className={`rounded border px-2.5 py-1 font-display text-[10px] tracking-wider ${
                      g.enabled
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {g.enabled ? "AKTIF" : "NONAKTIF"}
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-display tracking-wider">
                      <span className="text-gold-deep">GAME BASE RTP</span>
                      <span className="font-bold text-gold">{g.rtp}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={99}
                      value={g.rtp}
                      onChange={(e) => setGames((gs) => gs.map((x) => (x.slug === g.slug ? { ...x, rtp: Number(e.target.value) } : x)))}
                      onMouseUp={() => saveGame(g.slug, { rtp: g.rtp })}
                      className="mt-2 w-full accent-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-display tracking-widest text-ivory/50">MIN BET</label>
                      <input
                        type="number"
                        value={g.minBet}
                        onChange={(e) => setGames((gs) => gs.map((x) => (x.slug === g.slug ? { ...x, minBet: Number(e.target.value) } : x)))}
                        onBlur={() => saveGame(g.slug, { minBet: g.minBet })}
                        className="mt-1 w-full border border-line-2 bg-ink-3 px-3 py-1.5 font-mono text-xs text-ivory outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-display tracking-widest text-ivory/50">MAX BET</label>
                      <input
                        type="number"
                        value={g.maxBet}
                        onChange={(e) => setGames((gs) => gs.map((x) => (x.slug === g.slug ? { ...x, maxBet: Number(e.target.value) } : x)))}
                        onBlur={() => saveGame(g.slug, { maxBet: g.maxBet })}
                        className="mt-1 w-full border border-line-2 bg-ink-3 px-3 py-1.5 font-mono text-xs text-ivory outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS & LUCK MANAGEMENT TAB */}
      {tab === "users" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1.1fr]">
            {/* User List Table */}
            <div className="card-luxe overflow-hidden flex flex-col">
              <div className="border-b border-line bg-ink-3 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-display text-[10px] tracking-[0.3em] text-gold">
                  DAFTAR SEMUA MEMBER ({filteredUsers.length})
                </span>
                <input
                  type="text"
                  placeholder="Cari user, nama, HP, NIK..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded border border-line-2 bg-ink-2 px-3 py-1 text-xs text-ivory placeholder:text-ivory/30 outline-none focus:border-gold"
                />
              </div>
              <div className="max-h-[580px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-ink-2 font-display text-[10px] tracking-[0.25em] text-gold-deep z-10">
                    <tr>
                      <th className="px-4 py-3 text-left">USER / NAMA</th>
                      <th className="px-4 py-3 text-right">SALDO</th>
                      <th className="px-4 py-3 text-center">KEHOKIAN</th>
                      <th className="px-4 py-3 text-center">STATUS</th>
                      <th className="px-4 py-3 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUserId === u.id;
                      const luckBadge =
                        u.luckMode === "always_win"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : u.luckMode === "super_hoki"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : u.luckMode === "rungkad"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                          : u.luckMode === "always_lose"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/30";

                      return (
                        <tr
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className={`cursor-pointer border-t border-line/50 transition hover:bg-gold/[0.04] ${
                            isSelected ? "bg-gold/[0.08] ring-1 ring-gold" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-xs font-bold tracking-widest text-ivory">
                                {u.username}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-sans uppercase ${
                                  u.role === "dev"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold"
                                    : u.role === "admin"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-ink-3 text-ivory/50"
                                }`}
                              >
                                {u.role || "player"}
                              </span>
                            </div>
                            <div className="text-[10px] text-ivory/40">{u.fullName}</div>
                            {u.phone && <div className="text-[9px] text-gold-deep/60">📱 {u.phone}</div>}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums text-gold">
                            {u.balance.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-sans ${luckBadge}`}>
                              {u.luckMode ? u.luckMode.toUpperCase().replace("_", " ") : "NORMAL"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge banned={u.isBanned} active={u.isActive} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBan(u.id, !u.isBanned); }}
                                className="border border-line-2 px-2 py-1 text-[9px] text-ivory/60 hover:border-wine hover:text-wine-light"
                              >
                                {u.isBanned ? "UNBAN" : "BAN"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleActive(u.id, !u.isActive); }}
                                className="border border-line-2 px-2 py-1 text-[9px] text-ivory/60 hover:border-gold hover:text-gold"
                              >
                                {u.isActive ? "OFF" : "ON"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Luck & Balance Control Panel */}
            <div className="space-y-4">
              {/* Member Full Dossier Card */}
              {selectedUser && (
                <div className="card-luxe p-5 border-gold/30 bg-ink-2/80">
                  <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                    <div>
                      <span className="text-[10px] font-display tracking-[0.25em] text-gold">
                        DATA LENGKAP MEMBER #{selectedUser.id}
                      </span>
                      <h4 className="font-display text-lg text-gold-metal font-bold">{selectedUser.fullName}</h4>
                    </div>
                    <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-mono text-gold border border-gold/30 font-bold">
                      @{selectedUser.username}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded border border-line-2 bg-ink-3/80 p-2.5">
                      <span className="text-[10px] font-display text-gold-deep tracking-wider block">NO TELEPON / WA</span>
                      <span className="font-mono text-ivory font-bold">{selectedUser.phone || "-"}</span>
                    </div>
                    <div className="rounded border border-line-2 bg-ink-3/80 p-2.5">
                      <span className="text-[10px] font-display text-gold-deep tracking-wider block">EMAIL</span>
                      <span className="font-mono text-ivory truncate block">{selectedUser.email || "-"}</span>
                    </div>
                    <div className="rounded border border-line-2 bg-ink-3/80 p-2.5">
                      <span className="text-[10px] font-display text-gold-deep tracking-wider block">NIK KTP</span>
                      <span className="font-mono text-ivory font-bold">{selectedUser.nik || "-"}</span>
                    </div>
                    <div className="rounded border border-line-2 bg-ink-3/80 p-2.5">
                      <span className="text-[10px] font-display text-gold-deep tracking-wider block">REFERRAL CODE</span>
                      <span className="font-mono text-gold font-bold">{selectedUser.referralCode || "-"}</span>
                    </div>
                    <div className="col-span-2 rounded border border-line-2 bg-ink-3/80 p-2.5">
                      <span className="text-[10px] font-display text-gold-deep tracking-wider block">ALAMAT DOMISILI</span>
                      <span className="text-ivory/80 text-[11px]">
                        {selectedUser.address ? `${selectedUser.address}, ${selectedUser.city || ""}, ${selectedUser.province || ""} ${selectedUser.postalCode || ""}` : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded bg-emerald-500/10 border border-emerald-500/30 p-2">
                      <span className="text-[9px] font-display text-emerald-400 block tracking-wider">TOTAL DEPO</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {(selectedUser.totalDeposited || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="rounded bg-wine/20 border border-wine/40 p-2">
                      <span className="text-[9px] font-display text-wine-light block tracking-wider">TOTAL WD</span>
                      <span className="font-mono text-wine-light font-bold">
                        {(selectedUser.totalWithdrawn || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="rounded bg-blue-500/10 border border-blue-500/30 p-2">
                      <span className="text-[9px] font-display text-blue-400 block tracking-wider">TOTAL BET</span>
                      <span className="font-mono text-blue-300 font-bold">
                        {(selectedUser.totalWagered || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-luxe p-6">
                <div className="mb-1 font-display text-[10px] tracking-[0.3em] text-gold-deep">
                  — PENGATURAN KEHOKIAN PER AKUN —
                </div>
                <h3 className="font-display text-2xl text-gold-metal">SETTING KEHOKIAN</h3>
                <p className="mt-1 text-xs text-ivory/60">
                  {selectedUser
                    ? `Mengatur Akun: ${selectedUser.username} (ID: ${selectedUser.id})`
                    : "Pilih akun dari tabel di sebelah kiri terlebih dahulu"}
                </p>

                {selectedUser && (
                  <div className="mt-4 space-y-4">
                    {/* Role selector */}
                    <div>
                      <label className="text-[10px] font-display tracking-widest text-gold-deep">
                        ROLE AKUN:
                      </label>
                      <div className="mt-1.5 grid grid-cols-3 gap-2">
                        {["player", "dev", "admin"].map((r) => (
                          <button
                            key={r}
                            onClick={() => applyRole(r)}
                            disabled={busy}
                            className={`rounded border py-1.5 text-xs font-display uppercase tracking-widest transition ${
                              userRole === r
                                ? "border-gold bg-gold/20 font-bold text-gold"
                                : "border-line-2 bg-ink-3 text-ivory/60 hover:border-gold/40"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Luck Presets */}
                    <div>
                      <label className="text-[10px] font-display tracking-widest text-gold-deep">
                        PRESET KEHOKIAN (WIN RATE):
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => applyLuck("always_win", 100, 2.0)}
                          disabled={busy}
                          className={`rounded border p-2 text-left text-xs transition ${
                            userLuckMode === "always_win"
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold"
                              : "border-line-2 bg-ink-3 text-ivory/70 hover:border-emerald-500/50"
                          }`}
                        >
                          <div className="font-bold">🍀 Selalu Menang (100%)</div>
                          <div className="text-[10px] opacity-60">Auto Maxwin tiap spin</div>
                        </button>
                        <button
                          onClick={() => applyLuck("super_hoki", 95, 1.5)}
                          disabled={busy}
                          className={`rounded border p-2 text-left text-xs transition ${
                            userLuckMode === "super_hoki"
                              ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold"
                              : "border-line-2 bg-ink-3 text-ivory/70 hover:border-amber-500/50"
                          }`}
                        >
                          <div className="font-bold">🌟 Super Hoki (95%)</div>
                          <div className="text-[10px] opacity-60">Peluang menang tinggi</div>
                        </button>
                        <button
                          onClick={() => applyLuck("normal", 50, 1.0)}
                          disabled={busy}
                          className={`rounded border p-2 text-left text-xs transition ${
                            userLuckMode === "normal"
                              ? "border-blue-500 bg-blue-500/20 text-blue-300 font-bold"
                              : "border-line-2 bg-ink-3 text-ivory/70 hover:border-blue-500/50"
                          }`}
                        >
                          <div className="font-bold">🎲 Normal (Game RTP)</div>
                          <div className="text-[10px] opacity-60">RTP standar kasino</div>
                        </button>
                        <button
                          onClick={() => applyLuck("rungkad", 8, 0.8)}
                          disabled={busy}
                          className={`rounded border p-2 text-left text-xs transition ${
                            userLuckMode === "rungkad"
                              ? "border-orange-500 bg-orange-500/20 text-orange-300 font-bold"
                              : "border-line-2 bg-ink-3 text-ivory/70 hover:border-orange-500/50"
                          }`}
                        >
                          <div className="font-bold">💀 Apes / Rungkad (8%)</div>
                          <div className="text-[10px] opacity-60">Disedot terus</div>
                        </button>
                        <button
                          onClick={() => applyLuck("always_lose", 0, 0.0)}
                          disabled={busy}
                          className={`col-span-2 rounded border p-2 text-left text-xs transition ${
                            userLuckMode === "always_lose"
                              ? "border-rose-500 bg-rose-500/20 text-rose-300 font-bold"
                              : "border-line-2 bg-ink-3 text-ivory/70 hover:border-rose-500/50"
                          }`}
                        >
                          <div className="font-bold">🚫 Selalu Kalah (0%)</div>
                          <div className="text-[10px] opacity-60">Pasti kalah 100% tiap taruhan</div>
                        </button>
                      </div>
                    </div>

                    {/* Custom Win Rate Slider */}
                    <div className="rounded border border-line-2 bg-ink-3 p-3">
                      <div className="flex justify-between text-xs font-display">
                        <span className="text-gold-deep">CUSTOM WIN PROBABILITY</span>
                        <span className="font-bold text-gold">{userWinRate}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={userWinRate}
                        onChange={(e) => setUserWinRate(Number(e.target.value))}
                        className="mt-2 w-full accent-gold"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => applyLuck("custom", userWinRate, userLuckMult)}
                          disabled={busy}
                          className="btn-luxe py-1 text-[10px]"
                        >
                          Terapkan Custom ({userWinRate}%)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Balance Management */}
              <div className="card-luxe p-6">
                <div className="mb-1 font-display text-[10px] tracking-[0.3em] text-gold-deep">— SALDO & BONUS —</div>
                <h3 className="font-display text-xl text-gold-metal">SET SALDO & BONUS</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-ivory/50">SET TOTAL SALDO</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(Number(e.target.value))}
                        disabled={!selectedUserId}
                        className="w-full border-2 border-line-2 bg-ink-3 px-3 py-2 font-mono text-lg text-gold outline-none focus:border-gold disabled:opacity-30"
                      />
                      <button onClick={applyBalance} disabled={busy || !selectedUserId} className="btn-luxe whitespace-nowrap text-xs">
                        Set Saldo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-widest text-ivory/50">TAMBAH BONUS CEPAT</label>
                    <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                      {[100_000, 1_000_000, 10_000_000, 100_000_000].map((v) => (
                        <button
                          key={v}
                          onClick={() => { setBonus(v); }}
                          disabled={!selectedUserId}
                          className="border border-line-2 bg-ink-3 py-1.5 font-display text-[10px] font-bold text-ivory/70 hover:border-gold hover:text-gold disabled:opacity-30"
                        >
                          +{v >= 1_000_000 ? `${v / 1_000_000}JT` : `${v / 1000}K`}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={applyBonus}
                      disabled={busy || !selectedUserId}
                      className="btn-luxe btn-luxe-red mt-3 w-full text-xs"
                    >
                      + Tambah {bonus.toLocaleString("id-ID")} Koin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE TAB */}
      {tab === "finance" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {stats && <StatBox label="Total Wagered" value={stats.totalWagered.toLocaleString("id-ID")} />}
            {stats && <StatBox label="Player Profit" value={`${stats.playerProfit > 0 ? "+" : ""}${stats.playerProfit.toLocaleString("id-ID")}`} tone={stats.playerProfit > 0 ? "win" : stats.playerProfit < 0 ? "lose" : undefined} />}
            {stats && <StatBox label="House Edge" value={`${stats.totalWagered > 0 ? (((stats.totalWagered - (stats.totalWagered + stats.playerProfit)) / stats.totalWagered) * 100).toFixed(2) : "0.00"}%`} tone="win" />}
          </div>

          <TxPanel title="PENDING DEPOSIT / TOP-UP" rows={pendingTopUps} type="topup" onReview={reviewTopUp} />
          <TxPanel title="PENDING WITHDRAWAL" rows={pendingWithdrawals} type="withdrawal" onReview={reviewWithdrawal} />

          <div className="card-luxe p-6">
            <div className="mb-4 border-b border-line pb-3 font-display text-[10px] tracking-[0.3em] text-gold">REKENING TUJUAN</div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {allBankAccounts.map((b) => (
                <div key={b.id} className={`border p-4 ${b.active ? "border-gold-deep/50 bg-gold/5" : "border-line-2 bg-ink-3 opacity-50"}`}>
                  <div className="flex items-center justify-between"><span className="font-display text-xs tracking-widest text-gold">{b.name}</span><button onClick={() => adminToggleBankAccount(b.id, !b.active)} className="text-[9px] text-ivory/50 underline">{b.active ? "Nonaktifkan" : "Aktifkan"}</button></div>
                  <div className="mt-1 font-mono text-xs text-ivory">{b.number}</div>
                  <div className="text-[10px] text-ivory/50">{b.holder}</div>
                </div>
              ))}
            </div>
            <form onSubmit={addBank} className="grid gap-3 border-t border-line pt-4 md:grid-cols-5">
              <select name="method" className="border border-line-2 bg-ink-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold"><option value="bank">Bank</option><option value="ewallet">E-Wallet</option><option value="qris">QRIS</option><option value="crypto">Crypto</option></select>
              <input name="name" placeholder="Nama" className="border border-line-2 bg-ink-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold" />
              <input name="number" placeholder="Nomor" className="border border-line-2 bg-ink-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold" />
              <input name="holder" placeholder="Atas Nama" className="border border-line-2 bg-ink-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold" />
              <button type="submit" disabled={busy} className="btn-luxe text-[10px]">Tambah Rekening</button>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {tab === "announcements" && (
        <div className="space-y-5">
          <div className="card-luxe p-6">
            <div className="mb-4 border-b border-line pb-3 font-display text-[10px] tracking-[0.3em] text-gold">BUAT PENGUMUMAN</div>
            <form onSubmit={addAnnouncement} className="space-y-3">
              <input name="title" placeholder="Judul" className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
              <textarea name="content" placeholder="Isi pengumuman" rows={3} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
              <div className="flex gap-3">
                <select name="type" className="border border-line-2 bg-ink-3 px-3 py-2 text-sm text-ivory outline-none focus:border-gold"><option value="info">Info</option><option value="warning">Warning</option><option value="promo">Promo</option></select>
                <button type="submit" disabled={busy} className="btn-luxe">Publikasikan</button>
              </div>
            </form>
          </div>
          <div className="grid gap-4">
            {allAnnouncements.map((a) => (
              <div key={a.id} className={`card-luxe p-5 ${a.active ? "border-l-4 border-l-gold" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-xs tracking-widest text-gold">{a.title}</div>
                    <p className="mt-1 text-sm text-ivory/70">{a.content}</p>
                    <div className="mt-2 font-display text-[9px] tracking-widest text-ivory/40">{a.type.toUpperCase()}</div>
                  </div>
                  <button onClick={() => adminToggleAnnouncement(a.id, !a.active)} className="btn-ghost text-[9px]">{a.active ? "Nonaktifkan" : "Aktifkan"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-luxe p-6">
              <div className="mb-1 font-display text-[10px] tracking-[0.3em] text-gold-deep">— GLOBAL RTP —</div>
              <h3 className="font-display text-xl text-gold-metal">MODIFIER SEMUA GAME</h3>
              <p className="mt-1 text-sm text-ivory/50">1.0 = normal. 1.2 = semua game lebih hoki.</p>
              <GlobalRtpSetting />
            </div>
            <div className="card-luxe p-6">
              <div className="mb-1 font-display text-[10px] tracking-[0.3em] text-gold-deep">— SECURITY —</div>
              <h3 className="font-display text-xl text-gold-metal">UBAH PASSWORD OWNER</h3>
              <div className="mt-4 space-y-3">
                <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Password lama" className="w-full border border-line-2 bg-ink-3 px-3 py-2 text-sm text-ivory outline-none focus:border-gold" />
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Password baru" className="w-full border border-line-2 bg-ink-3 px-3 py-2 text-sm text-ivory outline-none focus:border-gold" />
                <button onClick={doChangePassword} disabled={busy} className="btn-luxe w-full">Ganti Password</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: "win" | "lose" }) {
  return (
    <div className="card-luxe p-5">
      <div className="font-display text-[10px] tracking-[0.25em] text-gold-deep">{label}</div>
      <div className={`mt-2 font-display text-2xl font-black tabular-nums ${tone === "win" ? "text-emerald-400" : tone === "lose" ? "text-wine-light" : "text-gold-metal"}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ banned, active }: { banned: boolean; active: boolean }) {
  if (banned) return <span className="rounded bg-wine-deep/40 px-2 py-0.5 text-[9px] text-wine-light">BANNED</span>;
  if (!active) return <span className="rounded bg-ink-3 px-2 py-0.5 text-[9px] text-ivory/40">NONAKTIF</span>;
  return <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-400">AKTIF</span>;
}

function TxPanel({ title, rows, type, onReview }: { title: string; rows: TxRow[]; type: "topup" | "withdrawal"; onReview: (id: number, s: "approved" | "rejected") => void }) {
  return (
    <div className="card-luxe overflow-hidden">
      <div className="border-b border-line bg-ink-3 px-5 py-3 font-display text-[10px] tracking-[0.3em] text-gold">{title} ({rows.length})</div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-xs text-ivory/40">Tidak ada transaksi tertunda.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-ink-2 font-display text-[10px] tracking-[0.25em] text-gold-deep">
            <tr>
              <th className="px-4 py-3 text-left">USER</th>
              <th className="px-4 py-3 text-right">JUMLAH</th>
              <th className="px-4 py-3 text-left">METODE</th>
              <th className="px-4 py-3 text-left">DETAIL</th>
              <th className="px-4 py-3 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line/50">
                <td className="px-4 py-3">User #{r.userId}</td>
                <td className="px-4 py-3 text-right font-bold text-gold">{r.amount.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 uppercase">{r.method}</td>
                <td className="px-4 py-3 text-[10px] text-ivory/60">{r.accountName} {r.accountNumber ? `(${r.accountNumber})` : ""} {r.reference ? `Ref: ${r.reference}` : ""}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onReview(r.id, "approved")} className="btn-luxe py-1 text-[9px]">Setujui</button>
                    <button onClick={() => onReview(r.id, "rejected")} className="btn-ghost py-1 text-[9px] text-wine-light">Tolak</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function GlobalRtpSetting() {
  const [val, setVal] = useState(1.0);
  return (
    <div className="mt-4">
      <div className="flex justify-between font-mono text-xs"><span className="text-ivory/60">Modifier:</span><span className="font-bold text-gold">{val.toFixed(2)}x</span></div>
      <input type="range" min={0.1} max={3.0} step={0.05} value={val} onChange={(e) => setVal(Number(e.target.value))} className="mt-2 w-full accent-gold" />
      <button onClick={() => adminUpdateSetting("global_rtp_modifier", val)} className="btn-luxe mt-3 w-full py-2 text-xs">Simpan Modifier RTP</button>
    </div>
  );
}
