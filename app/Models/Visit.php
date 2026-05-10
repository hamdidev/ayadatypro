<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Visit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'clinic_id',
        'chief_complaint',
        'diagnosis_free_text',
        'diagnosis_code',
        'notes',
        'follow_up_date',
        'is_signed',
        'signed_at',
        'signed_by',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'notes',
        'clinic_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'follow_up_date'      => 'date',
        'signed_at'           => 'datetime',
        'is_signed'           => 'boolean',
        'notes'               => 'encrypted',
        'diagnosis_free_text' => 'encrypted',
    ];

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::addGlobalScope('clinic', function (Builder $builder) {
            if (auth()->user()?->clinic_id) {
                $builder->where('visits.clinic_id', auth()->user()->clinic_id);
            }
        });

        static::creating(function (Visit $visit) {
            if (Auth::check()) {
                $visit->created_by ??= Auth::id();
                $visit->updated_by ??= Auth::id();
                $visit->clinic_id  ??= Auth::user()->clinic_id;
            }
        });

        static::updating(function (Visit $visit) {
            if (Auth::check()) {
                $visit->updated_by = Auth::id();
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
    public function signedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by');
    }
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    // ─────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────

    public function scopeSigned(Builder $query): Builder
    {
        return $query->where('is_signed', true);
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('is_signed', false);
    }

    public function scopePendingFollowUp(Builder $query): Builder
    {
        return $query->whereNotNull('follow_up_date')
            ->where('follow_up_date', '>=', today());
    }

    public function scopeForDoctor(Builder $query, int $doctorId): Builder
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForPatient(Builder $query, int $patientId): Builder
    {
        return $query->where('patient_id', $patientId);
    }

    // ─────────────────────────────────────────────────────────────
    // ACCESSORS
    // ─────────────────────────────────────────────────────────────

    public function getIsDraftAttribute(): bool
    {
        return ! $this->is_signed;
    }

    /**
     * Combined ICD-10 code + free text for display.
     */
    public function getFullDiagnosisAttribute(): string
    {
        if ($this->diagnosis_code && $this->diagnosis_free_text) {
            return "{$this->diagnosis_code} — {$this->diagnosis_free_text}";
        }

        return $this->diagnosis_code
            ?? $this->diagnosis_free_text
            ?? '';
    }

    // ─────────────────────────────────────────────────────────────
    // BUSINESS LOGIC
    // ─────────────────────────────────────────────────────────────

    /**
     * Sign and lock the visit note.
     *
     * @throws \RuntimeException if already signed
     */
    public function sign(?User $actor = null): void
    {
        if ($this->is_signed) {
            throw new \RuntimeException("Visit #{$this->id} is already signed.");
        }

        $signer = $actor ?? Auth::user();

        $this->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signed_by' => $signer->id,
        ]);
    }

    public function isEditable(): bool
    {
        return ! $this->is_signed;
    }

    public function needsFollowUpBooking(): bool
    {
        if (! $this->follow_up_date) return false;

        return ! Appointment::where('patient_id', $this->patient_id)
            ->where('starts_at', '>=', $this->follow_up_date->startOfDay())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->exists();
    }
}
