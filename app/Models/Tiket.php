<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tiket extends Model
{
    use HasFactory;

    protected $table = 'tiket';

    protected $fillable = [
        'nomor_tiket',
        'kendala_id',
        'pihak_ketiga_id',
        'dibuat_oleh',
        'ditangani_internal',
        'urgensi',
        'status',
        'catatan_admin',
    ];

    public function kendala()
    {
        return $this->belongsTo(Kendala::class, 'kendala_id');
    }

    public function pihakKetiga()
    {
        return $this->belongsTo(PihakKetiga::class, 'pihak_ketiga_id');
    }

    public function dibuatOleh()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function riwayat()
    {
        return $this->hasMany(RiwayatTiket::class, 'tiket_id');
    }
}
