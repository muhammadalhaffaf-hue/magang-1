<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('opd_id')->references('id')->on('opd')->nullOnDelete()->cascadeOnUpdate();
            $table->foreign('pihak_ketiga_id')->references('id')->on('pihak_ketiga')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['opd_id']);
            $table->dropForeign(['pihak_ketiga_id']);
        });
    }
};
