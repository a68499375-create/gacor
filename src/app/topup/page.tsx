"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestTopUpAction, getBankAccountsAction } from "@/app/actions";

export default function TopUpPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState("bank");
  const [accountName, setAccountName] = useState("");
  const [reference, setReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof getBankAccountsAction>>>([]);

  useEffect(() => { getBankAccountsAction().then(setBanks); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestTopUpAction({ amount, method, accountName, reference, proofUrl });
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-luxe ornament p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— DEPOSIT —</div>
          <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">TOP UP</span><span className="font-serif-italic text-ivory/80"> Saldo</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Isi formulir di bawah. Owner akan memverifikasi manual.</p>
        </div>

        <div className="mb-6 border border-gold-deep/30 bg-gold/5 p-4 text-xs text-ivory/70">
          <div className="mb-2 font-display text-[10px] tracking-[0.25em] text-gold">REKENING TUJUAN</div>
          <div className="grid gap-2 md:grid-cols-2">
            {banks.length === 0 && <div className="col-span-2 text-ivory/40">Belum ada rekening tujuan. Hubungi owner.</div>}
            {banks.map((b) => (
              <div key={b.id}><span className="text-ivory/50">{b.name}:</span> {b.number} a.n {b.holder}</div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block font-display text-[10px] tracking-[0.3em] text-gold-deep">JUMLAH TOP-UP</label>
            <input type="number" min={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border-2 border-line-2 bg-ink-3 px-4 py-3 font-display text-3xl font-black tabular-nums text-gold outline-none focus:border-gold" />
            <div className="mt-2 flex gap-2">
              {[10000,50000,100000,500000,1000000].map((v) => <button key={v} type="button" onClick={() => setAmount(v)} className="flex-1 border border-line-2 bg-ink-3 py-1.5 font-display text-[10px] font-bold tracking-widest text-ivory/60 hover:border-gold-deep hover:text-gold">{v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}K` : v}</button>)}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[10px] tracking-[0.3em] text-gold-deep">METODE PEMBAYARAN</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["bank","ewallet","qris","crypto"].map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`border py-2 font-display text-[10px] tracking-widest uppercase transition ${method === m ? "border-gold bg-gold/10 text-gold" : "border-line-2 bg-ink-3 text-ivory/50 hover:border-gold-deep"}`}>{m}</button>)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nama Pengirim" value={accountName} onChange={setAccountName} />
            <Input label="Nomor Referensi / ID Transaksi" value={reference} onChange={setReference} />
          </div>

          <Input label="Link Bukti Transfer" value={proofUrl} onChange={setProofUrl} placeholder="https://imgur.com/... atau link Google Drive" />

          {error && <div className="border border-wine bg-wine-deep/20 p-3 text-center text-sm text-wine-light">{error}</div>}
          <button type="submit" disabled={busy} className="btn-luxe w-full">{busy ? "Mengirim..." : "Kirim Permintaan Top-Up"}</button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">{label.toUpperCase()}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
    </label>
  );
}
