<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PihakKetiga extends Model
{
    use HasFactory;

    protected $table = 'pihak_ketiga';

    protected $fillable = [
        'nama_vendor',
        'jenis_layanan',
        'kontak_person',
        'nomor_kontak',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'pihak_ketiga_id');
    }

    public function tiket()
    {
        return $this->hasMany(Tiket::class, 'pihak_ketiga_id');
    }
}
