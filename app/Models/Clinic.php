<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clinic extends Model
{
    use SoftDeletes;

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
    ];
    protected $casts = [
        'trial_ends_at' => 'datetime',
        'is_active'     => 'boolean',
    ];
    // ── Plan helpers ──────────────────────────────────────────
    public function isOnPlan(string $plan): bool
    {
        return $this->subscription_plan === $plan;
    }

    public function canAddDoctor(): bool
    {
        return match ($this->subscription_plan) {
            'free'   => $this->users()->doctors()->count() < 1,
            'clinic' => $this->users()->doctors()->count() < 3,
            'chain'  => true,
            default  => false,
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

    public function subscription(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
}
