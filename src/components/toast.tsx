"use client";

import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info";

let toastId = 0;
const listeners: Array<(toast: { id: number; message: string; type: ToastType }) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const id = ++toastId;
  listeners.forEach((l) => l({ id, message, type }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    const handler = (toast: { id: number; message: string; type: ToastType }) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => { const i = listeners.indexOf(handler); if (i >= 0) listeners.splice(i, 1); };
  }, []);

  return (
    <div className="fixed right-4 top-24 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast border-l-4 p-4 shadow-2xl backdrop-blur ${
            t.type === "success" ? "border-felt bg-felt/10" : t.type === "error" ? "border-wine bg-wine-deep/20" : "border-gold bg-ink-3/95"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className={`font-display text-[10px] tracking-[0.3em] ${t.type === "success" ? "text-felt" : t.type === "error" ? "text-wine-light" : "text-gold"}`}>
                {t.type.toUpperCase()}
              </div>
              <div className="mt-1 text-sm text-ivory">{t.message}</div>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-ivory/50 hover:text-gold">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
