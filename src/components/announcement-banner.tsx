"use client";

import { useState, useEffect } from "react";

type Announcement = { id: number; title: string; content: string; type: "info" | "warning" | "promo"; dismissible: boolean; showOnce: boolean };

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [visible, setVisible] = useState<Announcement[]>([]);

  useEffect(() => {
    const now = Date.now();
    const filtered = announcements.filter((a) => {
      if (!a.showOnce) return true;
      const key = `announcement_${a.id}`;
      const dismissed = localStorage.getItem(key);
      if (dismissed) return false;
      return true;
    });
    setVisible(filtered);
  }, [announcements]);

  function dismiss(id: number) {
    localStorage.setItem(`announcement_${id}`, "1");
    setVisible((v) => v.filter((a) => a.id !== id));
  }

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div key={a.id} className={`relative border px-4 py-3 ${a.type === "promo" ? "border-gold bg-gold/10" : a.type === "warning" ? "border-wine bg-wine-deep/20" : "border-line-2 bg-ink-3"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`font-display text-[10px] tracking-[0.3em] ${a.type === "promo" ? "text-gold" : a.type === "warning" ? "text-wine-light" : "text-ivory/70"}`}>{a.type.toUpperCase()}</div>
              <div className="mt-0.5 font-display text-sm font-bold text-ivory">{a.title}</div>
              <div className="text-xs text-ivory/70">{a.content}</div>
            </div>
            {a.dismissible && <button onClick={() => dismiss(a.id)} className="text-lg leading-none text-ivory/50 hover:text-gold">×</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
