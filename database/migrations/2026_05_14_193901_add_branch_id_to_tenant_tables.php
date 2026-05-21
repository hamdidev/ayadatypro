<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Appointments, visits, invoices are branch-scoped
        // Patients belong to the clinic (visible across all branches)
        foreach (['appointments', 'visits', 'invoices'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreignId('branch_id')
                    ->nullable()
                    ->after('clinic_id')
                    ->constrained('branches')
                    ->nullOnDelete();
            });
        }

        // Staff can be assigned to a primary branch
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('branch_id')
                ->nullable()
                ->after('clinic_id')
                ->constrained('branches')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        foreach (['appointments', 'visits', 'invoices', 'users'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropConstrainedForeignId('branch_id');
            });
        }
    }
};
