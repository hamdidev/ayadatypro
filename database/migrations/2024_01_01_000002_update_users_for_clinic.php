<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('clinic_id')
                ->nullable()
                ->after('id')
                ->constrained('clinics')
                ->nullOnDelete();

            $table->enum('role', ['owner', 'doctor', 'receptionist'])
                ->default('doctor')
                ->after('email');

            $table->string('specialty')->nullable()->after('role'); // تخصص الطبيب
            $table->string('phone')->nullable()->after('specialty');
            $table->string('avatar')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar');
            $table->string('google_id')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
            $table->dropColumn([
                'clinic_id',
                'role',
                'specialty',
                'phone',
                'avatar',
                'is_active',
                'google_id'
            ]);
        });
    }
};
