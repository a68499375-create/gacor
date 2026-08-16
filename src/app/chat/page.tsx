"use client";

import { useState, useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import { getChatMessagesAction, sendChatMessageAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ id: number; username: string; message: string; createdAt: Date }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    try { const msgs = await getChatMessagesAction(); setMessages(msgs.reverse()); } catch {}
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    try {
      await sendChatMessageAction(input);
      setInput("");
      await loadMessages();
    } catch (err) {
      alert((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 border-b border-line pb-5">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— COMMUNITY —</div>
        <h1 className="font-display text-4xl"><span className="text-gold-metal">CHAT</span><span className="font-serif-italic text-ivory/80"> Room</span></h1>
      </div>

      <div className="card-luxe flex h-[60vh] flex-col">
        <div className="border-b border-line bg-ink-3 px-4 py-3 font-display text-[10px] tracking-[0.3em] text-gold">GLOBAL CHAT</div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gold-deep/50 bg-ink-3 font-display text-xs text-gold">{m.username[0].toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[10px] tracking-widest text-gold">{m.username}</span>
                  <span className="text-[9px] text-ivory/30">{new Date(m.createdAt).toLocaleTimeString("id-ID")}</span>
                </div>
                <div className="mt-0.5 text-sm text-ivory/80">{m.message}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="border-t border-line p-4">
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." maxLength={500} className="flex-1 border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
            <button type="submit" disabled={busy || !input.trim()} className="btn-luxe">Kirim</button>
          </div>
        </form>
      </div>
    </div>
  );
}
