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
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('clinic_id')->constrained();
            $table->foreignId('visit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('file_path');
            $table->string('file_type')->nullable(); // image/pdf/dicom
            $table->string('original_name')->nullable();
            $table->string('label')->nullable(); // "نتيجة تحليل", "أشعة سينية"
            $table->bigInteger('file_size')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'visit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
