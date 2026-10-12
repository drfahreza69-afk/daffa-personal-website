# Daffa Personal Brand

Website personal branding mandiri dengan intro sinematik, profil publik, login admin username/password, dashboard, biodata, karier, kemampuan, visi, roadmap, prinsip hidup, galeri, kontak, dan editor profil.

Tidak membutuhkan akun platform eksternal, OAuth, maupun API key. Login memeriksa password di server. Tidak menggunakan login palsu atau pemeriksaan password di browser.

## Persyaratan

- Node.js versi 22.13 atau lebih baru.
- npm.
- Komputer atau server dengan folder penyimpanan permanen.

## Menjalankan website

Ekstrak ZIP. Buka terminal di folder `daffa-standalone`, lalu jalankan:

```bash
npm install
npm run setup
npm run dev
```

Buka `http://localhost:3000` di browser.

Pada penggunaan pertama:

1. Klik ENTER MY WORLD.
2. Website bisa langsung dilihat oleh semua orang.
3. Klik Admin login.
4. Buat username dan password minimal 12 karakter.
5. Ulangi password lalu klik CREATE ADMIN ACCESS.

Tidak perlu kunci tambahan. Login berikutnya cukup menggunakan username dan password. Tidak ada password bawaan.

## Mengubah profil

Masuk, lalu klik **Profile editor**. Anda bisa mengubah biodata, alamat email, karier, nilai kemampuan, dan empat foto galeri. Klik Save changes untuk menyimpan.

Foto yang disertakan: pemandangan kantor, ruang meeting, dan sesi bekerja. Foto perjalanan alam belum tersedia dan bisa diunggah melalui editor. Gunakan JPG, PNG, atau WebP maksimal 5 MB.

Tombol Download CV menghasilkan file HTML. Buka file tersebut lalu gunakan Print untuk menyimpan sebagai PDF.

## Produksi dan domain sendiri

Setelah selesai menguji:

```bash
npm run build
npm start
```

Untuk server produksi:

- Set `APP_URL` ke alamat sebenarnya, misalnya `https://domainanda.id`.
- Aktifkan HTTPS lewat reverse proxy atau penyedia hosting.
- Arahkan domain sendiri ke server Anda.
- Set `DATA_DIR` ke folder permanen, misalnya `/var/lib/daffa`.
- Pasang pembatasan ukuran request 6 MB pada reverse proxy.
- Cadangkan seluruh folder DATA_DIR, termasuk file SQLite, WAL/SHM, dan uploads. Untuk backup konsisten, hentikan aplikasi sementara atau gunakan backup SQLite yang benar.
- Jangan unggah `.env.local`, DATA_DIR, database, atau folder uploads ke repositori publik.

Aplikasi memakai Node.js dan SQLite lokal. Hosting statis tidak menjalankan backend. Jika memakai platform serverless dengan filesystem sementara, sesuaikan penyimpanan database dan foto terlebih dahulu.

## Struktur kode

- `app/identity.tsx`: tampilan dan interaksi seluruh website.
- `app/globals.css`: desain, animasi, dan tampilan responsif.
- `app/animation.tsx`: Web Animations dan dukungan reduced motion.
- `app/default-profile.ts`: data awal profil di server.
- `app/data.ts`: tipe data, pratinjau intro, dan visi.
- `app/security.ts`: hash password, cookie sesi, pemeriksaan akses dan origin.
- `app/storage.ts`: database SQLite permanen.
- `app/api/`: login, profil, unggah foto, galeri pribadi, dan asisten profil.
- `public/photos/`: foto untuk intro dan galeri awal.
- `scripts/setup.mjs`: konfigurasi awal lokal.
- `tests/security.test.cjs`: pengujian autentikasi dan penyimpanan.

## Fitur akses

Password menggunakan PBKDF2-SHA256 dengan salt acak. Token sesi di-hash sebelum disimpan di database. Cookie menggunakan HttpOnly dan SameSite=Strict; flag Secure aktif jika APP_URL memakai HTTPS. Lima percobaan password salah menyebabkan pembatasan akses selama 15 menit. Sesi berlaku delapan jam. Logout mencabut token sesi.

Website profil bisa dilihat publik. Endpoint pengubahan profil dan unggahan tetap memerlukan sesi admin yang valid.

## Asisten profil dan animasi

Ask Daffa AI adalah asisten berbasis pengetahuan profil dengan pencocokan topik. Fitur ini menjawab profil, pengalaman, kemampuan, tujuan, prinsip, dan kontak dari data yang tersimpan. Belum menggunakan model generatif.

Animasi menggunakan CSS, Canvas, dan Web Animations. Tidak memasukkan Framer Motion, GSAP, atau Three.js. React, Next.js, Tailwind CSS, dan Lucide menangani tampilan serta aplikasi.

Roadmap 2026–2035 menunjukkan rencana. Persentase kemampuan menunjukkan penilaian diri. Usia 24 tahun mengikuti data yang diberikan dan dapat diperbarui lewat editor.

## Pemeriksaan

```bash
npm run typecheck
npm test
npm run build
npm run test:integration
```

Halaman memakai noindex karena dashboard memuat biodata pribadi. Untuk personal branding yang dapat ditemukan mesin pencari, buat halaman publik terpisah dengan informasi yang memang ingin dipublikasikan.
