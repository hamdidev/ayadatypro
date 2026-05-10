<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use App\Models\DoctorSchedule;
use App\Models\User;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingPortalController extends Controller
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
    ) {}

    /**
     * Show the public booking portal for a clinic.
     */
    public function show(string $clinicSlug): Response|\Illuminate\Http\Response
    {
        $clinic = Clinic::where('slug', $clinicSlug)
            ->where('is_active', true)
            ->firstOrFail();

        // Booking must be enabled in clinic settings
        if (! ($clinic->settings?->allow_online_booking ?? true)) {
            return response(
                view('errors.booking-disabled', ['clinic' => $clinic]),
                403
            );
        }

        $doctors = User::where('clinic_id', $clinic->id)
            ->doctors()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn(User $d) => [
                'id'        => $d->id,
                'name'      => $d->name,
                'specialty' => $d->specialty,
            ]);

        // Get the next 14 days that have at least one available slot
        // for any doctor — used to disable unavailable dates in the calendar
        $availableDates = $this->getClinicAvailableDates($clinic);

        return Inertia::render('Booking/Portal', [
            'clinic' => [
                'id'        => $clinic->id,
                'name'      => $clinic->name,
                'specialty' => $clinic->specialty,
                'slug'      => $clinic->slug,
                'timezone'  => $clinic->timezone ?? 'Asia/Riyadh',
            ],
            'doctors'        => $doctors,
            'availableDates' => $availableDates,
        ]);
    }

    /**
     * API — returns available slots for a doctor on a date.
     * Called by the booking portal when the user picks a doctor + date.
     */
    public function availableSlots(Request $request, string $clinicSlug): JsonResponse
    {
        $clinic = Clinic::where('slug', $clinicSlug)
            ->where('is_active', true)
            ->firstOrFail();

        $data = $request->validate([
            'doctor_id' => 'required|integer',
            'date'      => 'required|date|after_or_equal:today',
        ]);

        $doctor = User::where('id', $data['doctor_id'])
            ->where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->firstOrFail();

        $slots = $this->appointmentService->getAvailableSlots(
            $doctor,
            Carbon::parse($data['date']),
        );

        return response()->json($slots->values());
    }

    /**
     * Handle public appointment booking submission.
     */
    public function store(Request $request, string $clinicSlug): RedirectResponse|JsonResponse
    {
        $clinic = Clinic::where('slug', $clinicSlug)
            ->where('is_active', true)
            ->firstOrFail();

        if (! ($clinic->settings?->allow_online_booking ?? true)) {
            abort(403, 'الحجز الإلكتروني غير متاح لهذه العيادة.');
        }

        $data = $request->validate([
            'doctor_id'  => ['required', 'integer', 'exists:users,id'],
            'starts_at'  => ['required', 'date', 'after:now'],
            'ends_at'    => ['required', 'date', 'after:starts_at'],
            'name'       => ['required', 'string', 'max:255'],
            'phone'      => ['required', 'string', 'max:20'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ]);

        // Verify doctor belongs to this clinic
        $doctor = User::where('id', $data['doctor_id'])
            ->where('clinic_id', $clinic->id)
            ->firstOrFail();

        try {
            $appointment = $this->appointmentService->bookFromPortal($clinic, $data);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['starts_at' => $e->getMessage()]);
        }

        // Redirect to confirmation page
        return redirect()->route('booking.confirmation', [
            'clinicSlug' => $clinicSlug,
            'token'      => $this->generateConfirmationToken($appointment->id),
        ]);
    }

    /**
     * Show booking confirmation page.
     */
    public function confirmation(Request $request, string $clinicSlug): Response
    {
        $clinic = Clinic::where('slug', $clinicSlug)->firstOrFail();

        // Decode token to get appointment
        $appointmentId = $this->decodeConfirmationToken($request->token);

        $appointment = \App\Models\Appointment::withoutGlobalScope('clinic')
            ->with(['patient', 'doctor'])
            ->where('clinic_id', $clinic->id)
            ->find($appointmentId);

        abort_if(! $appointment, 404);

        return Inertia::render('Booking/Confirmation', [
            'clinic' => [
                'name' => $clinic->name,
                'slug' => $clinic->slug,
            ],
            'appointment' => [
                'patient'   => $appointment->patient->name,
                'doctor'    => $appointment->doctor->name,
                'starts_at' => $appointment->starts_at->format('Y-m-d H:i'),
                'ends_at'   => $appointment->ends_at->format('H:i'),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Get all dates in the next 30 days that have availability
     * for at least one doctor in the clinic.
     */
    private function getClinicAvailableDates(Clinic $clinic): array
    {
        // Get the days of week when at least one doctor works
        $workingDays = DoctorSchedule::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->pluck('day_of_week')
            ->unique()
            ->toArray();

        $available = [];
        $date      = Carbon::today($clinic->timezone ?? 'Asia/Riyadh')->addDay();

        for ($i = 0; $i < 30; $i++) {
            if (in_array($date->dayOfWeek, $workingDays)) {
                $available[] = $date->format('Y-m-d');
            }
            $date->addDay();
        }

        return $available;
    }

    /**
     * Generate a short-lived signed token for the confirmation page.
     * Prevents appointment ID enumeration.
     */
    private function generateConfirmationToken(int $appointmentId): string
    {
        return base64_encode(encrypt($appointmentId));
    }

    private function decodeConfirmationToken(?string $token): ?int
    {
        if (! $token) return null;

        try {
            return decrypt(base64_decode($token));
        } catch (\Exception) {
            return null;
        }
    }
}
