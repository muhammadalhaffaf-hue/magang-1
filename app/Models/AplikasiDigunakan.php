<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AplikasiDigunakan extends Model
{
    public $timestamps = false;
    protected $table = 'aplikasi_digunakan';
    protected $fillable = ['data_profiling_id', 'nama_aplikasi'];
    public function profiling()
    {
        return $this->belongsTo(DataProfiling::class, 'data_profiling_id');
    }
}
