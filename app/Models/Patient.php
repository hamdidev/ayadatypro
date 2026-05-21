<?php

namespace App\Models;

use App\Enums\BloodType;
use App\Enums\Gender;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\AsEncryptedArrayObject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'name',
        'phone',
        'national_id',
        'dob',
        'gender',
        'blood_type',
        'allergies',
        'chronic_conditions',
        'notes',
        'created_by',
        'updated_by',
    ];

    /**
     * Sensitive medical fields excluded from serialization by default.
     * Use ->makeVisible([...]) on a controller when explicitly needed.
     */
    protected $hidden = [
        'national_id',
        'allergies',
        'chronic_conditions',
        'notes',
        'clinic_id',
        'created_by',
        'updated_by',
        'deleted_at',
    ];

    protected $appends = ['age'];

    protected $casts = [
        'dob' => 'date',
        'gender' => Gender::class,
        'blood_type' => BloodType::class,

        // Encrypt at rest — stored as ciphertext in DB
        'national_id' => 'encrypted',
        'notes' => 'encrypted',

        // ✅ Correct cast for encrypted JSON arrays
        // 'encrypted:array' is not valid — use AsEncryptedArrayObject
        'allergies' => AsEncryptedArrayObject::class,
        'chronic_conditions' => AsEncryptedArrayObject::class,
    ];

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Clinic isolation — skipped for superadmins
        static::addGlobalScope('clinic', function (Builder $builder) {
            $user = Auth::user();

            if ($user?->isSuperAdmin()) {
                return;
            }

            if ($user?->clinic_id) {
                $builder->where('clinic_id', $user->clinic_id);
            }
        });

        // Auto-fill audit fields
        static::creating(function (Patient $patient) {
            if (Auth::check()) {
                $patient->created_by ??= Auth::id();
                $patient->updated_by ??= Auth::id();
            }
        });

        static::updating(function (Patient $patient) {
            if (Auth::check()) {
                $patient->updated_by = Auth::id();
            }
        });

        // GDPR/medical compliance access logging — async, production only
        static::retrieved(function (Patient $patient) {
            if (Auth::check() && app()->environment('production')) {
                $userId = Auth::id();
                dispatch(fn () => PatientAccessLog::create([
                    'patient_id' => $patient->id,
                    'user_id' => $userId,
                    'accessed_at' => now(),
                    'ip_address' => request()?->ip(),
                    'user_agent' => request()?->userAgent(),
                ]))->onConnection('redis')->onQueue('low');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(PatientAccessLog::class);
    }

    // ─────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────

    /**
     * Search by name or phone only.
     * national_id is excluded — encrypted columns cannot be searched with LIKE.
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'ILIKE', "%{$term}%")
                ->orWhere('phone', 'ILIKE', "%{$term}%");
        });
    }

    /**
     * Temporary bypass of clinic scope — superadmin use only.
     */
    public static function withoutClinicScope(): Builder
    {
        return static::withoutGlobalScope('clinic');
    }

    // ─────────────────────────────────────────────────────────────
    // ACCESSORS / MUTATORS
    // ─────────────────────────────────────────────────────────────

    public function getAgeAttribute(): ?int
    {
        return $this->dob?->age;
    }

    /**
     * Normalize phone to E.164 format on save.
     * Defaults to Saudi Arabia (+966) — change config('app.phone_country_code') per deployment.
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => $value ? $this->normalizePhone($value) : null,
        );
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^\d+]/', '', $phone);

        $countryCode = config('app.phone_country_code', '+966'); // Saudi default

        if (str_starts_with($phone, '0')) {
            $phone = $countryCode.substr($phone, 1);
        } elseif (! str_starts_with($phone, '+')) {
            $phone = $countryCode.$phone;
        }

        return $phone;
    }

    // ─────────────────────────────────────────────────────────────
    // BUSINESS LOGIC
    // ─────────────────────────────────────────────────────────────

    /**
     * Check if the record can be permanently deleted.
     * Medical records must be retained for 10 years (Saudi MOH regulation).
     */
    public function isLegallyDeletable(): bool
    {
        $retention = now()->subYears(10);

        return $this->visits()->where('created_at', '>', $retention)->doesntExist()
            && $this->invoices()->where('created_at', '>', $retention)->doesntExist()
            && $this->attachments()->doesntExist();
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name;
    }
}
