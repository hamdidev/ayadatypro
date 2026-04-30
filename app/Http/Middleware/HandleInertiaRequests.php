<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use League\Flysystem\AwsS3V3\AwsS3V3Adapter;
use Illuminate\Support\Facades\Storage;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        // Eager load clinic once to prevent N+1 on every Inertia request
        if ($request->user()) {
            $request->user()->loadMissing('clinic');
        }

        $user   = $request->user();
        $clinic = $user?->clinic;

        return array_merge(parent::share($request), [

            // ── Auth ─────────────────────────────────────────────
            'auth' => [
                'user' => $user ? [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'avatar' => $this->formatAvatarUrl($user),
                    'role'   => $user->role, // fine — user knows their own role

                    // Capability flags — use these in the frontend
                    // instead of branching on raw role strings
                    'can' => [
                        'manage_clinic'     => $user->isOwner(),
                        'manage_staff'      => $user->isOwner(),
                        'see_finances'      => $user->isOwner(),
                        'book_appointments' => true, // all roles
                        'view_patients'     => true, // all roles
                        'write_visit_notes' => $user->isDoctor(),
                    ],
                ] : null,
            ],

            // ── Clinic ───────────────────────────────────────────
            // ⚠️  subscription_plan is intentionally excluded here.
            // Entitlement checks happen server-side on every action.
            // Fetch billing details via a dedicated API route when needed.
            'clinic' => $clinic ? [
                'id'   => $clinic->id,
                'name' => $clinic->name,
                'slug' => $clinic->slug,
            ] : null,

            // ── Flash messages ────────────────────────────────────
            // pull() clears after first read — prevents duplicate toasts
            'flash' => [
                'success' => $request->session()->pull('success'),
                'error'   => $request->session()->pull('error'),
                'warning' => $request->session()->pull('warning'),
                'info'    => $request->session()->pull('info'),
            ],

            // ── Locale & timezone ─────────────────────────────────
            // TODO: add locale + timezone columns to users migration (Phase 5)
            // Safe for now — missing columns return null → falls back to config
            'locale'   => $user?->locale   ?? config('app.locale'),
            'timezone' => $user?->timezone ?? config('app.timezone'),

            // ── Feature flags ─────────────────────────────────────
            // Checked client-side for UI only — never trust for server actions
            'features' => [
                'multi_branch'  => $clinic?->subscription_plan === 'chain',
                'sms_reminders' => filled(config('services.vonage.key')),
                'new_dashboard' => false, // example A/B flag
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private function formatAvatarUrl($user): ?string
    {
        if (! $user->avatar) {
            // No avatar — let the frontend render initials
            return null;
        }

        // Google OAuth avatar — already a full URL
        if (str_starts_with($user->avatar, 'http')) {
            return $user->avatar;
        }

        // Public disk (local uploads)
        if (str_starts_with($user->avatar, 'avatars/')) {
            return Storage::disk('public')->url($user->avatar);
        }

        // Private disk — temporaryUrl only works on S3-compatible drivers
        $disk = Storage::disk('private');
        if ($disk->getAdapter() instanceof AwsS3V3Adapter) {
            try {
                return $disk->temporaryUrl($user->avatar, now()->addHour());
            } catch (\Exception) {
                return null;
            }
        }

        // Local private disk — no signed URL support; return null
        // and let the frontend show initials
        return null;
    }
}
