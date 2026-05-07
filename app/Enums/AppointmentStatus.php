<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Scheduled = 'scheduled';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'مجدول',
            self::Confirmed => 'مؤكد',
            self::InProgress => 'جارٍ',
            self::Completed => 'مكتمل',
            self::Cancelled => 'ملغى',
            self::NoShow => 'لم يحضر',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Scheduled => 'blue',
            self::Confirmed => 'violet',
            self::InProgress => 'amber',
            self::Completed => 'emerald',
            self::Cancelled => 'red',
            self::NoShow => 'gray',
        };
    }

    /** Returns true if the appointment is still actionable */
    public function isActive(): bool
    {
        return in_array($this, [self::Scheduled, self::Confirmed, self::InProgress]);
    }

    /** Returns true if the appointment reached a terminal state */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled, self::NoShow]);
    }
}
