<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('logo')->nullable();
            $table->string('specialty')->nullable();
            $table->enum('subscription_plan', ['free', 'clinic', 'chain'])->default('free');
            $table->timestamp('trial_ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_setup_complete')->default(false);
            $table->string('timezone')->default('Asia/Riyadh');
            $table->string('locale', 10)->default('ar');
            $table->string('currency', 3)->default('SAR');
            $table->string('week_start', 10)->default('saturday');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
