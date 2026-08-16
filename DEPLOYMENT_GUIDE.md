# GOLDEN ARENA — PRODUCTION DEPLOYMENT GUIDE

Website Kasino Online VIP dengan Next.js 16 (App Router), Tailwind CSS, Grafis Vektor SVG Murni, dan PostgreSQL.

---

## 🔑 Kredensial Master DEV & Owner

- **URL Admin Panel**: `/admin`
- **Username**: `slotgacor`
- **Password**: `gacortsekali`
- **Role**: `dev` / `owner`
- **Saldo Master**: `10.000.000.000 KOIN` (10 Miliar Koin)
- **Kehokian**: `100% Selalu Menang (Always Win)` — dapat diubah kapan saja di tombol floating `⚡ DEV HUD` pojok kanan bawah.

---

## ☁️ Cara Deploy ke Cloudflare Pages / Vercel / Railway

### 1. Upload ke Cloudflare Pages
1. Hubungkan repository atau upload project ini ke Cloudflare Pages.
2. **Framework Preset**: `Next.js`
3. **Build Command**: `npm run build`
4. **Build Output Directory**: `.next`
5. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
6. **Compatibility Flags**:
   - Di menu **Settings** → **Functions** → **Compatibility Flags** tambahkan: `nodejs_compat`

### 2. Upload ke Vercel (Alternatif Tercepat)
1. Import repository ke [Vercel](https://vercel.com).
2. Di **Environment Variables**, tambahkan:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_BOJ1dnFN8CRE@ep-small-paper-azharwks-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Klik **Deploy** (Otomatis selesai dalam 1 menit).

---

## 🛠️ Menjalankan Lokal

```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.
