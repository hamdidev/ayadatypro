<?php

// app/Http/Controllers/OnboardingController.php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(): Response|RedirectResponse
    {
        $clinic = auth()->user()->clinic;

        if ($clinic->is_setup_complete) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/Index', [
            'user' => [
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ],
            // Pre-fill anything we already know
            'clinic' => [
                'name' => $clinic->name,
                'phone' => $clinic->phone,
                'specialty' => $clinic->specialty,
                'address' => $clinic->address,
                'timezone' => $clinic->timezone,
                'currency' => $clinic->currency,
                'week_start' => $clinic->week_start,
            ],
            'settings' => [
                'appointment_duration' => $clinic->settings?->appointment_duration ?? 20,
                'buffer_time' => $clinic->settings?->buffer_time ?? 5,
                'allow_online_booking' => $clinic->settings?->allow_online_booking ?? true,
                'require_approval_for_new_patients' => $clinic->settings?->require_approval_for_new_patients ?? false,
            ],
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            // Step 1 — Clinic identity
            'clinic_name' => ['required', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],

            // Step 2 — Localization
            'timezone' => ['required', 'string', 'timezone'],
            'currency' => ['required', 'string', 'size:3'],
            'week_start' => ['required', Rule::in(['saturday', 'sunday', 'monday'])],

            // Step 3 — Appointment settings
            'appointment_duration' => ['required', 'integer', 'min:5', 'max:120'],
            'buffer_time' => ['required', 'integer', 'min:0', 'max:60'],
            'allow_online_booking' => ['boolean'],
            'require_approval_for_new_patients' => ['boolean'],
        ]);

        $clinic = auth()->user()->clinic;

        // Update clinic
        $clinic->update([
            'name' => $data['clinic_name'],
            'slug' => $this->resolveSlug($clinic, $data['clinic_name']),
            'specialty' => $data['specialty'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'timezone' => $data['timezone'],
            'currency' => $data['currency'],
            'week_start' => $data['week_start'],
            'is_setup_complete' => true,
        ]);

        // Update or create settings
        $clinic->settings()->updateOrCreate(
            ['clinic_id' => $clinic->id],
            [
                'appointment_duration' => $data['appointment_duration'],
                'buffer_time' => $data['buffer_time'],
                'allow_online_booking' => $request->boolean('allow_online_booking'),
                'require_approval_for_new_patients' => $request->boolean('require_approval_for_new_patients'),
            ]
        );

        return redirect()->route('dashboard')
            ->with('success', 'تم إعداد العيادة بنجاح! مرحباً بك في AyadatyPro 🎉');
    }

    /**
     * Keep the existing slug if the name hasn't changed,
     * otherwise generate a new unique one.
     */
    private function resolveSlug($clinic, string $newName): string
    {
        $newBase = Str::slug($newName);
        $oldBase = Str::slug($clinic->name);

        if ($newBase === $oldBase) {
            return $clinic->slug;
        }

        $slug = $newBase;
        $i = 1;

        while (Clinic::where('slug', $slug)->where('id', '!=', $clinic->id)->exists()) {
            $slug = $newBase.'-'.$i++;
        }

        return $slug;
    }
}
