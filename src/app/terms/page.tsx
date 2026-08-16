export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border-b border-line pb-5 text-center">
        <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— LEGAL —</div>
        <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">SYARAT</span><span className="font-serif-italic text-ivory/80"> & Ketentuan</span></h1>
      </div>
      <div className="card-luxe p-8">
        <div className="space-y-4 text-sm leading-relaxed text-ivory/70">
          <p><strong className="text-gold">1. Simulasi Virtual:</strong> Golden Arena adalah platform simulasi kasino dengan koin virtual. Tidak ada uang asli yang dipertaruhkan, ditransfer, atau dijamin pengembaliannya.</p>
          <p><strong className="text-gold">2. Usia Pengguna:</strong> Platform ini hanya untuk pengguna berusia 18 tahun ke atas. Data KTP/NIK digunakan untuk verifikasi identitas simulasi.</p>
          <p><strong className="text-gold">3. Kontrol Owner:</strong> Owner memiliki hak penuh untuk mengatur RTP, saldo, bonus, dan status akun member.</p>
          <p><strong className="text-gold">4. Deposit & Withdraw:</strong> Semua transaksi bersifat manual dan memerlukan persetujuan owner. Proses dapat memakan waktu hingga 1x24 jam.</p>
          <p><strong className="text-gold">5. Keamanan:</strong> Pengguna bertanggung jawab atas kerahasiaan password dan session mereka. Jangan membagikan akun kepada orang lain.</p>
          <p><strong className="text-gold">6. Pemblokiran:</strong> Owner berhak memblokir atau menonaktifkan akun yang melanggar ketentuan atau dicurigai melakukan kecurangan.</p>
          <p><strong className="text-gold">7. Perubahan:</strong> Syarat dan ketentuan dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.</p>
          <p><strong className="text-gold">8. Hiburan:</strong> Platform ini dibuat untuk hiburan dan pembelajaran probabilitas. Gunakan dengan bijak.</p>
        </div>
      </div>
    </div>
  );
}
