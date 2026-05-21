<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Cashier\Billable;

class Clinic extends Model
{
    use Billable, HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'phone',
        'address',
        'logo',
        'specialty',
        'subscription_plan',
        'trial_ends_at',
        'is_active',
        'is_setup_complete',
        'timezone',
        'locale',
        'currency',
        'week_start',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'is_active' => 'boolean',
        'is_setup_complete' => 'boolean',
    ];

    // ── Plan helpers ──────────────────────────────────────────
    public function isOnPlan(string $plan): bool
    {
        return $this->subscription_plan === $plan;
    }

    public function canAddDoctor(): bool
    {
        return match ($this->subscription_plan) {
            'free' => $this->users()->doctors()->count() < 1,
            'clinic' => $this->users()->doctors()->count() < 3,
            'chain' => true,
            default => false,
        };
    }

    public function monthlyAppointmentLimit(): ?int
    {
        return $this->subscription_plan === 'free' ? 50 : null;
    }

    // ── Relationships ─────────────────────────────────────────
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
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

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function mainBranch(): HasOne
    {
        return $this->hasOne(Branch::class)->where('is_main', true);
    }

    public function activeBranches(): HasMany
    {
        return $this->hasMany(Branch::class)->where('is_active', true);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(ClinicSetting::class);
    }

    // Helper — returns settings or sensible defaults if not yet created
    public function getEffectiveSettings(): ClinicSetting
    {
        return $this->settings ?? new ClinicSetting([
            'appointment_duration' => 20,
            'buffer_time' => 5,
            'allow_online_booking' => true,
            'require_approval_for_new_patients' => false,
        ]);
    }
}
