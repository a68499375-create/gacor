"use client";

import { useState } from "react";
import { showToast } from "@/components/toast";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !message) return;
    showToast("Tiket support telah dikirim. Tim kami akan menghubungi Anda.", "success");
    setSubject("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-luxe ornament p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— SUPPORT —</div>
          <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">HUBUNGI</span><span className="font-serif-italic text-ivory/80"> Kami</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Ada kendala? Kirim tiket support dan tim owner akan membantu.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="border border-line-2 bg-ink-3 p-4 text-center">
            <div className="font-display text-[10px] tracking-[0.3em] text-gold">EMAIL</div>
            <div className="mt-1 text-sm text-ivory">support@goldenarena.local</div>
          </div>
          <div className="border border-line-2 bg-ink-3 p-4 text-center">
            <div className="font-display text-[10px] tracking-[0.3em] text-gold">TELEGRAM</div>
            <div className="mt-1 text-sm text-ivory">@goldenarena_support</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">SUBJEK</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">PESAN</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
          </label>
          <button type="submit" className="btn-luxe w-full">Kirim Tiket</button>
        </form>
      </div>
    </div>
  );
}
