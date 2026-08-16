"use client";

import { useState, useEffect } from "react";
import { getLastResultsAction } from "@/app/actions";
import { SlotSymbolIcon } from "@/components/casino-icons";

export function LastResults({ gameSlug }: { gameSlug: string }) {
  const [results, setResults] = useState<{ meta: Record<string, unknown>; createdAt: Date }[]>([]);

  useEffect(() => {
    getLastResultsAction(gameSlug).then(setResults);
  }, [gameSlug]);

  function renderItem(r: any) {
    if (gameSlug === "slots") {
      const reels = (r.meta.reels as string[]) || [];
      return (
        <div className="flex items-center gap-0.5">
          {reels.map((s, idx) => (
            <SlotSymbolIcon key={idx} symbol={s} className="w-3.5 h-3.5" />
          ))}
        </div>
      );
    }
    if (gameSlug === "roulette") {
      const n = r.meta.number as number;
      const color = r.meta.color as string;
      return <span className={color === "red" ? "text-wine-light font-bold" : color === "black" ? "text-ivory font-bold" : "text-emerald-400 font-bold"}>{n}</span>;
    }
    if (gameSlug === "dice") {
      return <span className="text-gold font-bold">{r.meta.roll}</span>;
    }
    return <span className="text-gold font-bold text-[10px] uppercase">{(r.meta.result_side as string)?.[0] || "?"}</span>;
  }

  return (
    <div className="card-luxe p-4">
      <div className="mb-3 border-b border-line pb-2 font-display text-[10px] tracking-[0.3em] text-gold">LAST 15 RESULTS</div>
      <div className="flex flex-wrap gap-2">
        {results.slice(0, 15).map((r, i) => (
          <div key={i} className="flex h-9 w-9 items-center justify-center border border-line-2 bg-ink-3 font-mono text-xs">
            {renderItem(r)}
          </div>
        ))}
        {results.length === 0 && <span className="text-xs text-ivory/40">Belum ada data</span>}
      </div>
    </div>
  );
}
