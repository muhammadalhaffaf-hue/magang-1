<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nama',
        'name',
        'email',
        'password',
        'role',
        'opd_id',
        'pihak_ketiga_id',
        'status',
        'last_login_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getNameAttribute(): ?string
    {
        return $this->attributes['nama'] ?? null;
    }

    public function setNameAttribute(string $value): void
    {
        $this->attributes['nama'] = $value;
    }

    // Relasi ke OPD
    public function opd()
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    // Relasi ke Pihak Ketiga
    public function pihakKetiga()
    {
        return $this->belongsTo(PihakKetiga::class, 'pihak_ketiga_id');
    }
}
