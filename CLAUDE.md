# SIPROJAR — Sistem Informasi Profiling Jaringan

> File ini dibaca otomatis oleh Claude Code di awal sesi. Tujuannya supaya
> Claude Code langsung paham posisi proyek ini sekarang dan ke arah mana
> tujuannya, tanpa harus menebak dari isi kode saja.

## 1. Tentang Proyek Ini

Aplikasi web internal untuk **Dinas Komunikasi dan Informatika (Diskominfo)**,
dibuat sebagai proyek PKL. Tujuannya menggantikan pencatatan kondisi jaringan
antar OPD yang selama ini manual di spreadsheet, menjadi sistem yang
terstruktur, punya riwayat, dan bisa menelusuri status penanganan kendala
sampai selesai.

**Diskominfo secara eksplisit meminta ini berupa website saja** — bukan
aplikasi mobile. Jangan sarankan atau asumsikan kebutuhan versi mobile
(Kotlin/Flutter/dsb) kecuali user menyebutkannya ulang.

## 2. Tiga Aktor & Perannya

| Aktor | Siapa | Tugas utama di sistem |
|---|---|---|
| **Admin** | Staf Diskominfo | Kelola master data OPD & user, verifikasi data profiling, memilah & meneruskan tiket ke pihak ketiga atau menangani internal, verifikasi hasil penanganan, generate laporan rekap |
| **OPD** | Staf TI tiap perangkat daerah | Isi/update data profiling jaringan (device, aplikasi, speed test, kendala), ajukan tiket pengaduan, pantau status tiket, lihat riwayat |
| **Pihak Ketiga** | Vendor ISP / vendor perangkat | Terima tiket yang diteruskan admin, tangani di lapangan, update status, unggah bukti penanganan (wajib saat status "selesai") |

## 3. Keputusan Arsitektur (Sudah Final, Jangan Diubah Tanpa Konfirmasi)

- **Backend:** Laravel, berperan sebagai **API murni** (bukan Blade), sudah
  tersambung ke database MySQL
- **Frontend:** **React terpisah** dari desain milik teman satu tim, sudah
  disambungkan ke tampilan awal dengan bantuan GitHub Copilot. Desain akan
  terus disempurnakan seiring waktu — jangan asumsikan desain final
- **Autentikasi:** rencana memakai **Laravel Sanctum** (token-based), karena
  React berjalan terpisah dari Laravel — bukan session-based auth biasa
- **Database:** MySQL, nama database `siprojar`, skema lengkap ada di
  `schema-siprojar.sql` (11 tabel: `opd`, `users`, `pihak_ketiga`,
  `koneksi_internet`, `data_profiling`, `aplikasi_digunakan`, `speed_test`,
  `kendala`, `solusi`, `tiket`, `riwayat_tiket`)
- Satu tabel `users` untuk ketiga role, dibedakan lewat kolom `role`
  (`admin` / `opd` / `pihak_ketiga`), dengan foreign key opsional ke
  `opd_id` atau `pihak_ketiga_id` sesuai role

## 4. Alur Bisnis Inti (Ringkas)

```
OPD isi data profiling (device, aplikasi, speed test, kendala)
    → Admin verifikasi data
        → jika ada kendala: OPD ajukan tiket
            → Admin memilah: tangani internal ATAU teruskan ke pihak ketiga
                → Pihak Ketiga tangani & wajib unggah bukti saat status "selesai"
                    → Admin verifikasi hasil penanganan → tiket ditutup
    → Admin generate laporan & dashboard rekap dari seluruh data
```

**Kosakata status yang WAJIB konsisten di seluruh kode (jangan ganti istilah):**

| Objek | Nilai status yang sah |
|---|---|
| `data_profiling.status_verifikasi` | `draft` · `diajukan` · `diverifikasi` · `dikembalikan` |
| `tiket.status` | `baru` · `diteruskan` · `proses` · `menunggu_verifikasi` · `selesai` · `ditolak` |
| `speed_test.hasil` | `sesuai` · `tidak_sesuai` |
| `users.status` | `aktif` · `nonaktif` |

## 5. Sudah Dikerjakan (Status Saat Ini)

- [x] Analisis kebutuhan & alur bisnis 3 aktor
- [x] ERD lengkap (11 tabel, lihat `schema-siprojar.sql`)
- [x] Use case diagram + tabel deskripsi use case (14 use case)
- [x] Activity diagram untuk 3 alur utama (profiling-verifikasi, tiket,
      login-role)
- [x] PRD UI (`PRD-UI-Profiling-Jaringan-Stitch.md`) berisi design system dan
      prompt per layar, dipakai untuk generate desain di Google Stitch
- [x] Database `siprojar` sudah dibuat dan berjalan
- [x] Laravel sudah disambungkan ke database
- [x] React (desain dari teman) sudah tersambung dan **tampil di web**,
      meski masih pakai kemungkinan data dummy/belum full terhubung API
- [ ] Setup Laravel Sanctum untuk autentikasi API — **belum**
- [ ] CORS Laravel untuk mengizinkan request dari React — **perlu dicek/belum**
- [ ] Endpoint API per modul (OPD, User, Profiling, Kendala, Tiket, Laporan) —
      **belum**
- [ ] Sambungkan komponen React ke endpoint API asli (ganti dummy data) —
      **belum**

## 6. Urutan Pengerjaan Modul Selanjutnya (Jangan Dilompat)

1. Autentikasi: setup Sanctum → endpoint login → middleware role → sambungkan
   form login React
2. Master Data (Admin): CRUD OPD, User, Pihak Ketiga, Koneksi Internet
3. Profiling (OPD): form isi/update data profiling, aplikasi, speed test,
   kendala
4. Verifikasi (Admin): daftar pengajuan, aksi setujui/kembalikan
5. Tiket: ajukan (OPD) → teruskan (Admin) → tangani & upload bukti (Pihak
   Ketiga) → verifikasi hasil (Admin)
6. Laporan & Dashboard: rekap, grafik, export Excel/PDF

**Prinsip kerja:** selesaikan satu modul sampai benar-benar berfungsi
end-to-end (backend + frontend + teruji ketiga role) sebelum pindah ke modul
berikutnya.

## 7. Referensi File Pendukung di Proyek Ini

Kalau file-file berikut ada di repo, baca untuk detail lengkap sebelum
mengerjakan bagian terkait:
- `schema-siprojar.sql` — struktur database lengkap dengan constraint
- `PRD-UI-Profiling-Jaringan-Stitch.md` — design system (warna, tipografi),
  daftar 20 layar, dan detail tiap layar
- `LAPORAN_PROFILING_DISKOMINFO_KAB_MALANG_2025.xlsx` — data asli sebagai
  acuan format laporan & contoh data seeder

## 8. WAJIB Dilakukan Lebih Dulu di Setiap Sesi Baru

**Jangan langsung percaya isi bagian 5 (Sudah Dikerjakan) di atas begitu saja
— itu ringkasan dari ingatan user, bukan hasil pengecekan langsung ke kode.**
User sendiri tidak yakin persis struktur foldernya, jadi sebelum mengerjakan
apa pun, lakukan pengecekan berikut dan **laporkan hasilnya ke user dulu**
sebelum lanjut ke instruksi apa pun:

1. **Cek struktur folder dari root tempat sesi ini dibuka.** Apakah ada satu
   folder berisi Laravel (ditandai `artisan`, `composer.json`) dan folder lain
   berisi React (ditandai `package.json` dengan dependency react) di level yang
   sama (dua proyek terpisah)? Atau Laravel dan React ada bersarang (misal
   React di dalam `resources/js` gaya Inertia, atau folder React ada di dalam
   folder Laravel)? Atau sebaliknya, folder yang dibuka cuma salah satu dari
   keduanya?
2. **Cek apakah Sanctum sudah terpasang** (lihat `composer.json` Laravel untuk
   `laravel/sanctum`, dan cek `config/sanctum.php` ada atau tidak).
3. **Cek apakah CORS sudah dikonfigurasi** (`config/cors.php`) dan mengizinkan
   origin dari React.
4. **Cek route API yang sudah ada** (`routes/api.php`) — bandingkan dengan
   daftar modul di bagian 6, mana yang sudah ada endpoint-nya dan mana yang
   belum.
5. **Cek di sisi React** apakah sudah ada pemanggilan API sungguhan (fetch/axios
   ke Laravel), atau komponennya masih memakai data statis/dummy.
6. **Cek migration Laravel** — apakah sudah dibuat sesuai `schema-siprojar.sql`,
   atau database masih terhubung ke tabel yang dibuat manual lewat SQL saja.

Setelah pengecekan ini, **tuliskan ringkasan temuan ke user** (struktur folder
sebenarnya, apa yang sudah ada, apa yang belum) sebelum mulai membuatkan atau
mengubah kode apa pun. Kalau ternyata bertentangan dengan bagian 5 di atas,
anggap hasil pengecekan langsung ke kode sebagai yang benar, dan beri tahu user
letak perbedaannya.

## 9. Catatan Lain untuk Claude Code

- Proyek ini untuk laporan PKL — kalau membuat keputusan desain/arsitektur
  yang menyimpang dari yang tercantum di sini, jelaskan alasannya ke user,
  jangan diam-diam mengubah.
- Semua label antarmuka dan pesan ke pengguna berbahasa Indonesia.
- User sedang belajar (PKL), jadi saat membuatkan kode, sertakan penjelasan
  singkat kenapa suatu pendekatan dipilih — bukan cuma kode jadi.
