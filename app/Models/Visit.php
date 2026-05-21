<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'follow_up_date',      // exists in DB
        'is_signed',
        'signed_at',
        'signed_by',
    ];

    protected $casts = [
        'is_signed'      => 'boolean',
        'signed_at'      => 'datetime',
        'follow_up_date' => 'date',
    ];

    // ── Global clinic scope ──────────────────────
    protected static function booted(): void
    {
        static::addGlobalScope('clinic', function (Builder $query) {
            if (auth()->check()) {
                $query->where('visits.clinic_id', auth()->user()->clinic_id);
            }
        });
    }

    // ── Accessor ─────────────────────────────────
    public function getFullDiagnosisAttribute(): string
    {
        return collect([$this->diagnosis_code, $this->diagnosis_free_text])
            ->filter()
            ->implode(' — ');
    }

    // ── Relations ────────────────────────────────
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

    // ── Actions ──────────────────────────────────
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
}
