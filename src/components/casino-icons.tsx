"use client";
import React from "react";

// ==================== SLOTS SVG SYMBOLS ====================

export function LuckySevenIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold7Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="30%" stopColor="#f4d03f" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id="fire7Grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="glow7" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Background Aura */}
      <circle cx="50" cy="50" r="44" fill="url(#fire7Grad)" opacity="0.25" filter="url(#glow7)" />
      <circle cx="50" cy="50" r="40" stroke="url(#gold7Grad)" strokeWidth="2" strokeDasharray="4 2" />
      {/* 3D 7 Shape */}
      <path
        d="M 24 24 L 76 24 L 76 34 L 46 76 L 32 76 L 58 36 L 24 36 Z"
        fill="#5a4509"
        transform="translate(2, 2)"
      />
      <path
        d="M 24 24 L 76 24 L 76 34 L 46 76 L 32 76 L 58 36 L 24 36 Z"
        fill="url(#gold7Grad)"
        stroke="#ffffff"
        strokeWidth="1.2"
        filter="url(#glow7)"
      />
      {/* Inner highlight */}
      <path d="M 28 27 L 72 27 L 72 31 L 30 31 Z" fill="#ffffff" opacity="0.8" />
      <path d="M 52 38 L 68 31 L 42 70 L 38 70 Z" fill="#fff5b8" opacity="0.6" />
    </svg>
  );
}

export function DiamondIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="80%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="diamondGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <polygon points="50,15 85,38 50,85 15,38" fill="#0c4a6e" transform="translate(0, 3)" />
      {/* Main facets */}
      <polygon points="50,15 85,38 50,85 15,38" fill="url(#diamondBlue)" stroke="#e0f2fe" strokeWidth="1.5" filter="url(#diamondGlow)" />
      {/* Top crown */}
      <polygon points="32,38 50,15 68,38" fill="#bae6fd" opacity="0.9" />
      <polygon points="15,38 32,38 50,15" fill="#7dd3fc" opacity="0.75" />
      <polygon points="68,38 85,38 50,15" fill="#38bdf8" opacity="0.75" />
      {/* Lower pavilion */}
      <polygon points="32,38 68,38 50,85" fill="#0284c7" opacity="0.9" />
      <polygon points="15,38 32,38 50,85" fill="#0369a1" opacity="0.8" />
      <polygon points="68,38 85,38 50,85" fill="#075985" opacity="0.8" />
      {/* Specular sparkle */}
      <polygon points="50,22 53,28 59,30 53,32 50,38 47,32 41,30 47,28" fill="#ffffff" />
    </svg>
  );
}

export function StarIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <polygon
        points="50,10 62,35 88,38 68,57 73,84 50,71 27,84 32,57 12,38 38,35"
        fill="#451a03"
        transform="translate(0, 3)"
      />
      <polygon
        points="50,10 62,35 88,38 68,57 73,84 50,71 27,84 32,57 12,38 38,35"
        fill="url(#starGrad)"
        stroke="#fffbeb"
        strokeWidth="1.5"
        filter="url(#starGlow)"
      />
      {/* 3D bevels */}
      <polygon points="50,10 50,71 62,35" fill="#fef3c7" opacity="0.6" />
      <polygon points="50,71 68,57 50,50" fill="#b45309" opacity="0.5" />
      <polygon points="50,10 50,71 38,35" fill="#d97706" opacity="0.6" />
      <circle cx="50" cy="48" r="8" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

export function BellIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="35%" stopColor="#f4d03f" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
      </defs>
      {/* Clapper */}
      <circle cx="50" cy="80" r="9" fill="#854d0e" />
      <circle cx="50" cy="80" r="7" fill="url(#bellGrad)" />
      {/* Bell body */}
      <path
        d="M 50 16 C 36 16 32 36 28 58 C 24 72 16 75 16 75 L 84 75 C 84 75 76 72 72 58 C 68 36 64 16 50 16 Z"
        fill="url(#bellGrad)"
        stroke="#fef08a"
        strokeWidth="1.5"
      />
      {/* Top hanger */}
      <ellipse cx="50" cy="14" rx="8" ry="5" stroke="url(#bellGrad)" strokeWidth="3" fill="none" />
      {/* Surface shine */}
      <path d="M 38 24 C 34 36 32 50 30 68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="50" cy="74" rx="34" ry="4" fill="#a16207" opacity="0.4" />
    </svg>
  );
}

export function BarIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
      </defs>
      {/* Gold Bar Stack */}
      <polygon points="12,38 28,24 88,24 72,38" fill="#fef08a" />
      <polygon points="72,38 88,24 88,62 72,76" fill="#854d0e" />
      <polygon points="12,38 72,38 72,76 12,76" fill="url(#barGold)" stroke="#fef08a" strokeWidth="1.2" />
      <text x="42" y="62" fill="#422006" fontSize="17" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">
        BAR
      </text>
      <text x="42" y="61" fill="#fef9c3" fontSize="17" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">
        BAR
      </text>
    </svg>
  );
}

export function CherryIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cherryRed1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* Stems */}
      <path d="M 68 18 C 55 24 40 38 35 60" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 68 18 C 65 32 64 45 65 62" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 68 18 Q 78 15 82 22 Q 74 26 68 18" fill="#22c55e" />
      {/* Left Cherry */}
      <circle cx="34" cy="66" r="18" fill="url(#cherryRed1)" stroke="#b91c1c" strokeWidth="1" />
      <ellipse cx="28" cy="58" rx="5" ry="3" fill="#ffffff" opacity="0.75" transform="rotate(-30, 28, 58)" />
      {/* Right Cherry */}
      <circle cx="66" cy="68" r="18" fill="url(#cherryRed1)" stroke="#b91c1c" strokeWidth="1" />
      <ellipse cx="60" cy="60" rx="5" ry="3" fill="#ffffff" opacity="0.75" transform="rotate(-30, 60, 60)" />
    </svg>
  );
}

export function LemonIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lemonGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="80%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </radialGradient>
      </defs>
      {/* Leaf */}
      <path d="M 65 24 C 78 16 88 22 84 34 C 72 36 66 30 65 24 Z" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
      {/* Lemon body */}
      <path
        d="M 20 48 C 15 36 28 18 52 24 C 76 30 85 48 80 64 C 75 80 54 86 36 78 C 18 70 15 54 20 48 Z"
        fill="url(#lemonGrad)"
        stroke="#fef08a"
        strokeWidth="1.5"
      />
      {/* Highlights */}
      <ellipse cx="42" cy="40" rx="14" ry="7" fill="#ffffff" opacity="0.55" transform="rotate(-20, 42, 40)" />
    </svg>
  );
}

// Map symbol text to SVG component
export function SlotSymbolIcon({ symbol, className = "w-16 h-16" }: { symbol: string; className?: string }) {
  const norm = symbol.trim().toUpperCase();
  if (norm === "7" || norm === "7️⃣" || norm === "SEVEN") return <LuckySevenIcon className={className} />;
  if (norm === "DIAMOND" || norm === "💎") return <DiamondIcon className={className} />;
  if (norm === "STAR" || norm === "⭐") return <StarIcon className={className} />;
  if (norm === "BELL" || norm === "🔔") return <BellIcon className={className} />;
  if (norm === "BAR" || norm === "🍫") return <BarIcon className={className} />;
  if (norm === "CHERRY" || norm === "🍒") return <CherryIcon className={className} />;
  if (norm === "LEMON" || norm === "🍋") return <LemonIcon className={className} />;
  return <LuckySevenIcon className={className} />;
}

// ==================== COIN FLIP SVG EMBLEMS ====================

export function CrownHeadIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="35%" stopColor="#f4d03f" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>
      {/* Crown base */}
      <polygon points="18,72 82,72 76,40 58,54 50,30 42,54 24,40" fill="url(#crownGold)" stroke="#fef08a" strokeWidth="1.5" />
      <rect x="18" y="72" width="64" height="8" rx="2" fill="url(#crownGold)" stroke="#fef08a" strokeWidth="1" />
      {/* Crown Jewels */}
      <circle cx="50" cy="28" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
      <circle cx="23" cy="38" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
      <circle cx="77" cy="38" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
      <circle cx="50" cy="76" r="2.5" fill="#10b981" />
      <circle cx="34" cy="76" r="2.5" fill="#ef4444" />
      <circle cx="66" cy="76" r="2.5" fill="#ef4444" />
    </svg>
  );
}

export function ArenaTailsIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="40%" stopColor="#f4d03f" />
          <stop offset="80%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Shield Crest */}
      <path
        d="M 50 18 L 80 28 C 80 58 50 82 50 82 C 50 82 20 58 20 28 Z"
        fill="url(#shieldGold)"
        stroke="#fef08a"
        strokeWidth="2"
      />
      {/* 8-Pointed Star Center */}
      <polygon
        points="50,30 54,42 66,42 56,50 60,62 50,54 40,62 44,50 34,42 46,42"
        fill="#ffffff"
      />
    </svg>
  );
}

// ==================== 3D GOLD CASINO CHIP SVG ====================

export function CasinoChipSVG({
  value,
  color = "gold",
  className = "w-10 h-10",
}: {
  value: string | number;
  color?: "gold" | "red" | "black" | "green" | "purple";
  className?: string;
}) {
  const bgColors = {
    gold: { base: "#eab308", dark: "#854d0e", light: "#fef08a", rim: "#ca8a04" },
    red: { base: "#dc2626", dark: "#7f1d1d", light: "#fca5a5", rim: "#991b1b" },
    black: { base: "#27272a", dark: "#09090b", light: "#71717a", rim: "#18181b" },
    green: { base: "#16a34a", dark: "#14532d", light: "#86efac", rim: "#15803d" },
    purple: { base: "#9333ea", dark: "#581c87", light: "#d8b4fe", rim: "#7e22ce" },
  }[color];

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Chip */}
      <circle cx="50" cy="50" r="48" fill={bgColors.rim} stroke={bgColors.light} strokeWidth="2" />
      {/* Edge Stripes (12 stripes) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="2"
          x2="50"
          y2="12"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${i * 30}, 50, 50)`}
        />
      ))}
      {/* Inner Inlay */}
      <circle cx="50" cy="50" r="34" fill={bgColors.base} stroke="#d4af37" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="28" fill={bgColors.dark} stroke={bgColors.light} strokeWidth="1" strokeDasharray="3 2" />
      {/* Value */}
      <text
        x="50"
        y="56"
        fill="#ffffff"
        fontSize="17"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {value}
      </text>
    </svg>
  );
}
