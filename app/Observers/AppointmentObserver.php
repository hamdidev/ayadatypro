<?php

namespace App\Observers;

use App\Jobs\SendAppointmentSmsReminder;
use App\Models\Appointment;

class AppointmentObserver
{
    public function created(Appointment $appointment): void
    {
        // Confirmation immediately
        SendAppointmentSmsReminder::dispatch($appointment, 'confirmation');

        // 24h reminder — schedule for 24h before appointment
        $remind24h = $appointment->scheduled_at->subHours(24);
        if ($remind24h->isFuture()) {
            SendAppointmentSmsReminder::dispatch($appointment, 'reminder_24h')
                ->delay($remind24h);
        }

        // 1h reminder
        $remind1h = $appointment->scheduled_at->subHour();
        if ($remind1h->isFuture()) {
            SendAppointmentSmsReminder::dispatch($appointment, 'reminder_1h')
                ->delay($remind1h);
        }
    }

    public function updated(Appointment $appointment): void
    {
        // Re-send confirmation if time changed
        if ($appointment->wasChanged('scheduled_at')) {
            SendAppointmentSmsReminder::dispatch($appointment, 'confirmation');
        }
    }
}
