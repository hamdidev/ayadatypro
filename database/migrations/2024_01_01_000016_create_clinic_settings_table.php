<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->unique()->constrained()->cascadeOnDelete();
            $table->integer('appointment_duration')->default(20); // minutes
            $table->integer('buffer_time')->default(5);           // minutes between slots
            $table->boolean('allow_online_booking')->default(true);
            $table->boolean('require_approval_for_new_patients')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
