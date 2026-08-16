"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyNotificationsAction, markAllNotificationsReadAction } from "./actions";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; read: boolean; type: string }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMyNotificationsAction().then(setNotifications);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await markAllNotificationsReadAction();
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative flex h-10 w-10 items-center justify-center border border-gold-deep/50 bg-ink-3 transition hover:border-gold">
        <span className="text-lg text-gold">N</span>
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wine text-[9px] font-black text-white">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 border border-line-2 bg-ink-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-[10px] tracking-[0.3em] text-gold">NOTIFIKASI</span>
            <button onClick={markAllRead} className="text-[10px] text-ivory/50 underline hover:text-gold">Tandai dibaca</button>
          </div>
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 && <div className="p-4 text-center text-xs text-ivory/40">Tidak ada notifikasi</div>}
            {notifications.map((n) => (
              <div key={n.id} className={`border-b border-line/50 p-3 ${n.read ? "opacity-60" : "bg-gold/5"}`}>
                <div className={`font-display text-[9px] tracking-widest ${n.type === "promo" ? "text-gold" : n.type === "warning" ? "text-wine-light" : "text-ivory/70"}`}>{n.title}</div>
                <div className="mt-0.5 text-xs text-ivory/80">{n.message}</div>
              </div>
            ))}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-line bg-ink-2 py-2 text-center text-[10px] tracking-widest text-gold hover:bg-ink-3">
            LIHAT SEMUA
          </Link>
        </div>
      )}
    </div>
  );
}
