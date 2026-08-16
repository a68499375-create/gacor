import Link from "next/link";
import { getInitialState } from "./actions";
import { RecentWins } from "./recent-wins";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { LuckySevenIcon, CrownHeadIcon, ArenaTailsIcon, DiamondIcon, StarIcon, CasinoChipSVG } from "@/components/casino-icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user, games, history, stats, announcements, leaderboard, tournament } = await getInitialState();
  const progressive = 1250000;

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-8 overflow-hidden rounded-2xl md:-mx-6 md:-mt-12 border-b border-gold-deep/40 bg-gradient-to-b from-stone-950 via-zinc-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,208,63,0.15),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(185,28,28,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative px-6 py-20 md:px-12 md:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
              <span className="font-display text-[10px] tracking-[0.35em] text-gold font-bold">
                PRIVATE CASINO · MMXXVI
              </span>
            </div>
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[84px]">
              <span className="text-ivory">THE </span>
              <span className="text-gold-metal font-black">HOUSE</span>
              <br />
              <span className="font-serif-italic text-ivory/85"> always </span>
              <span className="text-wine-light font-black">WINS.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg">
              Kasino pribadi berkinerja tinggi dengan grafis vektor murni, tanpa batasan taruhan, dan mesin probabilitas yang dapat Anda kendalikan secara penuh.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link href="/games/slots" className="btn-gold-luxe px-8 py-3.5 text-sm font-display tracking-widest font-black">
                  MASUK MEJA GAME →
                </Link>
              ) : (
                <Link href="/register" className="btn-gold-luxe px-8 py-3.5 text-sm font-display tracking-widest font-black">
                  DAFTAR SEKARANG →
                </Link>
              )}
              <Link href="/admin" className="rounded border border-gold/40 bg-ink-3/80 px-6 py-3.5 font-display text-xs tracking-widest text-gold transition hover:border-gold hover:bg-gold/10">
                CONTROL ROOM
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 border-t border-gold-deep/30 pt-6">
              <HeroStat value="4" label="MEJA KLASIK" />
              <div className="h-10 w-px bg-gold-deep/30" />
              <HeroStat value="1 MILIAR" label="MAX BET UNLOCKED" />
              <div className="h-10 w-px bg-gold-deep/30" />
              <HeroStat value="100%" label="RTP & LUCK CONTROL" />
            </div>
          </div>
        </div>
      </section>

      {/* Progressive Jackpot Banner */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-gold/50 bg-gradient-to-r from-amber-950 via-zinc-950 to-amber-950 py-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,208,63,0.18),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1400px] px-6 text-center">
          <div className="inline-flex items-center gap-2 font-display text-[10px] tracking-[0.4em] text-gold font-bold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            PROGRESSIVE JACKPOT POOL
          </div>
          <div className="mt-2 font-display text-5xl font-black tabular-nums text-gold-metal md:text-7xl drop-shadow-[0_4px_16px_rgba(244,208,63,0.6)]">
            {progressive.toLocaleString("id-ID")}
          </div>
          <div className="mt-2 text-xs text-ivory/60">Terkumpul dari 1% setiap putaran di seluruh meja kasino</div>
        </div>
      </section>

      {/* The Tables Grid */}
      <section>
        <SectionHeader
          kicker="The Tables"
          title="Pilih Permainanmu"
          sub="Empat meja klasik kasino dengan simulasi fisika putaran nyata dan animasi vektor SVG murni."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-12">
          {/* Slots Card */}
          <div className="md:col-span-7 md:row-span-2">
            <Link
              href="/games/slots"
              className="card-luxe group relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-gold-deep/60 bg-gradient-to-br from-amber-950/80 via-zinc-950 to-black p-8 transition-all hover:border-gold hover:shadow-2xl hover:shadow-gold/20"
            >
              <div className="absolute -right-6 -top-6 opacity-30 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-45">
                <LuckySevenIcon className="w-56 h-56" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-gold bg-gold/20 px-2.5 py-1 font-display text-[10px] tracking-widest text-gold font-bold">
                  HOT
                </span>
                <span className="rounded border border-wine-light bg-wine/80 px-2.5 py-1 font-display text-[10px] tracking-widest text-ivory font-bold">
                  FEATURED JACKPOT
                </span>
              </div>
              <div className="relative mt-12">
                <div className="font-serif-italic text-xs tracking-widest text-gold/80">Vegas Classic 3-Reel</div>
                <h3 className="font-display text-4xl md:text-5xl font-black text-ivory mt-1">Lucky Reels 777</h3>
                <p className="mt-2 max-w-md text-xs text-ivory/60">
                  Gulungan mekanikal 3D berkecepatan tinggi dengan simbol Triple 7, Diamond, Bell, dan multiplier jackpot beruntun.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-line-2 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-900 border border-gold/30">
                      <div className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright w-[65%]" />
                    </div>
                    <span className="font-display text-xs tracking-widest text-gold font-bold">RTP 65%</span>
                  </div>
                  <span className="font-display text-xs tracking-widest text-gold-bright group-hover:translate-x-1 transition-transform font-bold">
                    MAIN SEKARANG →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Roulette Card */}
          <div className="md:col-span-5">
            <Link
              href="/games/roulette"
              className="card-luxe group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-gold-deep/60 bg-gradient-to-br from-red-950/60 via-zinc-950 to-black p-6 transition-all hover:border-gold hover:shadow-2xl hover:shadow-gold/20"
            >
              <div className="absolute -right-4 -bottom-4 opacity-25 transition-transform duration-500 group-hover:scale-110">
                <CasinoChipSVG value="36" color="gold" className="w-40 h-40" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-emerald-500 bg-emerald-950/80 px-2.5 py-1 font-display text-[10px] tracking-widest text-emerald-400 font-bold">
                  LIVE 3D WHEEL
                </span>
              </div>
              <div className="relative mt-6">
                <div className="font-serif-italic text-xs tracking-widest text-gold/80">European Single Zero (0-36)</div>
                <h3 className="font-display text-3xl font-black text-ivory mt-1">Royal Roulette</h3>
                <div className="mt-4 flex items-center justify-between border-t border-line-2 pt-3">
                  <span className="font-display text-xs text-gold">RTP 60%</span>
                  <span className="font-display text-xs text-gold-bright group-hover:translate-x-1 transition-transform font-bold">
                    PUTAR RODA →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Crypto Dice Card */}
          <div className="md:col-span-3">
            <Link
              href="/games/dice"
              className="card-luxe group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-line-2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 transition-all hover:border-gold hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="rounded border border-gold/40 bg-ink-3 px-2 py-0.5 font-display text-[9px] tracking-widest text-gold">
                  PROVABLY FAIR
                </span>
                <DiamondIcon className="w-8 h-8 opacity-60" />
              </div>
              <div className="relative mt-4">
                <div className="font-serif-italic text-[10px] text-gold/70">Over / Under</div>
                <h3 className="font-display text-2xl font-bold text-ivory">Crypto Dice</h3>
                <div className="mt-3 flex items-center justify-between text-xs font-display text-gold">
                  <span>0-99</span>
                  <span className="group-hover:translate-x-1 transition-transform">LEMPAR →</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Coinflip Card */}
          <div className="md:col-span-2">
            <Link
              href="/games/coinflip"
              className="card-luxe group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-line-2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 transition-all hover:border-gold hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="rounded border border-gold/40 bg-ink-3 px-2 py-0.5 font-display text-[9px] tracking-widest text-gold">
                  1.95×
                </span>
                <CrownHeadIcon className="w-8 h-8 opacity-60" />
              </div>
              <div className="relative mt-4">
                <div className="font-serif-italic text-[10px] text-gold/70">Double or Nothing</div>
                <h3 className="font-display text-2xl font-bold text-ivory">Coin Flip</h3>
                <div className="mt-3 flex items-center justify-between text-xs font-display text-gold">
                  <span>3D Flip</span>
                  <span className="group-hover:translate-x-1 transition-transform">FLIP →</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tournament Banner */}
      {tournament && (
        <section className="card-luxe overflow-hidden rounded-2xl border-2 border-gold-deep/60 p-6 md:p-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-6">
            <div>
              <div className="mb-2 font-display text-[10px] tracking-[0.4em] text-gold font-bold">TURNAMEN AKTIF</div>
              <h2 className="font-display text-3xl font-black text-gold-metal">{tournament.name}</h2>
              <p className="mt-2 max-w-xl text-sm text-ivory/60">{tournament.description}</p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <div className="font-display text-2xl font-black text-gold">{tournament.prizePool.toLocaleString("id-ID")}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ivory/40">Total Hadiah Koin</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-gold">{tournament.metric.toUpperCase()}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ivory/40">Sistem Penilaian</div>
                </div>
              </div>
              <Link href="/leaderboard" className="btn-gold-luxe inline-block mt-6 px-6 py-2.5 text-xs font-display font-bold">
                LIHAT LEADERBOARD →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promo Rewards Section */}
      <section className="relative overflow-hidden rounded-2xl border-y border-gold-deep/40 bg-gradient-to-r from-wine-deep via-zinc-950 to-wine-deep py-10">
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-6 px-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <PromoBlock label="Welcome Bonus" value="+5,000" sub="Otomatis saat akun terdaftar" />
          <div className="hidden h-16 w-px bg-gold-deep/40 md:block" />
          <PromoBlock label="Daily Reward" value="+1,000" sub="Klaim gratis setiap hari" center />
          <div className="hidden h-16 w-px bg-gold-deep/40 md:block" />
          <PromoBlock label="Referral Bonus" value="5%" sub="Dari setiap deposit downline" right />
        </div>
      </section>

      {/* Recent Ledger History */}
      <section>
        <SectionHeader kicker="The Ledger" title="Riwayat Taruhan Terbaru" sub="Setiap taruhan tercatat abadi dan terverifikasi di server." />
        <div className="mt-8">
          <RecentWins history={history} />
        </div>
      </section>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-gold md:text-3xl font-black">{value}</div>
      <div className="font-display text-[10px] tracking-[0.25em] text-ivory/50">{label}</div>
    </div>
  );
}

function SectionHeader({ kicker, title, sub, align = "center" }: { kicker: string; title: string; sub?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="mb-3 font-display text-[10px] tracking-[0.4em] text-gold">— {kicker.toUpperCase()} —</div>
      <h2 className="font-display text-4xl md:text-5xl">
        <span className="text-ivory">{title.split(" ")[0]}</span>{" "}
        <span className="font-serif-italic text-gold">{title.split(" ").slice(1).join(" ")}</span>
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-sm text-ivory/50">{sub}</p>}
    </div>
  );
}

function PromoBlock({ label, value, sub, center, right }: { label: string; value: string; sub: string; center?: boolean; right?: boolean }) {
  return (
    <div className={center ? "text-center" : right ? "text-right" : "text-left"}>
      <div className="font-display text-[10px] tracking-[0.3em] text-gold/70">{label.toUpperCase()}</div>
      <div className="mt-1 font-display text-3xl text-gold-metal md:text-4xl font-black">{value}</div>
      <div className="mt-1 text-xs text-ivory/50">{sub}</div>
    </div>
  );
}
