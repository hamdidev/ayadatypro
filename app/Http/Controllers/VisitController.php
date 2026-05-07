<?php
// app/Http/Controllers/VisitController.php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function index(): Response
    {
        $visits = Visit::with(['patient', 'doctor'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn(Visit $v) => [
                'id'          => $v->id,
                'patient'     => $v->patient->name,
                'doctor'      => $v->doctor->name,
                'diagnosis'   => $v->full_diagnosis,
                'is_signed'   => $v->is_signed,
                'created_at'  => $v->created_at->format('Y-m-d'),
                'follow_up'   => $v->follow_up_date?->format('Y-m-d'),
            ]);

        return Inertia::render('Visits/Index', [
            'visits' => $visits,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $appointment = null;

        if ($request->appointment_id) {
            $appointment = Appointment::with(['patient', 'doctor'])
                ->findOrFail($request->appointment_id);

            // Guard: only in_progress or completed appointments
            if (! in_array($appointment->status->value, ['in_progress', 'completed'])) {
                return redirect()->route('appointments.show', $appointment)
                    ->with('error', 'لا يمكن إنشاء زيارة لموعد لم يبدأ بعد.');
            }
        }

        return Inertia::render('Visits/Create', [
            'appointment' => $appointment ? [
                'id'      => $appointment->id,
                'patient' => ['id' => $appointment->patient->id, 'name' => $appointment->patient->name],
                'doctor'  => ['id' => $appointment->doctor->id,  'name' => $appointment->doctor->name],
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'appointment_id'     => ['nullable', 'exists:appointments,id'],
            'patient_id'         => ['required', 'exists:patients,id'],
            'doctor_id'          => ['required', 'exists:users,id'],
            'chief_complaint'    => ['nullable', 'string', 'max:500'],
            'diagnosis_free_text' => ['nullable', 'string', 'max:2000'],
            'diagnosis_code'     => ['nullable', 'string', 'max:10'],
            'notes'              => ['nullable', 'string'],
            'follow_up_date'     => ['nullable', 'date', 'after:today'],
        ]);

        $visit = Visit::create(array_merge($data, [
            'clinic_id' => auth()->user()->clinic_id,
        ]));

        // Transition appointment to completed if not already
        if ($visit->appointment && $visit->appointment->status->value === 'in_progress') {
            $visit->appointment->transitionTo('completed', auth()->user());
        }

        return redirect()->route('visits.show', $visit)
            ->with('success', 'تم إنشاء سجل الزيارة.');
    }

    public function show(Visit $visit): Response
    {
        $visit->load(['patient', 'doctor', 'appointment', 'prescriptions', 'attachments', 'signedBy']);

        return Inertia::render('Visits/Show', [
            'visit' => [
                'id'                  => $visit->id,
                'chief_complaint'     => $visit->chief_complaint,
                'diagnosis_code'      => $visit->diagnosis_code,
                'diagnosis_free_text' => $visit->diagnosis_free_text,
                'full_diagnosis'      => $visit->full_diagnosis,
                'notes'               => $visit->notes,
                'follow_up_date'      => $visit->follow_up_date?->format('Y-m-d'),
                'is_signed'           => $visit->is_signed,
                'signed_at'           => $visit->signed_at?->format('Y-m-d H:i'),
                'signed_by'           => $visit->signedBy?->name,
                'created_at'          => $visit->created_at->format('Y-m-d H:i'),

                'patient' => [
                    'id'   => $visit->patient->id,
                    'name' => $visit->patient->name,
                ],
                'doctor' => [
                    'id'   => $visit->doctor->id,
                    'name' => $visit->doctor->name,
                ],
                'appointment_id' => $visit->appointment_id,

                'prescriptions' => $visit->prescriptions->map(fn($p) => [
                    'id'           => $p->id,
                    'instructions' => $p->instructions,
                    'issued_at'    => $p->issued_at?->format('Y-m-d'),
                ]),

                'attachments' => $visit->attachments->map(fn($a) => [
                    'id'            => $a->id,
                    'label'         => $a->label,
                    'original_name' => $a->original_name,
                    'file_type'     => $a->file_type,
                ]),
            ],
        ]);
    }

    public function edit(Visit $visit): Response|RedirectResponse
    {
        if ($visit->is_signed) {
            return redirect()->route('visits.show', $visit)
                ->with('error', 'لا يمكن تعديل زيارة موقّعة.');
        }

        return Inertia::render('Visits/Edit', [
            'visit' => [
                'id'                  => $visit->id,
                'patient_id'          => $visit->patient_id,
                'patient'             => $visit->patient->name,
                'doctor_id'           => $visit->doctor_id,
                'chief_complaint'     => $visit->chief_complaint,
                'diagnosis_code'      => $visit->diagnosis_code,
                'diagnosis_free_text' => $visit->diagnosis_free_text,
                'notes'               => $visit->notes,
                'follow_up_date'      => $visit->follow_up_date?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(Request $request, Visit $visit): RedirectResponse
    {
        if ($visit->is_signed) {
            return back()->withErrors(['visit' => 'لا يمكن تعديل زيارة موقّعة.']);
        }

        $data = $request->validate([
            'chief_complaint'     => ['nullable', 'string', 'max:500'],
            'diagnosis_free_text' => ['nullable', 'string', 'max:2000'],
            'diagnosis_code'      => ['nullable', 'string', 'max:10'],
            'notes'               => ['nullable', 'string'],
            'follow_up_date'      => ['nullable', 'date', 'after:today'],
        ]);

        $visit->update($data);

        return redirect()->route('visits.show', $visit)
            ->with('success', 'تم تحديث سجل الزيارة.');
    }

    /**
     * Sign (lock) the visit note.
     */
    public function sign(Visit $visit): RedirectResponse
    {
        $this->authorize('update', $visit);

        try {
            $visit->sign(auth()->user());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['visit' => $e->getMessage()]);
        }

        return back()->with('success', 'تم توقيع سجل الزيارة وإقفاله.');
    }

    public function destroy(Visit $visit): RedirectResponse
    {
        if ($visit->is_signed) {
            return back()->withErrors(['visit' => 'لا يمكن حذف زيارة موقّعة.']);
        }

        $visit->delete();

        return redirect()->route('patients.show', $visit->patient_id)
            ->with('success', 'تم حذف سجل الزيارة.');
    }
}
