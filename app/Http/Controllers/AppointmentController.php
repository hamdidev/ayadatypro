<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $appointments = Appointment::with(['patient', 'doctor'])
            ->when($request->date, fn($q) => $q->whereDate('starts_at', $request->date))
            ->when($request->doctor_id, fn($q) => $q->where('doctor_id', $request->doctor_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when(! $request->date && ! $request->status, fn($q) => $q->whereDate('starts_at', '>=', today()))
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
        $doctors = User::where('clinic_id', auth()->user()->clinic_id)
            ->doctors()
            ->orderBy('name')
            ->get(['id', 'name', 'specialty']);

        // Pre-select patient if coming from patient profile
        $patient = null;
        if ($request->patient_id) {
            $patient = Patient::find($request->patient_id, ['id', 'name', 'phone']);
        }

        return Inertia::render('Appointments/Create', [
            'doctors'        => $doctors,
            'preselectedPatient' => $patient,
            'defaultDate'    => $request->date ?? today()->format('Y-m-d'),
            'slotDuration'   => auth()->user()->clinic->settings?->appointment_duration ?? 20,
        ]);
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

        // Check for conflicts before saving
        // (Appointment model also validates on saving hook)
        $conflict = Appointment::withoutGlobalScope('clinic')
            ->scopeConflictingWith(
                query: Appointment::query(),
                doctorId: $data['doctor_id'],
                starts: now()->parse($data['starts_at']),
                ends: now()->parse($data['ends_at']),
            )->exists();

        if ($conflict) {
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
                'id'         => $appointment->id,
                'status'     => $appointment->status->value,
                'status_badge' => $appointment->status_badge,
                'type'       => $appointment->type,
                'starts_at'  => $appointment->starts_at->format('Y-m-d H:i'),
                'ends_at'    => $appointment->ends_at->format('H:i'),
                'duration'   => $appointment->duration_minutes,
                'notes'      => $appointment->notes,
                'is_past'    => $appointment->isPast(),

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

                'has_visit' => $appointment->visit !== null,
                'visit_id'  => $appointment->visit?->id,

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
            'doctors' => $doctors,
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

        // Conflict check excluding this appointment
        $conflict = Appointment::query()
            ->scopeConflictingWith(
                query: Appointment::query(),
                doctorId: $data['doctor_id'],
                starts: now()->parse($data['starts_at']),
                ends: now()->parse($data['ends_at']),
                excludeId: $appointment->id,
            )->exists();

        if ($conflict) {
            return back()->withErrors([
                'starts_at' => 'يوجد تعارض مع موعد آخر للطبيب في هذا الوقت.',
            ]);
        }

        $appointment->update($data);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'تم تحديث الموعد.');
    }

    /**
     * Transition appointment status via state machine.
     */
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
