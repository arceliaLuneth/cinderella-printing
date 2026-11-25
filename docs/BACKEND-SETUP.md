# Backend Cinderella Printing

Backend untuk proposal website UMKM percetakan: Next.js Route Handlers, TypeScript, PostgreSQL di Supabase, Supabase Auth, dan Storage. SQL memakai skema privat `printing`; API tidak mengandalkan data contoh browser.

## Koneksi proyek

1. Gunakan `.env` lokal yang sudah disiapkan. Untuk instalasi baru, salin `.env.example` menjadi `.env`, lalu isi `SUPABASE_PUBLISHABLE_KEY` dengan publishable key dari **Project Settings > API Keys**.
2. Di proyek Supabase `pdbvtgvnivfqywzdoyju`, buka **Connect > Direct connection > Session pooler**. Host, port, dan user sudah diisi pada `DATABASE_URL`. Masukkan password database ke `DATABASE_PASSWORD` (pakai tanda kutip ganda jika password berisi `#`). Jika lupa, reset password database di **Project Settings > Database**; password yang sudah ada tidak dapat dilihat kembali.
3. Di **Project Settings > API Keys > Secret keys**, gunakan tombol **Copy API key** untuk key `default` lalu tempelkan secara lokal ke `SUPABASE_SERVICE_ROLE_KEY` di `.env`. URL proyek dan publishable key sudah diisi; jangan gunakan publishable key sebagai server secret.
4. Biarkan `.env` tetap lokal. Secret key hanya dibaca server dan tidak memakai awalan `NEXT_PUBLIC_`.
5. Jalankan:

```powershell
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run setup:check
npm.cmd run dev
```

Bucket gambar `catalog-images` dan migrasi 001–007 sudah terpasang di proyek Supabase ini. Simpan skema `printing` di luar daftar Exposed schemas. Gunakan file bernomor baru untuk perubahan berikutnya karena migrasi memakai checksum.

Untuk membuat akun admin pertama:

```powershell
npm.cmd run admin:create -- --email admin@contoh.id --name "Admin Cinderella" --role owner
```

Masukkan password saat diminta (input tersembunyi, minimal 12 karakter). Gunakan email dan password ini di `/admin/login`. Untuk akun Supabase Auth yang sudah ada, tambahkan opsi `--user-id UUID_AKUN` dengan email akun tersebut.

Untuk masuk dengan nama pengguna `admin`, gunakan `npm.cmd run admin:create -- --username admin --name "Admin Cinderella"`. Nama pengguna ini memakai alamat internal Supabase Auth. Pemulihan kata sandinya dilakukan lewat dashboard Supabase.

## Sinkronisasi katalog

Tambahkan kategori terlebih dahulu, lalu simpan produk dan fotonya di panel admin. Produk tampil di beranda dan katalog ketika status produk dan kategorinya sama-sama Aktif. Galeri menampilkan produk aktif yang memiliki foto.

Tab beranda, katalog, detail produk, dan galeri yang sedang ditampilkan memeriksa versi katalog setiap 30 detik, ketika tab dibuka kembali, dan setelah admin menyimpan perubahan dari tab lain di browser yang sama. Data terbaru dimuat otomatis saat versi berubah. Formulir konsultasi membaca katalog saat dibuka agar draf pengunjung tetap terjaga.

Gunakan menu **Inspirasi Produk** di admin untuk menambahkan foto galeri dengan judul dan deskripsi sendiri. Pilih **Disembunyikan** untuk menarik foto dari halaman publik.

## Endpoint

`GET /api/v1/openapi.json` menyediakan spesifikasi yang dapat diimpor ke Postman.

- **Publik:** `GET /health`, `/ready`, `/public/company`, `/public/categories`, `/public/products`, `/public/products/{id}`, `/public/catalog-version`.
- **Auth:** `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`.
- **Profil usaha:** `GET/PUT /admin/company`.
- **Katalog dan pelanggan** memakai `GET/POST /admin/categories`, `/admin/products`, dan `/admin/customers` serta `GET/PATCH` berdasarkan ID. Simpan `is_active: false` untuk menonaktifkan data.
- **Pesanan:** `GET/POST /admin/orders`, `GET/PUT /admin/orders/{id}`, `POST /admin/orders/{id}/confirm`, `PATCH /admin/orders/{id}/status`.
- **Pembayaran manual dan DP:** `POST /admin/orders/{id}/payments/verify`. Setiap pembayaran diverifikasi terhadap sisa tagihan; status menjadi `dp` sampai seluruh total diterima.
- **Invoice:** `GET /admin/invoices`, `GET /admin/invoices/{id}`, `GET /admin/invoices/{id}/pdf`.
- **Arsip** memakai `PATCH /admin/orders/{id}/archive` dan `PATCH /admin/invoices/{id}/archive` dengan `archived: true` atau `archived: false`. Filter daftar memakai `?archived=true` untuk arsip atau `?archived=false` untuk daftar utama.
- **Pengiriman invoice** memakai `PATCH /admin/invoices/{id}/delivery` dengan `sent: true` atau `sent: false`.
- **Riwayat revisi invoice** tersedia di `GET /admin/invoices/{id}/revisions`. PDF lama tersedia di `GET /admin/invoices/{id}/revisions/{revisionId}/pdf`.
- **Inspirasi Produk** memakai `GET /public/inspiration` untuk galeri publik serta `GET/POST /admin/inspiration` dan `PUT /admin/inspiration/{id}` untuk pengelolaan foto.
- **Dashboard/laporan:** `GET /admin/dashboard`, `/admin/reports/sales`, `/admin/reports/sales.csv`; `/admin/audit-logs` untuk owner.
- **Unggah gambar:** `POST /admin/uploads` (PNG, JPEG, WebP; maksimum 5 MB).

Panel admin memakai cookie sesi HttpOnly. Klien API lain dapat memakai `Authorization: Bearer <access_token>` dari login. Server memverifikasi token melalui Supabase Auth dan memeriksa bahwa UUID pengguna ada dan aktif pada `printing.admin_users`.

Akun admin aplikasi mengelola isi data melalui panel dan endpoint sesuai fungsi. Akses SQL dan operasi hapus permanen tidak tersedia bagi akun panel. Gunakan status nonaktif untuk katalog dan pelanggan, atau arsip untuk pesanan dan invoice.

## Aturan bisnis dari proposal

Saat mengedit pesanan atau mencatat pembayaran melalui API, kirim `edit_version` dari hasil `GET /admin/orders/{id}` sebagai `expected_version`. Panel mengisinya saat formulir dibuka. Jika menerima HTTP 409, baca ulang pesanan dan saldo sebelum mengirim perubahan berikutnya.

- Pelanggan menghubungi bisnis lewat WhatsApp; API tidak menyediakan checkout, payment gateway, atau form order publik.
- Admin mencatat pesanan dari WhatsApp atau kunjungan langsung. Pesanan menyimpan spesifikasi ukuran, material, finishing, kuantitas, dan harga yang disepakati.
- Status pengerjaan (`baru`, `diproses`, `dikirim`, `selesai`, `dibatalkan`) terpisah dari status pembayaran (`belum_bayar`, `dp`, `lunas`).
- Admin dapat mengonfirmasi pesanan untuk menerbitkan invoice, atau memverifikasi pembayaran manual. Transaksi mengunci pesanan dan menjamin tepat satu invoice per pesanan.
- Pesanan dapat diedit dari halaman penerbitan invoice, detail pesanan, atau detail invoice. Edit pesanan yang sudah ditagih menyimpan PDF sebelumnya ke riwayat dan membuat revisi dengan nomor invoice yang sama. Status pengiriman revisi kembali ke **Belum dikirim**.
- PDF memakai snapshot identitas usaha, pelanggan, item, spesifikasi, dan total. Perubahan data katalog tidak mengubah tagihan yang sudah diterbitkan. Revisi menghitung ulang sisa tagihan dari pembayaran yang sudah tercatat.
- Saat rincian pesanan diperbarui, item lama disimpan dengan waktu penggantian. Penghitungan dan invoice terbaru menggunakan item yang masih berlaku.
- DP dan pembayaran bertahap dicatat sebagai transaksi terpisah, tidak boleh melebihi total invoice, dan status menjadi lunas saat saldo mencapai nol. Payment gateway tidak diimplementasikan.
- Pesanan yang dibatalkan tetap tercatat beserta alasan dan audit trail.

Respons uang dan kuantitas dikembalikan sebagai string agar tidak kehilangan presisi. Endpoint list memakai pagination (`page`, `limit`, maksimum 100). Validasi server menggunakan Zod dan batas permintaan/percobaan autentikasi.

## Perintah harian

```powershell
npm.cmd run setup:check
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run dev
```
