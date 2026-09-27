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
        Schema::create('solusi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kendala_id')->constrained('kendala')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('jenis_solusi', ['tambahan_bandwidth', 'peremajaan_perangkat', 'sosialisasi_ulang', 'lainnya']);
            $table->text('deskripsi')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solusi');
    }
};
