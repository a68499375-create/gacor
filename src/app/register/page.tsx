"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction, loginAction } from "@/app/actions";
import { passwordStrength } from "@/lib/security-client";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "personal" | "address" | "security">("account");
  const [form, setForm] = useState({
    username: "", password: "", confirmPassword: "", email: "", phone: "", fullName: "", birthDate: "",
    nik: "", address: "", city: "", province: "", postalCode: "", securityQuestion: "Nama ibu kandung Anda?",
    securityAnswer: "", referralCode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) { setForm((f) => ({ ...f, [key]: value })); }

  async function submit() {
    if (form.password !== form.confirmPassword) return setError("Password tidak cocok.");
    setBusy(true);
    setError("");
    try {
      await registerAction(form);
      await loginAction(form.username, form.password);
      router.push("/");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const strength = passwordStrength(form.password);
  const steps = [
    { key: "account", label: "Akun", fields: (
      <>
        <Input label="Username" value={form.username} onChange={(v) => update("username", v)} placeholder="min 5 karakter, huruf/angka/_" />
        <Input label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
        <Input label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} />
        <Input label="Konfirmasi Password" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} />
        <div className="h-1.5 w-full bg-ink-3"><div className="h-full transition-all" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.score < 2 ? "#c0262d" : strength.score < 4 ? "#d4af37" : "#0f9b58" }} /></div>
        <div className="text-[10px] text-ivory/50">Kekuatan: <span className={strength.score < 2 ? "text-wine-light" : strength.score < 4 ? "text-gold" : "text-felt"}>{strength.label}</span></div>
      </>
    )},
    { key: "personal", label: "Pribadi", fields: (
      <>
        <Input label="Nama Lengkap" value={form.fullName} onChange={(v) => update("fullName", v)} />
        <Input label="Nomor Telepon" value={form.phone} onChange={(v) => update("phone", v)} placeholder="08xxxxxxxxxx" />
        <Input label="Tanggal Lahir" type="date" value={form.birthDate} onChange={(v) => update("birthDate", v)} />
        <Input label="NIK / Nomor KTP" value={form.nik} onChange={(v) => update("nik", v)} placeholder="3175xxxxxxxxxxxx" />
      </>
    )},
    { key: "address", label: "Alamat", fields: (
      <>
        <TextArea label="Alamat Lengkap" value={form.address} onChange={(v) => update("address", v)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Kota" value={form.city} onChange={(v) => update("city", v)} />
          <Input label="Provinsi" value={form.province} onChange={(v) => update("province", v)} />
          <Input label="Kode Pos" value={form.postalCode} onChange={(v) => update("postalCode", v)} />
        </div>
      </>
    )},
    { key: "security", label: "Keamanan", fields: (
      <>
        <Select label="Pertanyaan Keamanan" value={form.securityQuestion} onChange={(v) => update("securityQuestion", v)} options={["Nama ibu kandung Anda?","Nama sekolah SD Anda?","Merek mobil pertama Anda?","Kota lahir Anda?","Nama hewan peliharaan masa kecil?"]} />
        <Input label="Jawaban Keamanan" value={form.securityAnswer} onChange={(v) => update("securityAnswer", v)} />
        <Input label="Kode Referral (opsional)" value={form.referralCode} onChange={(v) => update("referralCode", v.toUpperCase())} placeholder="ABCDEF12" />
      </>
    )},
  ] as const;
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-luxe ornament p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="font-display text-[10px] tracking-[0.4em] text-gold-deep">— NEW MEMBER —</div>
          <h1 className="mt-2 font-display text-4xl"><span className="text-gold-metal">DAFTAR</span><span className="font-serif-italic text-ivory/80"> Akun</span></h1>
          <p className="mt-2 text-sm text-ivory/50">Lengkapi data seperti pendaftaran platform resmi.</p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center">
              <div className={`flex h-8 w-8 items-center justify-center border font-display text-xs ${step === s.key ? "border-gold bg-gold text-wine-deep" : i < currentIndex ? "border-gold bg-gold/20 text-gold" : "border-line-2 bg-ink-3 text-ivory/40"}`}>{i + 1}</div>
              <span className={`ml-2 hidden font-display text-[10px] tracking-widest md:block ${step === s.key ? "text-gold" : "text-ivory/40"}`}>{s.label.toUpperCase()}</span>
              {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-line-2" />}
            </div>
          ))}
        </div>

        <div className="space-y-4">{steps[currentIndex].fields}</div>
        {error && <div className="mt-5 border border-wine bg-wine-deep/20 p-3 text-center text-sm text-wine-light">{error}</div>}
        <div className="mt-8 flex items-center justify-between">
          {currentIndex > 0 ? <button onClick={() => setStep(steps[currentIndex - 1].key as any)} className="btn-ghost text-[10px]">← Kembali</button> : <div />}
          {currentIndex < steps.length - 1 ? <button onClick={() => setStep(steps[currentIndex + 1].key as any)} className="btn-luxe">Lanjut →</button> : <button onClick={submit} disabled={busy} className="btn-luxe">{busy ? "Mendaftar..." : "Daftar Sekarang"}</button>}
        </div>
        <div className="mt-6 text-center text-xs text-ivory/40">Sudah punya akun? <a href="/login" className="text-gold underline">Login di sini</a></div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">{label.toUpperCase()}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none transition focus:border-gold" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="block"><span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">{label.toUpperCase()}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none transition focus:border-gold" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-[10px] tracking-[0.3em] text-gold-deep">{label.toUpperCase()}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-line-2 bg-ink-3 px-4 py-3 text-sm text-ivory outline-none transition focus:border-gold">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
