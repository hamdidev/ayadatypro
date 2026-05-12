<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Visit extends Model
{
    protected $fillable = [
        'patient_id',
        'clinic_id',
        'doctor_id',
        'appointment_id',
        'chief_complaint',
        'notes',
        'diagnosis_code',
        'diagnosis_free_text',
        'is_signed',
        'signed_at',
        'signed_by',
        'visited_at',
        'status',
    ];

    protected $casts = [
        'is_signed'  => 'boolean',
        'signed_at'  => 'datetime',
        'visited_at' => 'datetime',
    ];

    // Relations
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function signedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    // Actions
    public function sign(int $userId): void
    {
        $this->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signed_by' => $userId,
        ]);
    }

    public function unsign(): void
    {
        $this->update([
            'is_signed' => false,
            'signed_at' => null,
            'signed_by' => null,
        ]);
    }

    // Scopes
    public function scopeForClinic($query, int $clinicId)
    {
        return $query->where('clinic_id', $clinicId);
    }
}
