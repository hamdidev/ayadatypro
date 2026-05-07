<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->when($request->search, fn($q) => $q->scopeSearch($request->search))
            ->when($request->gender, fn($q) => $q->where('gender', $request->gender))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn(Patient $p) => [
                'id'         => $p->id,
                'name'       => $p->name,
                'phone'      => $p->phone,
                'gender'     => $p->gender?->value,
                'age'        => $p->age,
                'blood_type' => $p->blood_type?->value,
                'created_at' => $p->created_at->diffForHumans(),
            ]);

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters'  => $request->only(['search', 'gender']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Patients/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'phone'              => ['nullable', 'string', 'max:20'],
            'national_id'        => ['nullable', 'string', 'max:20'],
            'dob'                => ['nullable', 'date', 'before:today'],
            'gender'             => ['nullable', Rule::in(['male', 'female'])],
            'blood_type'         => ['nullable', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'allergies'          => ['nullable', 'array'],
            'chronic_conditions' => ['nullable', 'array'],
            'notes'              => ['nullable', 'string', 'max:2000'],
        ]);

        $patient = Patient::create(array_merge($data, [
            'clinic_id' => auth()->user()->clinic_id,
        ]));

        return redirect()->route('patients.show', $patient)
            ->with('success', 'تم إضافة المريض بنجاح.');
    }

    public function show(Patient $patient): Response
    {
        $this->authorize('view', $patient);

        $patient->load([
            'appointments' => fn($q) => $q->with('doctor')->orderByDesc('starts_at')->limit(10),
            'visits'       => fn($q) => $q->with('doctor')->orderByDesc('created_at')->limit(5),
            'invoices'     => fn($q) => $q->orderByDesc('created_at')->limit(5),
        ]);

        return Inertia::render('Patients/Show', [
            'patient' => [
                'id'                  => $patient->id,
                'name'                => $patient->name,
                'phone'               => $patient->phone,
                'national_id'         => $patient->national_id,
                'dob'                 => $patient->dob?->format('Y-m-d'),
                'age'                 => $patient->age,
                'gender'              => $patient->gender?->value,
                'blood_type'          => $patient->blood_type?->value,
                'allergies'           => $patient->allergies,
                'chronic_conditions'  => $patient->chronic_conditions,
                'notes'               => $patient->notes,
                'created_at'          => $patient->created_at->format('Y-m-d'),

                'appointments' => $patient->appointments->map(fn($a) => [
                    'id'        => $a->id,
                    'doctor'    => $a->doctor->name,
                    'starts_at' => $a->starts_at->format('Y-m-d H:i'),
                    'status'    => $a->status->value,
                ]),

                'visits' => $patient->visits->map(fn($v) => [
                    'id'         => $v->id,
                    'doctor'     => $v->doctor->name,
                    'diagnosis'  => $v->full_diagnosis,
                    'created_at' => $v->created_at->format('Y-m-d'),
                    'is_signed'  => $v->is_signed,
                ]),

                'invoices' => $patient->invoices->map(fn($i) => [
                    'id'             => $i->id,
                    'invoice_number' => $i->invoice_number,
                    'total'          => $i->total,
                    'status'         => $i->status,
                    'created_at'     => $i->created_at->format('Y-m-d'),
                ]),
            ],
        ]);
    }

    public function edit(Patient $patient): Response
    {
        $this->authorize('update', $patient);

        return Inertia::render('Patients/Edit', [
            'patient' => [
                'id'                 => $patient->id,
                'name'               => $patient->name,
                'phone'              => $patient->phone,
                'national_id'        => $patient->national_id,
                'dob'                => $patient->dob?->format('Y-m-d'),
                'gender'             => $patient->gender?->value,
                'blood_type'         => $patient->blood_type?->value,
                'allergies'          => $patient->allergies,
                'chronic_conditions' => $patient->chronic_conditions,
                'notes'              => $patient->notes,
            ],
        ]);
    }

    public function update(Request $request, Patient $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'phone'              => ['nullable', 'string', 'max:20'],
            'national_id'        => ['nullable', 'string', 'max:20'],
            'dob'                => ['nullable', 'date', 'before:today'],
            'gender'             => ['nullable', Rule::in(['male', 'female'])],
            'blood_type'         => ['nullable', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'allergies'          => ['nullable', 'array'],
            'chronic_conditions' => ['nullable', 'array'],
            'notes'              => ['nullable', 'string', 'max:2000'],
        ]);

        $patient->update($data);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'تم تحديث بيانات المريض.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $this->authorize('delete', $patient);

        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', 'تم حذف المريض.');
    }
}
