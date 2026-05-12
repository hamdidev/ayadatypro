<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Attachment;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Visit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
                'id'         => $v->id,
                'patient'    => $v->patient->name,
                'doctor'     => $v->doctor->name,
                'diagnosis'  => $v->full_diagnosis,
                'is_signed'  => $v->is_signed,
                'created_at' => $v->created_at->format('Y-m-d'),
                'follow_up'  => $v->follow_up_date?->format('Y-m-d'),
            ]);

        return Inertia::render('Visits/Index', ['visits' => $visits]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Visit::class);

        $appointment = null;

        if ($request->appointment_id) {
            $appointment = Appointment::with(['patient', 'doctor'])
                ->findOrFail($request->appointment_id);

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
        $this->authorize('create', Visit::class);

        $data = $request->validate([
            'appointment_id'      => ['nullable', 'exists:appointments,id'],
            'patient_id'          => ['required', 'exists:patients,id'],
            'doctor_id'           => ['required', 'exists:users,id'],
            'chief_complaint'     => ['nullable', 'string', 'max:500'],
            'diagnosis_free_text' => ['nullable', 'string', 'max:2000'],
            'diagnosis_code'      => ['nullable', 'string', 'max:10'],
            'notes'               => ['nullable', 'string'],
            'follow_up_date'      => ['nullable', 'date', 'after:today'],

            // Prescription (optional, created in same step)
            'prescription'                  => ['nullable', 'array'],
            'prescription.instructions'     => ['nullable', 'string', 'max:1000'],
            'prescription.items'            => ['nullable', 'array'],
            'prescription.items.*.medicine' => ['required_with:prescription.items', 'string', 'max:255'],
            'prescription.items.*.dosage'   => ['nullable', 'string', 'max:100'],
            'prescription.items.*.frequency' => ['nullable', 'string', 'max:100'],
            'prescription.items.*.duration' => ['nullable', 'string', 'max:100'],
        ]);

        $visit = Visit::create([
            'appointment_id'      => $data['appointment_id'] ?? null,
            'patient_id'          => $data['patient_id'],
            'doctor_id'           => $data['doctor_id'],
            'clinic_id'           => auth()->user()->clinic_id,
            'chief_complaint'     => $data['chief_complaint'] ?? null,
            'diagnosis_free_text' => $data['diagnosis_free_text'] ?? null,
            'diagnosis_code'      => $data['diagnosis_code'] ?? null,
            'notes'               => $data['notes'] ?? null,
            'follow_up_date'      => $data['follow_up_date'] ?? null,
        ]);

        // Create prescription if provided
        if (! empty($data['prescription']['items'])) {
            $prescription = Prescription::create([
                'visit_id'     => $visit->id,
                'patient_id'   => $visit->patient_id,
                'doctor_id'    => $visit->doctor_id,
                'instructions' => $data['prescription']['instructions'] ?? null,
                'issued_at'    => now(),
            ]);

            foreach ($data['prescription']['items'] as $item) {
                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_name'   => $item['medicine'],
                    'dosage'          => $item['dosage'] ?? null,
                    'frequency'       => $item['frequency'] ?? null,
                    'duration'        => $item['duration'] ?? null,
                ]);
            }
        }

        // Transition appointment to completed if in_progress
        if (isset($data['appointment_id'])) {
            $appointment = Appointment::find($data['appointment_id']);
            if ($appointment && $appointment->status->value === 'in_progress') {
                $appointment->transitionTo('completed', auth()->user());
            }
        }

        return redirect()->route('visits.show', $visit)
            ->with('success', 'تم إنشاء سجل الزيارة.');
    }

    public function show(Visit $visit): Response
    {
        $this->authorize('view', $visit);

        $visit->load([
            'patient',
            'doctor',
            'appointment',
            'signedBy',
            'prescriptions.items',
            'attachments',
        ]);

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

                'patient'         => ['id' => $visit->patient->id, 'name' => $visit->patient->name],
                'doctor'          => ['id' => $visit->doctor->id,  'name' => $visit->doctor->name],
                'appointment_id'  => $visit->appointment_id,

                'can_edit'   => auth()->user()->can('update', $visit),
                'can_sign'   => auth()->user()->can('sign', $visit),
                'can_delete' => auth()->user()->can('delete', $visit),

                'prescriptions' => $visit->prescriptions->map(fn(Prescription $p) => [
                    'id'           => $p->id,
                    'instructions' => $p->instructions,
                    'issued_at'    => $p->issued_at?->format('Y-m-d'),
                    'items'        => $p->items->map(fn(PrescriptionItem $i) => [
                        'id'           => $i->id,
                        'medicine_name' => $i->medicine_name,
                        'dosage'       => $i->dosage,
                        'frequency'    => $i->frequency,
                        'duration'     => $i->duration,
                    ]),
                ]),

                'attachments' => $visit->attachments->map(fn(Attachment $a) => [
                    'id'            => $a->id,
                    'label'         => $a->label,
                    'original_name' => $a->original_name,
                    'file_type'     => $a->file_type,
                    'file_size'     => $a->file_size,
                    'url'           => Storage::disk('public')->url($a->file_path),
                ]),
            ],
        ]);
    }

    public function edit(Visit $visit): Response|RedirectResponse
    {
        $this->authorize('update', $visit);

        $visit->load(['patient', 'prescriptions.items']);

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

                'prescription' => $visit->prescriptions->first() ? [
                    'instructions' => $visit->prescriptions->first()->instructions,
                    'items'        => $visit->prescriptions->first()->items->map(fn($i) => [
                        'medicine'  => $i->medicine_name,
                        'dosage'    => $i->dosage,
                        'frequency' => $i->frequency,
                        'duration'  => $i->duration,
                    ]),
                ] : null,
            ],
        ]);
    }

    public function update(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorize('update', $visit);

        $data = $request->validate([
            'chief_complaint'     => ['nullable', 'string', 'max:500'],
            'diagnosis_free_text' => ['nullable', 'string', 'max:2000'],
            'diagnosis_code'      => ['nullable', 'string', 'max:10'],
            'notes'               => ['nullable', 'string'],
            'follow_up_date'      => ['nullable', 'date', 'after:today'],

            'prescription'                  => ['nullable', 'array'],
            'prescription.instructions'     => ['nullable', 'string', 'max:1000'],
            'prescription.items'            => ['nullable', 'array'],
            'prescription.items.*.medicine' => ['required_with:prescription.items', 'string', 'max:255'],
            'prescription.items.*.dosage'   => ['nullable', 'string', 'max:100'],
            'prescription.items.*.frequency' => ['nullable', 'string', 'max:100'],
            'prescription.items.*.duration' => ['nullable', 'string', 'max:100'],
        ]);

        $visit->update([
            'chief_complaint'     => $data['chief_complaint'] ?? null,
            'diagnosis_free_text' => $data['diagnosis_free_text'] ?? null,
            'diagnosis_code'      => $data['diagnosis_code'] ?? null,
            'notes'               => $data['notes'] ?? null,
            'follow_up_date'      => $data['follow_up_date'] ?? null,
        ]);

        // Replace prescription
        if (isset($data['prescription'])) {
            $visit->prescriptions()->delete();

            if (! empty($data['prescription']['items'])) {
                $prescription = Prescription::create([
                    'visit_id'     => $visit->id,
                    'patient_id'   => $visit->patient_id,
                    'doctor_id'    => $visit->doctor_id,
                    'instructions' => $data['prescription']['instructions'] ?? null,
                    'issued_at'    => now(),
                ]);

                foreach ($data['prescription']['items'] as $item) {
                    PrescriptionItem::create([
                        'prescription_id' => $prescription->id,
                        'medicine_name'   => $item['medicine'],
                        'dosage'          => $item['dosage'] ?? null,
                        'frequency'       => $item['frequency'] ?? null,
                        'duration'        => $item['duration'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('visits.show', $visit)
            ->with('success', 'تم تحديث سجل الزيارة.');
    }

    public function sign(Visit $visit): RedirectResponse
    {
        $this->authorize('update', $visit);

        if ($visit->is_signed) {
            return back()->with('error', 'الزيارة موقّعة بالفعل.');
        }

        $visit->sign(Auth::id());

        return back()->with('success', 'تم توقيع الزيارة بنجاح.');
    }

    public function destroy(Visit $visit): RedirectResponse
    {
        $this->authorize('delete', $visit);

        $patientId = $visit->patient_id;
        $visit->delete();

        return redirect()->route('patients.show', $patientId)
            ->with('success', 'تم حذف سجل الزيارة.');
    }

    // ─────────────────────────────────────────────────────────────
    // ATTACHMENTS
    // ─────────────────────────────────────────────────────────────

    public function uploadAttachment(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorize('update', $visit);

        $data = $request->validate([
            'file'  => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $file = $request->file('file');
        $path = $file->store("attachments/{$visit->clinic_id}", 'public');

        Attachment::create([
            'patient_id'    => $visit->patient_id,
            'clinic_id'     => $visit->clinic_id,
            'visit_id'      => $visit->id,
            'file_path'     => $path,
            'file_type'     => $file->getMimeType(),
            'original_name' => $file->getClientOriginalName(),
            'label'         => $data['label'] ?? null,
            'file_size'     => $file->getSize(),
        ]);

        return back()->with('success', 'تم رفع الملف بنجاح.');
    }

    public function deleteAttachment(Visit $visit, Attachment $attachment): RedirectResponse
    {
        $this->authorize('update', $visit);

        abort_unless($attachment->visit_id === $visit->id, 403);

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'تم حذف الملف.');
    }
}
