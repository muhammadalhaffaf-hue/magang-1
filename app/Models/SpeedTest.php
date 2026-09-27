<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpeedTest extends Model
{
    const UPDATED_AT = null;
    protected $table = 'speed_test';
    protected $fillable = ['data_profiling_id', 'kecepatan_unduh', 'kecepatan_unggah', 'hasil', 'bukti_file', 'tanggal_test'];
    protected $casts = ['tanggal_test' => 'date', 'kecepatan_unduh' => 'decimal:2', 'kecepatan_unggah' => 'decimal:2'];
    public function profiling()
    {
        return $this->belongsTo(DataProfiling::class, 'data_profiling_id');
    }
}
