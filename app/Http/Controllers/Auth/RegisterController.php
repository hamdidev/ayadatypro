<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeClinicMail;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'termsVersion' => config('app.terms_version', '1.0'),
            'privacyVersion' => config('app.privacy_version', '1.0'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // No clinic_name — collected during onboarding after registration
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'terms_accepted' => ['required', 'accepted'],
            'privacy_accepted' => ['required', 'accepted'],
        ]);

        try {
            $user = DB::transaction(function () use ($data, $request) {
                // Auto-generate clinic name from user's name.
                // Owner renames it during onboarding.
                $clinic = Clinic::create([
                    'name' => 'عيادة '.$data['name'],
                    'slug' => $this->generateUniqueSlug($data['name']),
                    'phone' => $data['phone'] ?? null,
                    'subscription_plan' => config('clinics.default_plan', 'free'),
                    'trial_ends_at' => now()->addDays(config('clinics.trial_days', 14)),
                    'timezone' => config('app.timezone', 'Asia/Riyadh'),
                    'locale' => config('app.locale', 'ar'),
                    'currency' => 'SAR',
                    'week_start' => 'saturday',
                    'is_setup_complete' => false, // triggers onboarding redirect
                ]);

                $user = User::create([
                    'clinic_id' => $clinic->id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => $data['password'],
                    'phone' => $data['phone'] ?? null,
                    'role' => 'owner',
                ]);

                // GDPR consent record
                $user->consents()->create([
                    'terms_version' => config('app.terms_version', '1.0'),
                    'privacy_version' => config('app.privacy_version', '1.0'),
                    'accepted_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return $user;
            });

            Mail::to($user)->queue(new WelcomeClinicMail($user, $user->clinic));

            Auth::login($user);

            // EnsureClinicIsSetup middleware catches is_setup_complete = false
            // and redirects to onboarding automatically
            return redirect()->route('dashboard');
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') {
                return back()->withErrors([
                    'email' => 'هذا البريد الإلكتروني مسجل مسبقاً.',
                ])->withInput($request->except('password', 'password_confirmation'));
            }

            Log::error('Registration DB error', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'server' => 'تعذّر إنشاء الحساب. يرجى المحاولة مجدداً.',
            ]);
        } catch (\Exception $e) {
            Log::error('Registration unexpected error', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'server' => 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.',
            ]);
        }
    }

    private function generateUniqueSlug(string $name, int $maxAttempts = 5): string
    {
        $base = Str::slug($name);

        for ($i = 0; $i < $maxAttempts; $i++) {
            $slug = $i === 0 ? $base : $base.'-'.Str::random(4);
            if (! Clinic::where('slug', $slug)->exists()) {
                return $slug;
            }
        }

        return $base.'-'.time();
    }
}
