<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Events\AppointmentStatusChanged;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class Appointment extends Model
{
    use SoftDeletes;

    protected const MIN_DURATION_MINUTES = 15;

    protected const MAX_DURATION_MINUTES = 480;

    /**
     * Valid state transitions for the appointment lifecycle.
     * Uses enum values (strings) as keys for easy serialization.
     */
    public const TRANSITIONS = [
        AppointmentStatus::Scheduled->value => [
            AppointmentStatus::Confirmed->value,
            AppointmentStatus::Cancelled->value,
            AppointmentStatus::NoShow->value,
        ],
        AppointmentStatus::Confirmed->value => [
            AppointmentStatus::InProgress->value,
            AppointmentStatus::Cancelled->value,
            AppointmentStatus::NoShow->value,
        ],
        AppointmentStatus::InProgress->value => [
            AppointmentStatus::Completed->value,
        ],
        AppointmentStatus::Completed->value => [],
        AppointmentStatus::Cancelled->value => [],
        AppointmentStatus::NoShow->value => [],
    ];

    protected $fillable = [
        'clinic_id',
        'doctor_id',
        'patient_id',
        'created_by',
        'starts_at',
        'ends_at',
        'status',
        'type',
        'notes',
        'cancellation_reason',
    ];

    protected $hidden = [
        'notes',
        'cancellation_reason',
        'clinic_id',
        'deleted_at',
    ];

    protected $casts = [
        // ✅ Plain datetime — store in UTC, convert in local accessors below
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',

        // ✅ Cast status to enum — enables $appointment->status->label() etc.
        'status' => AppointmentStatus::class,
    ];

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        // Clinic isolation scope
        static::addGlobalScope('clinic', function (Builder $builder) {
            $user = Auth::user();

            if ($user?->isSuperAdmin()) {
                return;
            }

            if ($user?->clinic_id) {
                // ✅ Fixed: was a markdown-corrupted link
                $builder->where('appointments.clinic_id', $user->clinic_id);
            }
        });

        // Validate before every save
        static::saving(function (Appointment $appointment) {
            $appointment->validateTimeOrdering();
            $appointment->validateDuration();
        });
    }

    // ─────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function visit(): HasOne
    {
        return $this->hasOne(Visit::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(AppointmentStatusLog::class);
    }

    // ─────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('starts_at', today(config('app.timezone')));
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>', now())
            ->whereIn('status', [
                AppointmentStatus::Scheduled->value,
                AppointmentStatus::Confirmed->value,
            ])
            ->orderBy('starts_at');
    }

    public function scopeForDoctor(Builder $query, int $doctorId): Builder
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForPatient(Builder $query, int $patientId): Builder
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Find appointments conflicting with a given time range for a doctor.
     * Uses strict (exclusive) boundary comparisons — back-to-back appointments
     * sharing an edge are NOT conflicts.
     */
    public function scopeConflictingWith(
        Builder $query,
        int $doctorId,
        Carbon $starts,
        Carbon $ends,
        ?int $excludeId = null,
    ): Builder {
        return $query
            ->where('doctor_id', $doctorId)
            ->whereNotIn('status', [
                AppointmentStatus::Cancelled->value,
                AppointmentStatus::NoShow->value,
            ])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where('starts_at', '<', $ends)    // ✅ strict — excludes shared-edge
            ->where('ends_at', '>', $starts);  // ✅ strict — excludes shared-edge
    }

    /**
     * Bypass clinic scope — superadmin use only.
     */
    public static function withoutClinicScope(): Builder
    {
        // ✅ withoutGlobalScope returns Builder, doesn't accept a callable
        return static::withoutGlobalScope('clinic');
    }

    // ─────────────────────────────────────────────────────────────
    // STATE MACHINE
    // ─────────────────────────────────────────────────────────────

    public function canTransitionTo(string|AppointmentStatus $newStatus): bool
    {
        $value = $newStatus instanceof AppointmentStatus
            ? $newStatus->value
            : $newStatus;

        return in_array($value, self::TRANSITIONS[$this->status->value] ?? [], true);
    }

    /**
     * Transition to a new status, log the change, and fire the broadcast event.
     *
     * @throws InvalidArgumentException if the transition is not allowed
     */
    public function transitionTo(string|AppointmentStatus $newStatus, ?User $actor = null): bool
    {
        $value = $newStatus instanceof AppointmentStatus
            ? $newStatus->value
            : $newStatus;

        if (! $this->canTransitionTo($value)) {
            throw new InvalidArgumentException(
                "Cannot transition appointment #{$this->id} from '{$this->status->value}' to '{$value}'"
            );
        }

        $oldStatus = $this->status->value;

        $this->update(['status' => $value]);

        AppointmentStatusLog::create([
            'appointment_id' => $this->id,
            'old_status' => $oldStatus,
            'new_status' => $value,
            'changed_by' => $actor?->id ?? Auth::id(),
            'changed_at' => now(),
            'reason' => $this->cancellation_reason,
        ]);

        event(new AppointmentStatusChanged($this, $oldStatus, $value));

        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // ACCESSORS
    // ─────────────────────────────────────────────────────────────

    /**
     * Start time in the clinic's local timezone.
     * ✅ Defaults to Asia/Riyadh (not Europe/Berlin)
     */
    public function getStartsAtLocalAttribute(): Carbon
    {
        return $this->starts_at->copy()->setTimezone(
            $this->clinic?->timezone ?? config('app.timezone', 'Asia/Riyadh')
        );
    }

    public function getEndsAtLocalAttribute(): Carbon
    {
        return $this->ends_at->copy()->setTimezone(
            $this->clinic?->timezone ?? config('app.timezone', 'Asia/Riyadh')
        );
    }

    public function getDurationMinutesAttribute(): int
    {
        return (int) $this->starts_at->diffInMinutes($this->ends_at);
    }

    /**
     * Status badge data for the frontend.
     * Returns label and color sourced from the enum — not hardcoded here.
     */
    public function getStatusBadgeAttribute(): array
    {
        return [
            'label' => $this->status->label(),
            'color' => $this->status->color(),
            'value' => $this->status->value,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────────────

    protected function validateTimeOrdering(): void
    {
        $starts = Carbon::parse($this->starts_at);
        $ends = Carbon::parse($this->ends_at);

        if ($ends->lte($starts)) {
            throw new InvalidArgumentException(
                'وقت انتهاء الموعد يجب أن يكون بعد وقت البداية'
            );
        }
    }

    protected function validateDuration(): void
    {
        $duration = $this->duration_minutes;

        if ($duration < self::MIN_DURATION_MINUTES) {
            throw new InvalidArgumentException(
                'يجب أن يكون الموعد '.self::MIN_DURATION_MINUTES.' دقيقة على الأقل'
            );
        }

        if ($duration > self::MAX_DURATION_MINUTES) {
            throw new InvalidArgumentException(
                'لا يمكن أن يتجاوز الموعد '.self::MAX_DURATION_MINUTES.' دقيقة'
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    // BUSINESS LOGIC
    // ─────────────────────────────────────────────────────────────

    /**
     * Check if this appointment conflicts with any other appointment for the same doctor.
     * Uses strict boundary comparison — sharing an edge is not a conflict.
     */
    public function hasConflict(): bool
    {
        return static::withoutGlobalScope('clinic')
            ->where('doctor_id', $this->doctor_id)
            ->where('id', '!=', $this->id ?? 0)
            ->whereNotIn('status', [
                AppointmentStatus::Cancelled->value,
                AppointmentStatus::NoShow->value,
            ])
            ->where('starts_at', '<', $this->ends_at)   // ✅ strict
            ->where('ends_at', '>', $this->starts_at)  // ✅ strict
            ->exists();
    }

    public function isPast(): bool
    {
        return $this->ends_at->isPast();
    }

    public function isToday(): bool
    {
        return $this->starts_at->isToday();
    }
}
