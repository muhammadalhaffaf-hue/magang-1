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
        Schema::create('speed_test', function (Blueprint $table) {
            $table->id();
            $table->foreignId('data_profiling_id')->unique()->constrained('data_profiling')->cascadeOnDelete()->cascadeOnUpdate();
            $table->decimal('kecepatan_unduh', 8, 2);
            $table->decimal('kecepatan_unggah', 8, 2)->nullable();
            $table->enum('hasil', ['sesuai', 'tidak_sesuai']);
            $table->string('bukti_file', 255)->nullable();
            $table->date('tanggal_test');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('speed_test');
    }
};
