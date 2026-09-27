# Fase 4 - Pengujian SIPROJAR

Dokumen ini menjadi template lampiran Bab Implementasi dan Pengujian. Kolom **Hasil aktual** diisi setelah skenario dijalankan oleh penguji pada environment yang ditentukan.

## 1. Black-box testing

| No | Skenario | Input | Hasil yang diharapkan | Hasil aktual | Kesimpulan |
|---:|---|---|---|---|---|
| 1 | Login sebagai Admin | Email dan password Admin valid | Berhasil login dan masuk dashboard Admin | Diisi saat uji lapangan | Valid / Tidak valid |
| 2 | Login sebagai OPD | Email dan password OPD valid | Berhasil login dan masuk dashboard OPD | Diisi saat uji lapangan | Valid / Tidak valid |
| 3 | Login sebagai Pihak Ketiga | Email dan password vendor valid | Berhasil login dan masuk dashboard vendor | Diisi saat uji lapangan | Valid / Tidak valid |
| 4 | Login dengan password salah | Email benar, password salah | Login ditolak dan pesan kesalahan tampil | Diisi saat uji lapangan | Valid / Tidak valid |
| 5 | Tambah OPD | Nama, alamat, jumlah pegawai valid | Data OPD tersimpan dan tampil di daftar | Diisi saat uji lapangan | Valid / Tidak valid |
| 6 | Edit OPD | Perubahan data OPD valid | Data OPD diperbarui | Diisi saat uji lapangan | Valid / Tidak valid |
| 7 | Hapus OPD | Pilih satu OPD lalu konfirmasi | Data OPD terhapus sesuai aturan relasi | Diisi saat uji lapangan | Valid / Tidak valid |
| 8 | Tambah OPD dengan field wajib kosong | Payload tanpa nama dan jumlah pegawai | Form ditolak dan validasi field tampil | Diisi saat uji lapangan | Valid / Tidak valid |
| 9 | Isi profiling | Periode dan jumlah device valid, lalu simpan | Profiling tersimpan berstatus `draft` | Diisi saat uji lapangan | Valid / Tidak valid |
| 10 | Profiling dengan field wajib kosong | Periode/jumlah device kosong | Simpan ditolak dan pesan validasi tampil | Diisi saat uji lapangan | Valid / Tidak valid |
| 11 | Ajukan profiling | Profiling berstatus `draft` | Status berubah menjadi `diajukan` | Diisi saat uji lapangan | Valid / Tidak valid |
| 12 | Verifikasi profiling oleh Admin | Profiling berstatus `diajukan` | Status berubah menjadi `diverifikasi` | Diisi saat uji lapangan | Valid / Tidak valid |
| 13 | Kembalikan profiling | Catatan revisi diisi Admin | Status berubah menjadi `dikembalikan` dan catatan tersimpan | Diisi saat uji lapangan | Valid / Tidak valid |
| 14 | Ajukan tiket | Kendala dari profiling terverifikasi dan urgensi dipilih | Tiket dibuat berstatus `baru` | Diisi saat uji lapangan | Valid / Tidak valid |
| 15 | Ajukan tiket ganda | Kendala yang sama diajukan dua kali | Pengajuan kedua ditolak oleh constraint unique | Diisi saat uji lapangan | Valid / Tidak valid |
| 16 | Teruskan tiket ke vendor | Admin memilih vendor | Status berubah menjadi `diteruskan` dan vendor tersimpan | Diisi saat uji lapangan | Valid / Tidak valid |
| 17 | Tangani tiket internal | Admin memilih penanganan internal | Status berubah menjadi `proses` | Diisi saat uji lapangan | Valid / Tidak valid |
| 18 | Vendor mulai menangani tiket | Vendor terkait mengubah status | Status berubah menjadi `proses` | Diisi saat uji lapangan | Valid / Tidak valid |
| 19 | Vendor mengirim hasil tanpa bukti | Status `menunggu_verifikasi`, file kosong | Pengajuan ditolak karena bukti wajib | Diisi saat uji lapangan | Valid / Tidak valid |
| 20 | Upload bukti format salah | File selain format yang diizinkan | Upload ditolak dengan pesan validasi | Diisi saat uji lapangan | Valid / Tidak valid |
| 21 | Admin menyetujui hasil tiket | Tiket selesai dan bukti tersedia | Tiket berubah menjadi `selesai`/ditutup | Diisi saat uji lapangan | Valid / Tidak valid |
| 22 | Admin mengembalikan hasil tiket | Catatan revisi diisi | Status kembali ke `proses` dan catatan tersimpan | Diisi saat uji lapangan | Valid / Tidak valid |
| 23 | Halaman laporan | Admin membuka `/admin/laporan` | Ringkasan laporan tampil | Diisi saat uji lapangan | Valid / Tidak valid |
| 24 | Export laporan | Pilih periode/OPD lalu klik Excel/PDF | File laporan terunduh dan isi sesuai filter | Belum dapat diuji: endpoint export belum terdaftar | Belum tersedia |

## 2. Pembatasan akses antar role

Middleware `CheckRole` diimplementasikan dengan respons HTTP **403 Forbidden**. Uji URL langsung berikut setelah login sebagai role pada kolom pertama:

| Role login | URL yang dicoba | Hasil yang diharapkan |
|---|---|---|
| OPD | `/admin/laporan` | 403 Forbidden |
| OPD | `/admin/opd` | 403 Forbidden |
| Pihak Ketiga | `/admin/laporan` | 403 Forbidden |
| Pihak Ketiga | `/opd/dashboard` | 403 Forbidden |
| Admin | `/opd/dashboard` | 403 Forbidden |
| Admin | `/vendor/dashboard` | 403 Forbidden |

Pengujian otomatis untuk matriks ini tersedia di `tests/Feature/Phase4AccessAndValidationTest.php`.

## 3. Skenario alternatif dan edge case

| No | Skenario | Hasil yang harus dicatat |
|---:|---|---|
| 1 | Submit OPD/profiling dengan field wajib kosong | Validasi server menolak request |
| 2 | Jumlah device berupa teks atau angka negatif | Validasi integer/minimum menolak request |
| 3 | Profiling dengan periode OPD yang sama | Constraint unique `opd_id + periode` menolak duplikasi |
| 4 | Tiket untuk kendala yang sudah memiliki tiket | Constraint unique `kendala_id` menolak tiket kedua |
| 5 | Bukti tiket berformat salah | Harus ditolak whitelist MIME/extension |
| 6 | Vendor mengirim status selesai tanpa bukti | Request ditolak, tiket tidak menjadi selesai |
| 7 | Admin mengembalikan hasil penanganan | Status harus kembali ke `proses` |
| 8 | User mencoba melihat tiket milik OPD/vendor lain | Respons 403 |

## 4. User Acceptance Test (UAT)

UAT dilakukan oleh pembimbing lapangan atau 1-2 staf Diskominfo, bukan hanya pengembang.

| No | Skenario nyata | Penguji | Waktu | Hasil/masukan apa adanya | Tindak lanjut |
|---:|---|---|---|---|---|
| 1 | Admin memeriksa profiling Dinas Kesehatan | Diisi | Diisi | Diisi | Diisi |
| 2 | Admin meneruskan tiket ke vendor | Diisi | Diisi | Diisi | Diisi |
| 3 | Staf OPD mengisi profiling dan mengajukan tiket | Diisi | Diisi | Diisi | Diisi |
| 4 | Vendor memperbarui status dan mengunggah bukti | Diisi | Diisi | Diisi | Diisi |
| 5 | Admin membuat laporan rekap | Diisi | Diisi | Diisi | Diisi |

Bukti yang disimpan: nama penguji, tanggal, screenshot/formulir UAT, catatan kendala, dan tanda tangan/paraf bila diminta pembimbing.

## 5. Deployment checklist

### Sebelum deploy

- [ ] Backup database lokal dan file upload.
- [ ] Set `APP_ENV=production`.
- [ ] Set `APP_DEBUG=false`.
- [ ] Generate `APP_KEY` baru di server produksi; jangan menyalin key dari repo.
- [ ] Isi kredensial database produksi pada `.env`.
- [ ] Pastikan `APP_URL` memakai domain/IP server.
- [ ] Jalankan `composer install --no-dev --optimize-autoloader`.
- [ ] Jalankan `npm ci && npm run build`.
- [ ] Jalankan `php artisan migrate --force` setelah backup.
- [ ] Jalankan `php artisan storage:link`.
- [ ] Pastikan permission `storage` dan `bootstrap/cache` dapat ditulis web server.
- [ ] Jalankan `php artisan config:cache && php artisan route:cache && php artisan view:cache`.

### Setelah deploy

- [ ] Login Admin, OPD, dan Pihak Ketiga.
- [ ] Uji akses silang dan pastikan 403.
- [ ] Uji satu alur profiling sampai verifikasi.
- [ ] Uji satu alur tiket sampai bukti dan penutupan.
- [ ] Uji export laporan.
- [ ] Periksa log `storage/logs/laravel.log`.
- [ ] Pastikan tidak ada password, APP_KEY, atau data sensitif di repository.

## Status baseline otomatis

Pada 27 September 2026:

- Test bawaan Laravel/Breeze: **25 passed, 61 assertions**.
- Test Fase 4 yang ditambahkan: **4 passed, 27 assertions**.
- Cakupan baru: login tiga role, pembatasan akses silang, CRUD OPD, dan validasi profiling kosong.
- UAT, verifikasi export di environment nyata, dan deployment masih harus dilakukan manual.
- Catatan gap: route yang terdaftar baru `GET /admin/laporan`; endpoint Excel/PDF belum tersedia di backend.
