<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'clinic_id',
        'name',
        'email',
        'password',
        'role',
        'specialty',
        'phone',
        'avatar',
        'is_active',
        'google_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // ── Role helpers ──────────────────────────────────────────
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isDoctor(): bool
    {
        return $this->role === 'doctor';
    }

    public function isReceptionist(): bool
    {
        return $this->role === 'receptionist';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    // ── Scopes ────────────────────────────────────────────────
    public function scopeDoctors(Builder $query): Builder
    {
        return $query->where('role', 'doctor');
    }

    public function scopeForClinic(Builder $query, int $clinicId): Builder
    {
        return $query->where('clinic_id', $clinicId);
    }

    // ── Relationships ─────────────────────────────────────────
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function schedules()
    {
        return $this->hasMany(DoctorSchedule::class, 'doctor_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(UserConsent::class);
    }

    public function latestConsent()
    {
        return $this->hasOne(UserConsent::class)->latestOfMany('accepted_at');
    }
}
