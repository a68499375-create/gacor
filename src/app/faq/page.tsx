export const dynamic = "force-dynamic";

const FAQS = [
  { q: "Apakah ini judi online uang asli?", a: "Tidak. Golden Arena adalah simulator kasino dengan koin virtual. Tidak ada uang asli yang dipertaruhkan atau ditransfer secara nyata." },
  { q: "Bagaimana cara mengubah RTP / kehokian?", a: "Login sebagai owner di /admin, masuk tab Permainan, lalu geser slider RTP per game atau gunakan Global Modifier di tab Keamanan." },
  { q: "Bagaimana cara deposit dan withdraw?", a: "Member bisa ajukan deposit/withdraw melalui halaman Deposit dan Withdraw. Owner akan memverifikasi manual." },
  { q: "Apakah hasil permainan bisa dimanipulasi?", a: "Semua hasil dihitung di server menggunakan RTP engine. Client tidak bisa memprediksi atau memanipulasi outcome." },
  { q: "Apakah data saya aman?", a: "Ya. Password di-hash dengan Argon2id, session aman dengan HttpOnly Secure cookie, dan database menggunakan Row Level Security." },
  { q: "Berapa lama proses withdraw?", a: "Withdraw diproses manual oleh owner dalam 1x24 jam setelah diajukan." },
  { q: "Apa itu saldo withdrawable?", a: "Saldo yang bisa ditarik. Terbuka dari hasil bermain sesuai turnover yang ditentukan owner." },
  { q: "Bagaimana cara naik VIP level?", a: "VIP naik otomatis berdasarkan total wagered Anda. Semakin sering bermain, level VIP semakin tinggi." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border-b border-line pb-5 text-center">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— HELP CENTER —</div>
        <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">FREQUENTLY</span><span className="font-serif-italic text-ivory/80"> Asked</span></h1>
      </div>
      {FAQS.map((f, i) => (
        <div key={i} className="card-luxe p-6">
          <div className="mb-2 flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-gold bg-gold/10 font-display text-xs text-gold">{i + 1}</span>
            <h3 className="font-display text-sm tracking-widest text-ivory">{f.q}</h3>
          </div>
          <p className="pl-9 text-sm leading-relaxed text-ivory/60">{f.a}</p>
        </div>
      ))}
    </div>
  );
}
