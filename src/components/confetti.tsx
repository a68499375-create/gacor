"use client";

import { useEffect, useState } from "react";

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = ["#d4af37", "#f4d03f", "#c0262d", "#0f9b58", "#8b6914"];
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  );
}
