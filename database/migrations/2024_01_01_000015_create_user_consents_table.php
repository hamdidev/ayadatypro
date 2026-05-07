<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('terms_version', 10);
            $table->string('privacy_version', 10);
            $table->timestamp('accepted_at');
            $table->string('ip_address', 45)->nullable(); // IPv6-safe
            $table->string('user_agent')->nullable();
            // No updated_at — consent records are immutable

            $table->index(['user_id', 'accepted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_consents');
    }
};
