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
        Schema::create('aplikasi_digunakan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('data_profiling_id')->constrained('data_profiling')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('nama_aplikasi', 100);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aplikasi_digunakan');
    }
};
