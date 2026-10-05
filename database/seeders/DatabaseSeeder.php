<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin Utama
        DB::table('users')->insertOrIgnore([
            'nama' => 'Admin Diskominfo',
            'email' => 'admin@malangkab.go.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Import Data OPD dari File CSV
        $csvFile = database_path('seeders/data/opd.csv'); // Sesuaikan nama file CSV Anda

        if (file_exists($csvFile)) {
            $file = fopen($csvFile, 'r');
            $isHeader = true;

            // UBAH TAMBAHAN PERINTAH ';' DI BAWAH INI
            while (($data = fgetcsv($file, 2000, ';')) !== FALSE) {
                if ($isHeader) {
                    $isHeader = false; // Lewati baris pertama (Judul Kolom)
                    continue;
                }

                // Ambil Nama OPD di kolom kedua (indeks [1]) atau sesuaikan posisi nama OPD Anda
                $namaOpd = isset($data[1]) && !empty($data[1]) ? trim($data[1]) : null;

                if ($namaOpd && mb_strtoupper($namaOpd) !== 'LOKASI') {
                    DB::table('opd')->insert([
                        'nama_opd'   => substr($namaOpd, 0, 150), // Potong maksimal 150 karakter agar aman
                        'alamat'     => isset($data[2]) ? $data[2] : null,
                        'kontak'     => isset($data[3]) ? $data[3] : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            fclose($file);
        }
    }
}
