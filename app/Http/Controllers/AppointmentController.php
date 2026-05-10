<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
    ) {}

    public function index(Request $request): Response
    {
        $appointments = Appointment::with(['patient', 'doctor'])
            ->when($request->date,      fn($q) => $q->whereDate('starts_at', $request->date))
            ->when($request->doctor_id, fn($q) => $q->where('doctor_id', $request->doctor_id))
            ->when($request->status,    fn($q) => $q->where('status', $request->status))
            ->when(
                ! $request->date && ! $request->status,
                fn($q) => $q->whereDate('starts_at', '>=', today())
            )
            ->orderBy('starts_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn(Appointment $a) => [
                'id'        => $a->id,
                'patient'   => $a->patient->name,
                'doctor'    => $a->doctor->name,
                'starts_at' => $a->starts_at->format('Y-m-d H:i'),
                'ends_at'   => $a->ends_at->format('H:i'),
                'status'    => $a->status->value,
                'type'      => $a->type,
                'duration'  => $a->duration_minutes,
            ]);

        $doctors = User::where('clinic_id', auth()->user()->clinic_id)
            ->doctors()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'doctors'      => $doctors,
            'filters'      => $request->only(['date', 'doctor_id', 'status']),
            'statuses'     => collect(AppointmentStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $clinic  = auth()->user()->clinic;
        $doctors = User::where('clinic_id', $clinic->id)
            ->doctors()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'specialty']);

        $patient = $request->patient_id
            ? Patient::find($request->patient_id, ['id', 'name', 'phone'])
            : null;

        // Pre-load available slots for the default doctor + date
        // so the form shows slots immediately without an API call
        $defaultDate   = $request->date ?? today()->format('Y-m-d');
        $defaultDoctor = $doctors->first();

        $slots = $defaultDoctor
            ? $this->appointmentService->getAvailableSlots(
                $defaultDoctor,
                Carbon::parse($defaultDate)
            )
            : collect();

        return Inertia::render('Appointments/Create', [
            'doctors'            => $doctors,
            'preselectedPatient' => $patient,
            'defaultDate'        => $defaultDate,
            'defaultSlots'       => $slots->values(),
            'slotDuration'       => $clinic->settings?->appointment_duration ?? 20,
        ]);
    }

    /**
     * API endpoint — returns available slots for a doctor + date.
     * Called by the Create/Edit form when doctor or date changes.
     */
    public function slots(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'doctor_id' => 'required|integer|exists:users,id',
            'date'      => 'required|date',
            'exclude_id' => 'nullable|integer',
        ]);

        $doctor = User::findOrFail($data['doctor_id']);

        // Ensure doctor belongs to same clinic
        abort_unless($doctor->clinic_id === auth()->user()->clinic_id, 403);

        $slots = $this->appointmentService->getAvailableSlots(
            $doctor,
            Carbon::parse($data['date']),
            excludeAppointmentId: $data['exclude_id'] ?? null,
        );

        return response()->json($slots->values());
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'doctor_id'  => ['required', 'integer', 'exists:users,id'],
            'starts_at'  => ['required', 'date', 'after:now'],
            'ends_at'    => ['required', 'date', 'after:starts_at'],
            'type'       => ['required', Rule::in(['booked', 'walk_in'])],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = User::findOrFail($data['doctor_id']);

        $available = $this->appointmentService->isSlotAvailable(
            $doctor,
            Carbon::parse($data['starts_at']),
            Carbon::parse($data['ends_at']),
        );

        if (! $available) {
            return back()->withErrors([
                'starts_at' => 'يوجد تعارض مع موعد آخر للطبيب في هذا الوقت.',
            ]);
        }

        $appointment = Appointment::create(array_merge($data, [
            'clinic_id'  => auth()->user()->clinic_id,
            'created_by' => auth()->id(),
            'status'     => AppointmentStatus::Scheduled->value,
        ]));

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'تم إنشاء الموعد بنجاح.');
    }

    public function show(Appointment $appointment): Response
    {
        $this->authorize('view', $appointment);

        $appointment->load(['patient', 'doctor', 'createdBy', 'visit', 'statusLogs.changedBy']);

        return Inertia::render('Appointments/Show', [
            'appointment' => [
                'id'           => $appointment->id,
                'status'       => $appointment->status->value,
                'status_badge' => $appointment->status_badge,
                'type'         => $appointment->type,
                'starts_at'    => $appointment->starts_at->format('Y-m-d H:i'),
                'ends_at'      => $appointment->ends_at->format('H:i'),
                'duration'     => $appointment->duration_minutes,
                'notes'        => $appointment->notes,
                'is_past'      => $appointment->isPast(),

                'patient' => [
                    'id'    => $appointment->patient->id,
                    'name'  => $appointment->patient->name,
                    'phone' => $appointment->patient->phone,
                ],
                'doctor' => [
                    'id'   => $appointment->doctor->id,
                    'name' => $appointment->doctor->name,
                ],

                'created_by' => $appointment->createdBy?->name,
                'has_visit'  => $appointment->visit !== null,
                'visit_id'   => $appointment->visit?->id,

                'allowed_transitions' => collect(
                    Appointment::TRANSITIONS[$appointment->status->value] ?? []
                )->map(fn($s) => [
                    'value' => $s,
                    'label' => AppointmentStatus::from($s)->label(),
                ]),

                'status_logs' => $appointment->statusLogs->map(fn($log) => [
                    'old_status' => $log->old_status,
                    'new_status' => $log->new_status,
                    'changed_by' => $log->changedBy?->name ?? 'النظام',
                    'changed_at' => $log->changed_at->format('Y-m-d H:i'),
                    'reason'     => $log->reason,
                ]),
            ],
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        $this->authorize('update', $appointment);

        if ($appointment->status->isTerminal()) {
            return redirect()->route('appointments.show', $appointment)
                ->with('error', 'لا يمكن تعديل موعد منتهٍ.');
        }

        $doctors = User::where('clinic_id', auth()->user()->clinic_id)
            ->doctors()
            ->orderBy('name')
            ->get(['id', 'name']);

        // Pre-load slots for the current doctor + date (excluding this appointment)
        $slots = $this->appointmentService->getAvailableSlots(
            User::find($appointment->doctor_id),
            $appointment->starts_at->toMutable(),
            excludeAppointmentId: $appointment->id,
        );

        return Inertia::render('Appointments/Edit', [
            'appointment' => [
                'id'         => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'patient'    => $appointment->patient->name,
                'doctor_id'  => $appointment->doctor_id,
                'starts_at'  => $appointment->starts_at->format('Y-m-d H:i'),
                'ends_at'    => $appointment->ends_at->format('Y-m-d H:i'),
                'type'       => $appointment->type,
                'notes'      => $appointment->notes,
            ],
            'doctors'     => $doctors,
            'defaultSlots' => $slots->values(),
        ]);
    }

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('update', $appointment);

        if ($appointment->status->isTerminal()) {
            return back()->withErrors(['status' => 'لا يمكن تعديل موعد منتهٍ.']);
        }

        $data = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:users,id'],
            'starts_at' => ['required', 'date'],
            'ends_at'   => ['required', 'date', 'after:starts_at'],
            'type'      => ['required', Rule::in(['booked', 'walk_in'])],
            'notes'     => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor    = User::findOrFail($data['doctor_id']);
        $available = $this->appointmentService->isSlotAvailable(
            $doctor,
            Carbon::parse($data['starts_at']),
            Carbon::parse($data['ends_at']),
            excludeId: $appointment->id,
        );

        if (! $available) {
            return back()->withErrors([
                'starts_at' => 'يوجد تعارض مع موعد آخر للطبيب في هذا الوقت.',
            ]);
        }

        $appointment->update($data);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'تم تحديث الموعد.');
    }

    public function updateStatus(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('update', $appointment);

        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Appointment::TRANSITIONS))],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        if ($data['status'] === AppointmentStatus::Cancelled->value) {
            $appointment->cancellation_reason = $data['reason'] ?? null;
            $appointment->save();
        }

        try {
            $appointment->transitionTo($data['status'], auth()->user());
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'تم تحديث حالة الموعد.');
    }

    /**
     * Calendar view — loads all appointments for the current week/month
     * as flat data; FullCalendar handles the rendering client-side.
     */
    public function calendar(Request $request): Response
    {
        $clinic = auth()->user()->clinic;

        // Load 60 days of appointments — enough for month view + buffer
        $appointments = Appointment::with(['patient', 'doctor'])
            ->when($request->doctor_id, fn($q) => $q->where('doctor_id', $request->doctor_id))
            ->whereBetween('starts_at', [
                now()->subDays(7),
                now()->addDays(60),
            ])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn(Appointment $a) => [
                'id'        => $a->id,
                'patient'   => $a->patient->name,
                'doctor'    => $a->doctor->name,
                'doctor_id' => $a->doctor_id,
                'starts_at' => $a->starts_at->toIso8601String(),
                'ends_at'   => $a->ends_at->toIso8601String(),
                'status'    => $a->status->value,
                'type'      => $a->type,
            ]);

        $doctors = User::where('clinic_id', $clinic->id)
            ->doctors()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Appointments/Calendar', [
            'appointments' => $appointments,
            'doctors'      => $doctors,
            'filters'      => $request->only(['doctor_id']),
        ]);
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $this->authorize('update', $appointment);

        if (! $appointment->status->isTerminal()) {
            return back()->withErrors([
                'status' => 'يجب إلغاء الموعد قبل حذفه.',
            ]);
        }

        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'تم حذف الموعد.');
    }
}
