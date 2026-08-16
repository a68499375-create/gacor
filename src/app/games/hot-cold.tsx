"use client";

import { useState, useEffect } from "react";
import { getHotColdRouletteAction } from "@/app/actions";

export function HotColdRoulette() {
  const [data, setData] = useState<{ hot: [number, number][]; cold: [number, number][] } | null>(null);

  useEffect(() => { getHotColdRouletteAction().then(setData); }, []);

  if (!data) return <div className="skeleton h-24 w-full" />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="card-luxe p-4">
        <div className="mb-2 font-display text-[10px] tracking-[0.3em] text-wine-light">HOT NUMBERS</div>
        <div className="flex flex-wrap gap-2">
          {data.hot.map(([n, c]) => (
            <div key={n} className="flex h-10 w-10 flex-col items-center justify-center border border-wine bg-wine-deep/20">
              <span className="font-display text-sm text-ivory">{n}</span>
              <span className="text-[8px] text-ivory/50">{c}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card-luxe p-4">
        <div className="mb-2 font-display text-[10px] tracking-[0.3em] text-felt">COLD NUMBERS</div>
        <div className="flex flex-wrap gap-2">
          {data.cold.map(([n, c]) => (
            <div key={n} className="flex h-10 w-10 flex-col items-center justify-center border border-felt bg-felt/10">
              <span className="font-display text-sm text-ivory">{n}</span>
              <span className="text-[8px] text-ivory/50">{c}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
