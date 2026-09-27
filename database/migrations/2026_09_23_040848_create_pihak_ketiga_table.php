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
        Schema::create('pihak_ketiga', function (Blueprint $table) {
            $table->id();
            $table->string('nama_vendor', 150);
            $table->enum('jenis_layanan', ['isp', 'perangkat', 'lainnya'])->default('lainnya');
            $table->string('kontak_person', 150)->nullable();
            $table->string('nomor_kontak', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pihak_ketiga');
    }
};
