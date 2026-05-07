<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'clinic_id',
        'stripe_id',
        'stripe_status',
        'stripe_price',
        'plan',
        'status',
        'quantity',
        'trial_ends_at',
        'ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }
}
