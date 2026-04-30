<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect to Google OAuth consent screen.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the OAuth callback.
     *
     * - Existing user (by google_id or email) → log in immediately.
     * - New user → store Google data in session, redirect to clinic setup.
     */
    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            // Attach google_id if this was an email-only match
            if (! $user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }

            Auth::login($user);

            return redirect()->route('dashboard');
        }

        // New user — stash Google profile in session and prompt for clinic name
        session([
            'google_user' => [
                'name'      => $googleUser->getName(),
                'email'     => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar'    => $googleUser->getAvatar(),
            ],
        ]);

        return redirect()->route('register.clinic');
    }

    /**
     * Show the clinic setup form for new Google users.
     */
    public function clinicSetup(): Response|RedirectResponse
    {
        if (! session('google_user')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/ClinicSetup', [
            'googleUser' => session('google_user'),
        ]);
    }

    /**
     * Create the clinic + user from Google profile data.
     */
    public function clinicStore(Request $request): RedirectResponse
    {
        $googleData = session('google_user');

        if (! $googleData) {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'clinic_name' => ['required', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:20'],
        ]);

        $user = DB::transaction(function () use ($googleData, $data) {
            $clinic = Clinic::create([
                'name'              => $data['clinic_name'],
                'slug'              => Str::slug($data['clinic_name']) . '-' . Str::random(4),
                'subscription_plan' => 'free',
                'trial_ends_at'     => now()->addDays(14),
            ]);

            return User::create([
                'clinic_id' => $clinic->id,
                'name'      => $googleData['name'],
                'email'     => $googleData['email'],
                'google_id' => $googleData['google_id'],
                'avatar'    => $googleData['avatar'],
                'phone'     => $data['phone'] ?? null,
                'role'      => 'owner',
                'password'  => Hash::make(Str::random(32)),
            ]);
        });

        session()->forget('google_user');

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
