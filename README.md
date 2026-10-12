# Daffa Digital Headquarters — GitHub & Railway

Website personal branding putih, platinum, dan emas milik Daffa Rifki Fahreza. Server Next.js asli pada Node.js 24. Database SQLite dan file unggahan disimpan pada Railway Volume.

8 halaman publik: Home, Profile, Career, Vision, Principles, Gallery, Legacy, Contact.
8 tab admin: Overview, Missions, Habits, 92D Tracker, Finance, Analytics, Editor, Settings.
Semua 14 foto asli disertakan: 3 Daffa dan 11 kekasih. Perusahaan: PT Nexwave, Nokia, Huawei, DHL. Seluruh 10 kutipan mentalitas tetap ada.

Pengunjung langsung melihat profil. Login admin hanya Nama dan Password. Tidak ada activation key, setup key, email login, atau pendaftaran tambahan.

## 1. Unggah ke GitHub

1. Ekstrak `Daffa-Headquarters-Railway.zip`.
2. Buka folder `daffa-railway` hasil ekstraksi.
3. Buat repository GitHub **Private**, atau gunakan repo website Anda yang lama.
4. Unggah **isi di dalam folder** itu. Pada halaman utama repo harus langsung terlihat `package.json`, `Dockerfile`, `railway.json`, folder `app`, folder `components`, folder `lib`, dan folder `public`.
5. Klik Commit changes.

Jika memakai repo lama, gunakan paket baru ini sebagai pengganti kode lama. Jangan mencampurkan file backend lama ke paket baru. Simpan backup repo lama sebelum mengganti kode. Repo Private menjaga catatan awal tracker yang ikut disertakan pada source.

Anda tidak perlu membuat akun GitHub atau Railway baru jika sudah punya.

## 2. Hubungkan Railway

Untuk service yang sudah ada: buka project Railway → klik kotak service website → Settings → Source → pilih repository ini dan branch yang benar.

Untuk service baru: New Project → Deploy from GitHub repo → pilih repository ini.

Root Directory menggunakan root repo `/` karena `package.json` dan `Dockerfile` langsung berada di sana.
Railway memakai `Dockerfile` dan `railway.json` yang sudah disertakan. Kosongkan Custom Build Command serta Custom Start Command dari pengaturan lama agar Dockerfile yang menjalankan build dan server.

## 3. Atur admin pada Variables

Klik **service website di Railway**, lalu tab **Variables**. Tambahkan:

| Nama variabel | Nilai |
| --- | --- |
| `ADMIN_NAME` | `daffa` |
| `ADMIN_PASSWORD` | Password pilihan Anda, 12–128 karakter |

Password tidak disertakan dalam ZIP. Isi langsung di Railway. Jangan menaruh password pada file source yang diunggah ke GitHub.

Tidak ada variabel activation/setup key yang dibaca oleh kode ini. Anda boleh menghapus variabel aktivasi lama. `PORT`, `HOSTNAME`, dan `DATA_DIR` sudah ditangani konfigurasi server/Docker; tidak perlu ditambahkan manual untuk langkah normal ini.

Penting: variabel admin membuat akun **saat database masih baru**. Setelah akun terbentuk, ubah password melalui **Admin → Settings → Ubah Password**. Mengubah `ADMIN_PASSWORD` pada Variables tidak menimpa password yang sudah tersimpan. Ini menjaga akun saat redeploy.

## 4. Pasang Volume

Tambahkan **Volume** di project Railway dan hubungkan ke **service website yang sama**. Anda dapat memakai menu klik kanan pada canvas project atau Command Palette untuk membuat Volume.

Isi **Mount Path** persis:

```text
/data
```

Dockerfile mengatur `DATA_DIR=/data`. Database, sesi, tracker, pengaturan, dan file upload ditulis ke folder itu. Gunakan satu replica service untuk SQLite.

Pasang Volume sebelum mulai mengubah data. Tanpa Volume, data yang dibuat pada container dapat hilang saat redeploy. Jangan hapus Volume jika ingin mempertahankan data.

## 5. Deploy dan ambil link

1. Terapkan perubahan Variables/Volume lalu deploy atau redeploy service website.
2. Tunggu deployment berstatus berhasil. Healthcheck menggunakan `/api/health`.
3. Buka Settings → Networking/Public Networking → Generate Domain.
4. Jika diminta target port, pilih `3000`.
5. Buka domain Railway tersebut. Alamatnya adalah alamat publik, bukan `localhost`.
6. Buka `/admin`, isi Nama `daffa` dan password yang Anda tetapkan pada Variables.

Server mendengarkan `0.0.0.0` dan menggunakan port dari Railway. Domain standar Railway otomatis digunakan untuk pemeriksaan origin dan cookie HTTPS. Jika memakai domain khusus, tambahkan `APP_URL=https://domain-anda` pada Variables dan redeploy; variabel ini hanya perlu untuk domain khusus atau konfigurasi proxy berbeda.

Jika sebelumnya mengisi data tambahan di website yang lain, ekspor Backup JSON dari Settings dan impor pada website Railway. Backup JSON memuat profil dan catatan, bukan byte unggahan baru. Foto awal yang 14 sudah ada di paket; file tambahan perlu diunggah kembali.

## Menjalankan di komputer

Pasang Node.js **24 LTS**. Di terminal dalam folder `daffa-railway`:

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, isi `ADMIN_PASSWORD` dan gunakan `ADMIN_NAME=daffa`, lalu:

```bash
npm run dev
```

Buka `http://localhost:3000`. Data lokal otomatis tersimpan dalam folder `data`. Folder ini, `.env.local`, `node_modules`, dan `.next` tidak ikut diunggah ke GitHub.

Build produksi lokal:

```bash
npm run build
npm start
```

## Server dan keamanan

Password di-hash dengan PBKDF2 SHA-256 dan salt acak; token sesi disimpan sebagai hash. Cookie HttpOnly/SameSite memiliki Secure pada origin HTTPS. Sesi berlaku 8 jam. Lima percobaan salah memicu jeda 15 menit. Logout dan perubahan password mencabut sesi.

Endpoint perubahan data, unggahan, penghapusan, dan perubahan password memerlukan sesi admin serta origin yang sah. File private diperiksa pada setiap permintaan dan tidak ditempatkan di folder publik. SQLite menggunakan transaksi atomik dan nomor revisi untuk mencegah penimpaan data dari dua sesi. Pengubahan nama admin melalui environment setelah akun tercipta tidak didukung oleh UI ini.

Simpan backup Volume untuk database dan file. Backup JSON pada Settings adalah backup isi profil/tracker dan referensi media; file media tetap berada pada Volume. Data dari deployment lain tidak disalin otomatis oleh ZIP.

## Pengujian yang sudah dilakukan

- TypeScript dan build Next.js produksi lulus.
- Respons kesembilan halaman serta file JavaScript diperiksa.
- Seluruh 14 foto diperiksa dari server.
- Login Nama/Password, penolakan akses anonim, origin, konflik revisi, upload/delete, foto private, perubahan password, dan logout lulus.
- Profil, akun, dan file upload tetap tersedia setelah restart server.

Jalankan ulang pengujian backend sesudah build:

```bash
npm run test:integration
```

Pengujian dilakukan pada server Node.js lokal. Klik visual di browser, build image Docker, dan deployment di akun Railway Anda belum diuji dalam proses pembuatan paket ini.

## Referensi resmi

- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://docs.railway.com/volumes
- https://docs.railway.com/builds/dockerfiles

