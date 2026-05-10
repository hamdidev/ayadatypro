<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\DoctorSchedule;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AppointmentService
{
    // ─────────────────────────────────────────────────────────────
    // SLOT AVAILABILITY
    // ─────────────────────────────────────────────────────────────

    /**
     * Get all available time slots for a doctor on a given date.
     *
     * @return Collection<array{starts_at: string, ends_at: string, label: string}>
     */
    public function getAvailableSlots(
        User   $doctor,
        Carbon $date,
        int    $slotMinutes = 0,  // 0 = use doctor's schedule default
        ?int   $excludeAppointmentId = null,
    ): Collection {
        $dayOfWeek = $date->dayOfWeek;

        // Find the doctor's schedule for this day
        $schedule = DoctorSchedule::where('doctor_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (! $schedule) {
            return collect(); // Doctor doesn't work this day
        }

        $duration = $slotMinutes > 0 ? $slotMinutes : $schedule->slot_minutes;
        $buffer   = $this->getBufferTime($doctor->clinic_id);

        // Build slot grid for the day
        $slots    = $this->buildSlotGrid($date, $schedule, $duration);

        // Get existing appointments for this doctor on this date
        $booked   = $this->getBookedSlots($doctor->id, $date, $excludeAppointmentId);

        // Filter out conflicting slots
        return $slots->filter(function (array $slot) use ($booked, $buffer) {
            return ! $this->slotConflicts($slot, $booked, $buffer);
        })->values();
    }

    /**
     * Get available slots for all doctors in a clinic on a given date.
     *
     * @return Collection<int, Collection> Keyed by doctor_id
     */
    public function getClinicAvailability(Clinic $clinic, Carbon $date): Collection
    {
        $doctors = User::where('clinic_id', $clinic->id)
            ->doctors()
            ->where('is_active', true)
            ->get();

        return $doctors->mapWithKeys(function (User $doctor) use ($date) {
            return [
                $doctor->id => [
                    'doctor' => [
                        'id'        => $doctor->id,
                        'name'      => $doctor->name,
                        'specialty' => $doctor->specialty,
                    ],
                    'slots' => $this->getAvailableSlots($doctor, $date),
                ],
            ];
        })->filter(fn($d) => $d['slots']->isNotEmpty());
    }

    /**
     * Check if a specific time slot is available for a doctor.
     */
    public function isSlotAvailable(
        User   $doctor,
        Carbon $starts,
        Carbon $ends,
        ?int   $excludeId = null,
    ): bool {
        $buffer = $this->getBufferTime($doctor->clinic_id);

        // Expand the window by buffer time on both sides for conflict check
        $windowStart = $starts->copy()->subMinutes($buffer);
        $windowEnd   = $ends->copy()->addMinutes($buffer);

        return ! Appointment::withoutGlobalScope('clinic')
            ->where('doctor_id', $doctor->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->where('starts_at', '<', $windowEnd)
            ->where('ends_at',   '>', $windowStart)
            ->exists();
    }

    // ─────────────────────────────────────────────────────────────
    // BOOKING
    // ─────────────────────────────────────────────────────────────

    /**
     * Book an appointment from the public portal.
     * Creates or finds the patient, then creates the appointment.
     *
     * @throws \RuntimeException if slot is no longer available
     */
    public function bookFromPortal(
        Clinic $clinic,
        array  $data,
    ): Appointment {
        $doctor   = User::where('clinic_id', $clinic->id)
            ->where('id', $data['doctor_id'])
            ->firstOrFail();

        $starts = Carbon::parse($data['starts_at'], $clinic->timezone)->utc();
        $ends   = Carbon::parse($data['ends_at'], $clinic->timezone)->utc();

        // Final availability check — race condition guard
        if (! $this->isSlotAvailable($doctor, $starts, $ends)) {
            throw new \RuntimeException(
                'هذا الوقت لم يعد متاحاً. يرجى اختيار وقت آخر.'
            );
        }

        // Find existing patient by phone or create a new one
        $patient = \App\Models\Patient::withoutGlobalScope('clinic')
            ->where('clinic_id', $clinic->id)
            ->where('phone', $data['phone'])
            ->first();

        if (! $patient) {
            $patient = \App\Models\Patient::withoutGlobalScope('clinic')
                ->create([
                    'clinic_id' => $clinic->id,
                    'name'      => $data['name'],
                    'phone'     => $data['phone'],
                ]);
        }

        return Appointment::withoutGlobalScope('clinic')->create([
            'clinic_id'  => $clinic->id,
            'doctor_id'  => $doctor->id,
            'patient_id' => $patient->id,
            'starts_at'  => $starts,
            'ends_at'    => $ends,
            'status'     => 'scheduled',
            'type'       => 'booked',
            'notes'      => $data['notes'] ?? null,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // SCHEDULE HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Get the next N available dates for a doctor.
     * Used by the booking portal calendar to show available days.
     */
    public function getNextAvailableDates(User $doctor, int $count = 14): Collection
    {
        $scheduledDays = DoctorSchedule::where('doctor_id', $doctor->id)
            ->where('is_active', true)
            ->pluck('day_of_week')
            ->toArray();

        if (empty($scheduledDays)) {
            return collect();
        }

        $dates = collect();
        $date  = CarbonImmutable::today($doctor->clinic->timezone ?? 'Asia/Riyadh');
        $limit = $count * 4; // search window — avoid infinite loop

        for ($i = 0; $i < $limit && $dates->count() < $count; $i++) {
            $candidate = $date->addDays($i);

            if (
                in_array($candidate->dayOfWeek, $scheduledDays)
                && $this->getAvailableSlots($doctor, $candidate->toMutable())->isNotEmpty()
            ) {
                $dates->push($candidate->format('Y-m-d'));
            }
        }

        return $dates;
    }

    /**
     * Get a summary of today's queue for a doctor.
     */
    public function getTodayQueue(User $doctor): Collection
    {
        return Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->whereDate('starts_at', today())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn(Appointment $a) => [
                'id'        => $a->id,
                'patient'   => $a->patient->name,
                'phone'     => $a->patient->phone,
                'starts_at' => $a->starts_at->format('H:i'),
                'ends_at'   => $a->ends_at->format('H:i'),
                'status'    => $a->status->value,
                'type'      => $a->type,
            ]);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Build an array of time slots for a schedule on a given date.
     */
    private function buildSlotGrid(
        Carbon         $date,
        DoctorSchedule $schedule,
        int            $slotMinutes,
    ): Collection {
        $slots = collect();

        $start = $date->copy()->setTimeFromTimeString($schedule->start_time);
        $end   = $date->copy()->setTimeFromTimeString($schedule->end_time);

        $cursor = $start->copy();

        while ($cursor->copy()->addMinutes($slotMinutes)->lte($end)) {
            $slotEnd = $cursor->copy()->addMinutes($slotMinutes);

            $slots->push([
                'starts_at' => $cursor->toDateTimeString(),
                'ends_at'   => $slotEnd->toDateTimeString(),
                'label'     => $cursor->format('H:i') . ' — ' . $slotEnd->format('H:i'),
            ]);

            $cursor->addMinutes($slotMinutes);
        }

        return $slots;
    }

    /**
     * Get booked time ranges for a doctor on a date.
     */
    private function getBookedSlots(
        int     $doctorId,
        Carbon  $date,
        ?int    $excludeId,
    ): Collection {
        return Appointment::withoutGlobalScope('clinic')
            ->where('doctor_id', $doctorId)
            ->whereDate('starts_at', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->get(['starts_at', 'ends_at'])
            ->map(fn($a) => [
                'starts_at' => $a->starts_at,
                'ends_at'   => $a->ends_at,
            ]);
    }

    /**
     * Check if a candidate slot conflicts with any booked slots.
     * Uses strict boundary comparison — back-to-back is NOT a conflict.
     * Buffer time is applied around each booked slot.
     */
    private function slotConflicts(array $slot, Collection $booked, int $buffer): bool
    {
        $slotStart = Carbon::parse($slot['starts_at']);
        $slotEnd   = Carbon::parse($slot['ends_at']);

        foreach ($booked as $existing) {
            $existingStart = Carbon::parse($existing['starts_at'])->subMinutes($buffer);
            $existingEnd   = Carbon::parse($existing['ends_at'])->addMinutes($buffer);

            // Strict overlap: slot starts before buffered-end AND ends after buffered-start
            if ($slotStart->lt($existingEnd) && $slotEnd->gt($existingStart)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the buffer time (in minutes) for a clinic.
     * Falls back to 0 if no settings exist.
     */
    private function getBufferTime(int $clinicId): int
    {
        static $cache = [];

        if (! isset($cache[$clinicId])) {
            $cache[$clinicId] = \App\Models\ClinicSetting::where('clinic_id', $clinicId)
                ->value('buffer_time') ?? 0;
        }

        return $cache[$clinicId];
    }
}
