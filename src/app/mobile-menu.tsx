"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "./actions";

export function MobileMenu({ user, owner }: { user: { username: string } | null; owner: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Lobby" },
    { href: "/games/slots", label: "Slots" },
    { href: "/games/roulette", label: "Roulette" },
    { href: "/games/dice", label: "Dice" },
    { href: "/games/coinflip", label: "Coin Flip" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/chat", label: "Chat Room" },
    { href: "/daily", label: "Daily Bonus" },
    { href: "/history", label: "Riwayat" },
    { href: "/profile", label: "Profil" },
    { href: "/topup", label: "Deposit" },
    { href: "/withdraw", label: "Withdraw" },
    { href: "/referral", label: "Referral" },
    { href: "/faq", label: "FAQ" },
    { href: "/support", label: "Support" },
    { href: "/admin", label: owner ? "Owner Panel" : "Owner Login" },
  ];

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-gold-deep/50 bg-ink-3">
        <span className={`h-0.5 w-5 bg-gold transition ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-5 bg-gold transition ${open ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-5 bg-gold transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="fixed inset-0 top-[105px] z-50 bg-ink/98 backdrop-blur-lg">
          <div className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <span className="font-display text-xs tracking-[0.3em] text-gold">MENU</span>
              <button onClick={() => setOpen(false)} className="text-2xl text-ivory/50 hover:text-gold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border border-line-2 bg-ink-3 px-4 py-3 font-display text-xs tracking-widest text-ivory/80 transition hover:border-gold hover:text-gold">
                  {l.label.toUpperCase()}
                </Link>
              ))}
            </div>
            {user && (
              <form action={logoutAction} className="mt-6">
                <button type="submit" className="btn-luxe w-full">Logout</button>
              </form>
            )}
            {!user && (
              <div className="mt-6 flex gap-3">
                <Link href="/login" className="btn-luxe flex-1">Login</Link>
                <Link href="/register" className="btn-ghost flex-1">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
