<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicSetting extends Model
{
    protected $fillable = [
        'clinic_id',
        'appointment_duration',
        'buffer_time',
        'allow_online_booking',
        'require_approval_for_new_patients',
    ];

    protected $casts = [
        'appointment_duration' => 'integer',
        'buffer_time' => 'integer',
        'allow_online_booking' => 'boolean',
        'require_approval_for_new_patients' => 'boolean',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
