<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataProfiling extends Model
{
    use HasFactory;

    protected $table = 'data_profiling';

    protected $fillable = [
        'opd_id',
        'periode',
        'jumlah_device',
        'status_verifikasi',
        'kesimpulan',
        'diverifikasi_oleh',
        'tanggal_diajukan',
        'tanggal_diverifikasi',
    ];

    protected $casts = [
        'tanggal_diajukan' => 'datetime',
        'tanggal_diverifikasi' => 'datetime',
    ];

    public function opd()
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    public function aplikasi()
    {
        return $this->hasMany(AplikasiDigunakan::class, 'data_profiling_id');
    }

    public function speedTest()
    {
        return $this->hasOne(SpeedTest::class, 'data_profiling_id');
    }

    public function kendala()
    {
        return $this->hasMany(Kendala::class, 'data_profiling_id');
    }
}
