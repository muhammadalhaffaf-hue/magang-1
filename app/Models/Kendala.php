<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kendala extends Model
{
    const UPDATED_AT = null;
    protected $table = 'kendala';
    protected $fillable = ['data_profiling_id', 'jenis_kendala', 'nama_kendala', 'deskripsi'];
    public function profiling()
    {
        return $this->belongsTo(DataProfiling::class, 'data_profiling_id');
    }
    public function tiket()
    {
        return $this->hasOne(Tiket::class);
    }
}
