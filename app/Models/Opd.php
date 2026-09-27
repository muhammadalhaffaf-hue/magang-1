<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Opd extends Model
{
    use HasFactory;

    protected $table = 'opd';

    protected $fillable = [
        'nama_opd',
        'alamat',
        'kecamatan',
        'jumlah_pegawai',
        'penanggung_jawab',
        'kontak',
    ];

    // 1 OPD punya banyak User
    public function users()
    {
        return $this->hasMany(User::class, 'opd_id');
    }

    // 1 OPD punya banyak Data Profiling
    public function dataProfiling()
    {
        return $this->hasMany(DataProfiling::class, 'opd_id');
    }

    public function koneksiInternet()
    {
        return $this->hasMany(KoneksiInternet::class, 'opd_id');
    }
}
