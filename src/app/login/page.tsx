"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginAction(username, password);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card-luxe ornament p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 rotate-45 items-center justify-center border-2 border-gold bg-gradient-to-br from-wine-deep via-wine to-wine-deep shadow-xl">
            <div className="-rotate-45 font-display text-3xl text-gold">M</div>
          </div>
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— MEMBER ACCESS —</div>
          <h1 className="mt-2 font-display text-3xl"><span className="text-gold-metal">LOGIN</span><span className="font-serif-italic text-ivory/80"> Member</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Masukkan username dan kata sandi Anda.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">USERNAME</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">PASSWORD</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
          </label>
          {error && <div className="border border-wine bg-wine-deep/20 p-3 text-center text-sm text-wine-light">{error}</div>}
          <button type="submit" disabled={busy} className="btn-luxe w-full">{busy ? "Memuat..." : "Masuk"}</button>
        </form>

        <div className="mt-6 text-center text-xs text-ivory/40">
          Belum punya akun? <a href="/register" className="text-gold underline">Daftar sekarang</a>
        </div>
      </div>
    </div>
  );
}
