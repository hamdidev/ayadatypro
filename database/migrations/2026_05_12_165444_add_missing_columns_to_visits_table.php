<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            if (! Schema::hasColumn('visits', 'diagnosis_code')) {
                $table->string('diagnosis_code')->nullable()->after('notes');
            }
            if (! Schema::hasColumn('visits', 'diagnosis_free_text')) {
                $table->text('diagnosis_free_text')->nullable()->after('diagnosis_code');
            }
            if (! Schema::hasColumn('visits', 'is_signed')) {
                $table->boolean('is_signed')->default(false)->after('diagnosis_free_text');
            }
            if (! Schema::hasColumn('visits', 'signed_at')) {
                $table->timestamp('signed_at')->nullable()->after('is_signed');
            }
            if (! Schema::hasColumn('visits', 'signed_by')) {
                $table->foreignId('signed_by')->nullable()->constrained('users')->nullOnDelete()->after('signed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->dropConstrainedForeignId('signed_by');
            $table->dropColumn(['diagnosis_code', 'diagnosis_free_text', 'is_signed', 'signed_at']);
        });
    }
};
