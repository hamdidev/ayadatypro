<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Mail\PatientMagicLink;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Visit;
use App\Services\PatientTokenService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class PatientPortalController extends Controller
{
    public function __construct(private readonly PatientTokenService $tokens) {}

    // ── Login form ──────────────────────────────────
    public function loginForm(): Response
    {
        return Inertia::render('Portal/Login', [
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    // ── Send magic link ─────────────────────────────
    public function sendLink(Request $request): RedirectResponse
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        // Rate-limit by IP: 5 attempts per 10 minutes
        $key = 'portal-login:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return back()->with(
                'error',
                "لقد تجاوزت الحد المسموح به. حاول مرة أخرى بعد {$seconds} ثانية."
            );
        }
        RateLimiter::hit($key, 600);

        $identifier = $request->identifier;

        // Global scope is a no-op without Laravel auth, but we call withoutGlobalScope
        // explicitly to make it clear we're intentionally searching cross-clinic.
        // We send a link to every matching patient so each clinic's record is accessible.
        $patients = Patient::withoutGlobalScope('clinic')
            ->where(function ($q) use ($identifier) {
                $q->where('phone', $identifier)
                    ->orWhere('email', $identifier);
            })
            ->with('clinic')
            ->get();

        foreach ($patients as $patient) {
            if (! $patient->email) {
                continue;
            }
            $token = $this->tokens->generate($patient);
            $magicUrl = $this->tokens->portalUrl($token);
            Mail::to($patient->email)
                ->queue(new PatientMagicLink($patient, $magicUrl, $patient->clinic->name));
        }

        // Always show the same message — don't reveal whether patient exists
        return back()->with(
            'status',
            'إذا كان بريدك أو هاتفك مسجلاً لدينا، ستصلك رسالة بالرابط قريباً.'
        );
    }

    // ── Verify token from email link ────────────────
    public function verify(Request $request, string $token): RedirectResponse
    {
        $patient = $this->tokens->validate($token);

        if (! $patient) {
            return redirect('/portal/login')
                ->with('error', 'الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
        }

        session([
            'patient_portal_id' => $patient->id,
            'patient_portal_name' => $patient->name,
            'patient_portal_clinic_id' => $patient->clinic_id,
        ]);

        return redirect('/portal/dashboard');
    }

    // ── Dashboard ───────────────────────────────────
    public function dashboard(): Response
    {
        $patientId = session('patient_portal_id');
        $clinicId = session('patient_portal_clinic_id');

        $patient = Patient::withoutGlobalScope('clinic')->findOrFail($patientId);

        $upcomingAppointments = Appointment::withoutGlobalScope('clinic')
            ->where('patient_id', $patientId)
            ->where('clinic_id', $clinicId)
            ->where('starts_at', '>=', now())
            ->where('status', '!=', 'cancelled')
            ->orderBy('starts_at')
            ->limit(5)
            ->with('doctor:id,name,specialty')
            ->get();

        $recentVisits = Visit::withoutGlobalScope('clinic')
            ->where('patient_id', $patientId)
            ->where('clinic_id', $clinicId)
            ->orderByDesc('created_at')
            ->limit(5)
            ->with('doctor:id,name')
            ->get();

        return Inertia::render('Portal/Dashboard', [
            'patient' => $patient->only('id', 'name', 'phone', 'email', 'dob', 'blood_type'),
            'upcomingAppointments' => $upcomingAppointments,
            'recentVisits' => $recentVisits,
        ]);
    }

    // ── Appointments list ───────────────────────────
    public function appointments(): Response
    {
        $patientId = session('patient_portal_id');
        $clinicId = session('patient_portal_clinic_id');

        $base = fn () => Appointment::withoutGlobalScope('clinic')
            ->where('patient_id', $patientId)
            ->where('clinic_id', $clinicId)
            ->with('doctor:id,name,specialty');

        return Inertia::render('Portal/Appointments', [
            'upcoming' => $base()
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->get(),
            'past' => $base()
                ->where('starts_at', '<', now())
                ->orderByDesc('starts_at')
                ->limit(20)
                ->get(),
        ]);
    }

    // ── Cancel appointment ──────────────────────────
    public function cancelAppointment(Request $request, int $id): RedirectResponse
    {
        $appointment = Appointment::withoutGlobalScope('clinic')
            ->where('id', $id)
            ->where('patient_id', session('patient_portal_id'))
            ->where('clinic_id', session('patient_portal_clinic_id'))
            ->where('starts_at', '>', now())
            ->firstOrFail();

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'تم إلغاء الموعد بنجاح.');
    }

    // ── Visit history ───────────────────────────────
    public function visits(): Response
    {
        $visits = Visit::withoutGlobalScope('clinic')
            ->where('patient_id', session('patient_portal_id'))
            ->where('clinic_id', session('patient_portal_clinic_id'))
            ->with(['doctor:id,name', 'prescriptions'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Portal/Visits', ['visits' => $visits]);
    }

    // ── Invoices ────────────────────────────────────
    public function invoices(): Response
    {
        $invoices = Invoice::withoutGlobalScope('clinic')
            ->where('patient_id', session('patient_portal_id'))
            ->where('clinic_id', session('patient_portal_clinic_id'))
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Portal/Invoices', ['invoices' => $invoices]);
    }

    // ── Logout ──────────────────────────────────────
    public function logout(): RedirectResponse
    {
        session()->forget(['patient_portal_id', 'patient_portal_name', 'patient_portal_clinic_id']);

        return redirect('/portal/login');
    }
}
