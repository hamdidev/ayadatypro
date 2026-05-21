<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope('clinic', function (Builder $query) {
            if (auth()->check()) {
                $query->where('clinic_id', auth()->user()->clinic_id);
            }
        });
    }

    protected $fillable = [
        'visit_id',
        'patient_id',
        'clinic_id',
        'uploaded_by',
        'original_name',  // matches what controller passes
        'file_path',
        'file_type',
        'file_size',
        'label',
    ];

    protected $appends = ['url'];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
