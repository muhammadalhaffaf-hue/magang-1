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
        Schema::create('koneksi_internet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('nama_isp', 100);
            $table->decimal('bandwidth_mbps', 8, 2);
            $table->date('tanggal_aktif')->nullable();
            $table->enum('status', ['aktif', 'bermasalah', 'tidak_aktif'])->default('aktif');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('koneksi_internet');
    }
};
