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
        Schema::create('data_profiling', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('periode', 50);
            $table->unsignedInteger('jumlah_device')->default(0);
            $table->enum('status_verifikasi', ['draft', 'diajukan', 'diverifikasi', 'dikembalikan'])->default('draft');
            $table->text('kesimpulan')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->timestamp('tanggal_diajukan')->nullable();
            $table->timestamp('tanggal_diverifikasi')->nullable();
            $table->timestamps();

            $table->unique(['opd_id', 'periode']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_profiling');
    }
};
