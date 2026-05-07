<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentStatusLog extends Model
{
    // Immutable audit log — no updates
    public $timestamps = false;

    protected $fillable = [
        'appointment_id',
        'old_status',
        'new_status',
        'changed_by',
        'changed_at',
        'reason',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
