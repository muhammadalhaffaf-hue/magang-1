<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatTiket extends Model
{
    public $timestamps = false;
    protected $table = 'riwayat_tiket';
    protected $fillable = ['tiket_id', 'user_id', 'catatan', 'bukti_file', 'status_baru', 'tanggal'];
    protected $casts = ['tanggal' => 'datetime'];
    public function tiket()
    {
        return $this->belongsTo(Tiket::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
