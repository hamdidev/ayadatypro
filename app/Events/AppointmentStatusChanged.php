<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $oldStatus,
        public readonly string $newStatus,
    ) {}

    /**
     * Broadcast on a private clinic channel so only clinic staff receive it.
     * Frontend subscribes to: private-clinic.{clinicId}
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("clinic.{$this->appointment->clinic_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointment.status.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'patient_name' => $this->appointment->patient->name,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'starts_at' => $this->appointment->starts_at->toISOString(),
        ];
    }
}
