import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { BalanceBadge } from "./balance-badge";
import { LiveTicker } from "./live-ticker";
import { MobileMenu } from "./mobile-menu";
import { NotificationBell } from "./notification-bell";
import { ToastContainer } from "@/components/toast";
import { DevToolbar } from "@/components/dev-toolbar";
import { ensureSeeded } from "@/lib/bootstrap";
import { getCurrentUser, getCurrentOwner } from "@/lib/auth";
import { logoutAction, logoutAdminAction } from "./actions";

export const metadata: Metadata = {
  title: "GOLDEN ARENA — The House Always Wins",
  description: "Private casino simulator. Kendalikan RTP, saldo, dan setiap detail permainan.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  try {
    await ensureSeeded();
  } catch {}
  let user = null;
  let owner = null;
  try {
    user = await getCurrentUser();
  } catch {}
  try {
    owner = await getCurrentOwner();
  } catch {}

  return (
    <html lang="id">
      <body className="velvet-bg paper-grain min-h-screen">
        <ToastContainer />
        <DevToolbar user={user} />
        <div className="relative z-20 border-b border-line bg-ink/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-gold-deep md:px-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="live-dot" /> Live Online</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">24/7 Private Arena</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/support" className="transition hover:text-gold">Support</Link>
              <span>ID</span>
            </div>
          </div>
        </div>

        <header className="sticky top-0 z-10 glass-nav">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 md:px-6">
            <Link href="/" className="group flex items-center gap-3">
              <Logo />
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl font-black tracking-wider text-gold-metal md:text-[28px]">GOLDEN<span className="text-ivory">ARENA</span></span>
                <span className="font-serif-italic text-[10px] tracking-[0.3em] text-gold-deep md:text-xs">— The House Always Wins —</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex">
              <NavLink href="/" label="Lobby" />
              <NavLink href="/games/slots" label="Slots" dot />
              <NavLink href="/games/roulette" label="Roulette" dot />
              <NavLink href="/games/dice" label="Dice" dot />
              <NavLink href="/games/coinflip" label="Coin Flip" dot />
              <NavLink href="/leaderboard" label="Rank" />
              <NavLink href="/chat" label="Chat" />
              <NavLink href="/history" label="Riwayat" />
              {owner ? <NavLink href="/admin" label="Owner" admin /> : <NavLink href="/admin" label="Owner" />}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <BalanceBadge initialBalance={user?.balance ?? 0} />
              {user && <NotificationBell />}
              <div className="hidden md:flex md:items-center md:gap-2">
                {user ? (
                  <>
                    <Link href="/profile" className="font-display text-[10px] tracking-widest text-gold hover:text-gold-bright">{user.username}</Link>
                    <form action={logoutAction}><button type="submit" className="btn-ghost py-1.5 text-[9px]">Logout</button></form>
                  </>
                ) : (
                  <Link href="/login" className="btn-ghost py-1.5 text-[10px]">Login</Link>
                )}
              </div>
              <MobileMenu user={user} owner={!!owner} />
            </div>
          </div>
          <LiveTicker />
        </header>

        <main className="relative z-[5] mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-12">{children}</main>

        <footer className="relative z-[5] mt-20 border-t border-line bg-ink">
          <div className="mx-auto max-w-[1400px] px-6 py-10">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2">
                  <Logo small />
                  <span className="font-display text-lg tracking-wider text-gold">GOLDENARENA</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ivory/40">
                  Simulator kasino pribadi untuk hiburan dan riset probabilitas.
                  Semua koin bersifat virtual, tidak ada uang nyata yang dipertaruhkan.
                </p>
              </div>
              <FooterCol title="Permainan" links={["Slots", "Roulette", "Dice", "Coin Flip"]} />
              <FooterCol title="Komunitas" links={["Leaderboard", "Chat Room", "Turnamen", "Referral"]} />
              <FooterCol title="Bantuan" links={["FAQ", "Support", "Terms", "Responsible Play"]} />
            </div>
            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-[10px] uppercase tracking-widest text-ivory/30 md:flex-row md:items-center">
              <p>© MMXXVI Golden Arena · Private Simulator · 18+</p>
              <p>Main dengan bijak. Keberuntungan bisa diatur — tanggung jawab tidak.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-12 w-12";
  return (
    <div className={`relative ${size}`}>
      <div className={`absolute inset-0 ${size} rotate-45 border-2 border-gold bg-gradient-to-br from-wine-deep via-wine to-wine-deep shadow-lg shadow-wine/40`}>
        <div className="absolute inset-[3px] border border-gold-deep/60" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-black text-gold-metal">{small ? "G" : "A"}</div>
    </div>
  );
}

function NavLink({ href, label, dot, admin }: { href: string; label: string; dot?: boolean; admin?: boolean }) {
  return (
    <Link href={href} className={`group relative px-4 py-2 font-display text-xs tracking-[0.2em] transition ${admin ? "text-gold-bright hover:text-gold" : "text-ivory/70 hover:text-gold"}`}>
      {label}
      {dot && <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-gold opacity-0 transition group-hover:opacity-100" />}
      <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-gold transition-all group-hover:w-[60%]" />
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 font-display text-xs tracking-[0.25em] text-gold">{title}</h4>
      <ul className="space-y-1.5 text-sm text-ivory/50">
        {links.map((l) => <li key={l}><span className="transition hover:text-gold cursor-pointer">{l}</span></li>)}
      </ul>
    </div>
  );
}
