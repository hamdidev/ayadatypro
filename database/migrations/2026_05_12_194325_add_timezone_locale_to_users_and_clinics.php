<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone')->default('Asia/Riyadh')->after('avatar');
            }
            if (! Schema::hasColumn('users', 'locale')) {
                $table->string('locale')->default('ar')->after('timezone');
            }
        });

        Schema::table('clinics', function (Blueprint $table) {
            if (! Schema::hasColumn('clinics', 'timezone')) {
                $table->string('timezone')->default('Asia/Riyadh')->after('address');
            }
            if (! Schema::hasColumn('clinics', 'locale')) {
                $table->string('locale')->default('ar')->after('timezone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', fn ($t) => $t->dropColumn(['timezone', 'locale']));
        Schema::table('clinics', fn ($t) => $t->dropColumn(['timezone', 'locale']));
    }
};
