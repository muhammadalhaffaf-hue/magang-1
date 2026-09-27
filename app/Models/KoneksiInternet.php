<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KoneksiInternet extends Model
{
    protected $table = 'koneksi_internet';

    protected $fillable = ['opd_id', 'nama_isp', 'bandwidth_mbps', 'tanggal_aktif', 'status'];

    protected $casts = ['tanggal_aktif' => 'date', 'bandwidth_mbps' => 'decimal:2'];

    public function opd()
    {
        return $this->belongsTo(Opd::class);
    }
}
