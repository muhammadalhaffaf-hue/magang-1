<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tiket', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_tiket', 30)->unique();
            $table->foreignId('kendala_id')->unique()->constrained('kendala')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('pihak_ketiga_id')->nullable()->constrained('pihak_ketiga')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('dibuat_oleh')->constrained('users')->restrictOnDelete()->cascadeOnUpdate();
            $table->boolean('ditangani_internal')->default(false);
            $table->enum('urgensi', ['rendah', 'sedang', 'tinggi'])->default('sedang');
            $table->enum('status', ['baru', 'diteruskan', 'proses', 'menunggu_verifikasi', 'selesai', 'ditolak'])->default('baru');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiket');
    }
};
