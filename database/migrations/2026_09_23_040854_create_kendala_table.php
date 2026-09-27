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
        Schema::create('kendala', function (Blueprint $table) {
            $table->id();
            $table->foreignId('data_profiling_id')->constrained('data_profiling')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('jenis_kendala', ['bandwidth_kurang', 'device', 'topologi', 'sosialisasi']);
            $table->text('deskripsi')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kendala');
    }
};
