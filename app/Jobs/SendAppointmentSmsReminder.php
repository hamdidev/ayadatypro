<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAppointmentSmsReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string      $type = 'confirmation', // confirmation | reminder_24h | reminder_1h
    ) {}

    public function handle(SmsService $sms): void
    {
        $patient     = $this->appointment->patient;
        $clinic      = $this->appointment->clinic;
        $scheduledAt = $this->appointment->scheduled_at;

        $phone = $patient->phone;
        if (! $phone) return;

        $message = match ($this->type) {
            'confirmation' => $this->confirmationMessage($patient->full_name, $clinic->name, $scheduledAt),
            'reminder_24h' => $this->reminder24hMessage($patient->full_name, $clinic->name, $scheduledAt),
            'reminder_1h'  => $this->reminder1hMessage($patient->full_name, $clinic->name, $scheduledAt),
            default        => null,
        };

        if ($message) {
            $sms->send($phone, $message);
        }
    }

    private function confirmationMessage(string $name, string $clinic, \Carbon\Carbon $at): string
    {
        return "مرحباً {$name}، تم تأكيد موعدك في {$clinic} بتاريخ {$at->format('Y/m/d')} الساعة {$at->format('h:i A')}. للاستفسار تواصل مع العيادة.";
    }

    private function reminder24hMessage(string $name, string $clinic, \Carbon\Carbon $at): string
    {
        return "تذكير: لديك موعد في {$clinic} غداً {$at->format('Y/m/d')} الساعة {$at->format('h:i A')}. نتطلع لرؤيتك.";
    }

    private function reminder1hMessage(string $name, string $clinic, \Carbon\Carbon $at): string
    {
        return "تذكير: موعدك في {$clinic} بعد ساعة، الساعة {$at->format('h:i A')}. نراك قريباً.";
    }
}
