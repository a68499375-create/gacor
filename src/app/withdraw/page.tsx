"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestWithdrawalAction, getMyWithdrawalsAction } from "@/app/actions";

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(100000);
  const [method, setMethod] = useState("bank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getMyWithdrawalsAction>>>([]);

  useEffect(() => { getMyWithdrawalsAction().then(setHistory); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestWithdrawalAction({ amount, method, accountName, accountNumber, bankName: method === "bank" ? bankName : undefined });
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-luxe ornament p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— WITHDRAW —</div>
          <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">PENARIKAN</span><span className="font-serif-italic text-ivory/80"> Dana</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Saldo withdrawable akan dikirim setelah owner menyetujui.</p>
        </div>

        <div className="mb-6 border border-gold-deep/30 bg-gold/5 p-4 text-xs text-ivory/70">
          <div className="mb-2 font-display text-[10px] tracking-[0.25em] text-gold">KETENTUAN</div>
          <ul className="list-inside list-disc space-y-1">
            <li>Minimal withdrawal tergantung pengaturan owner.</li>
            <li>Biaya admin 5% akan dipotong otomatis.</li>
            <li>Saldo withdrawable terbuka dari hasil bermain (turnover 3x).</li>
            <li>Proses manual dalam 1x24 jam.</li>
          </ul>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block font-display text-[10px] tracking-[0.3em] text-gold-deep">JUMLAH WITHDRAWAL</label>
            <input type="number" min={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border-2 border-line-2 bg-ink-3 px-4 py-3 font-display text-3xl font-black tabular-nums text-gold outline-none focus:border-gold" />
            <div className="mt-2 flex gap-2">
              {[50000,100000,500000,1000000,5000000].map((v) => <button key={v} type="button" onClick={() => setAmount(v)} className="flex-1 border border-line-2 bg-ink-3 py-1.5 font-display text-[10px] font-bold tracking-widest text-ivory/60 hover:border-gold-deep hover:text-gold">{v >= 1000000 ? `${v/1000000}M` : `${v/1000}K`}</button>)}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[10px] tracking-[0.3em] text-gold-deep">METODE</label>
            <div className="grid grid-cols-3 gap-2">
              {["bank", "ewallet", "crypto"].map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`border py-2 font-display text-[10px] tracking-widest uppercase transition ${method === m ? "border-gold bg-gold/10 text-gold" : "border-line-2 bg-ink-3 text-ivory/50 hover:border-gold-deep"}`}>{m}</button>)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nama Penerima" value={accountName} onChange={setAccountName} />
            <Input label="Nomor Rekening / Tujuan" value={accountNumber} onChange={setAccountNumber} />
            {method === "bank" && <Input label="Nama Bank" value={bankName} onChange={setBankName} />}
          </div>

          {error && <div className="border border-wine bg-wine-deep/20 p-3 text-center text-sm text-wine-light">{error}</div>}
          <button type="submit" disabled={busy} className="btn-luxe w-full">{busy ? "Mengirim..." : "Ajukan Penarikan"}</button>
        </form>

        {history.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 font-display text-[10px] tracking-[0.3em] text-gold-deep">RIWAYAT WITHDRAWAL</div>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between border border-line-2 bg-ink-3 p-3">
                  <div>
                    <div className="font-display text-sm text-gold">-{h.amount.toLocaleString("id-ID")} KOIN</div>
                    <div className="text-[10px] text-ivory/50 uppercase">{h.method} · {h.accountName}</div>
                  </div>
                  <Status status={h.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">{label.toUpperCase()}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
    </label>
  );
}

function Status({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "border-gold bg-gold/5 text-gold", approved: "border-felt bg-felt/10 text-felt", rejected: "border-wine bg-wine-deep/20 text-wine-light" };
  return <span className={`border px-2 py-0.5 font-display text-[9px] tracking-widest ${map[status] || map.pending}`}>{status.toUpperCase()}</span>;
}
