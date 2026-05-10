<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: rename diagnosis → diagnosis_free_text (separate call — safe on PostgreSQL)
        Schema::table('visits', function (Blueprint $table) {
            $table->renameColumn('diagnosis', 'diagnosis_free_text');
        });

        // Step 2: add all new columns
        Schema::table('visits', function (Blueprint $table) {
            $table->string('diagnosis_code', 10)->nullable()->after('chief_complaint');
            $table->boolean('is_signed')->default(false)->after('follow_up_date');
            $table->timestamp('signed_at')->nullable()->after('is_signed');
            $table->foreignId('signed_by')->nullable()->constrained('users')->nullOnDelete()->after('signed_at');
        });

        // Step 3: PostgreSQL full-text search index on diagnosis + complaint
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                CREATE INDEX idx_visit_search ON visits
                USING gin(
                    to_tsvector('arabic',
                        coalesce(diagnosis_free_text, '') || ' ' || coalesce(chief_complaint, '')
                    )
                )
            ");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_visit_search');
        }

        Schema::table('visits', function (Blueprint $table) {
            $table->dropForeign(['signed_by']);
            $table->dropColumn(['diagnosis_code', 'is_signed', 'signed_at', 'signed_by']);
        });

        Schema::table('visits', function (Blueprint $table) {
            $table->renameColumn('diagnosis_free_text', 'diagnosis');
        });
    }
};
