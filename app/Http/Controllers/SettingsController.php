<?php

namespace App\Http\Controllers;

use App\Models\DoctorSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    // ─────────────────────────────────────────────────────────────
    // CLINIC PROFILE
    // ─────────────────────────────────────────────────────────────

    public function clinic(): Response
    {
        $this->authorize('manage-clinic');

        $clinic = auth()->user()->clinic->load('settings');

        return Inertia::render('Settings/Clinic', [
            'clinic' => [
                'name'      => $clinic->name,
                'slug'      => $clinic->slug,
                'phone'     => $clinic->phone,
                'address'   => $clinic->address,
                'specialty' => $clinic->specialty,
                'logo'      => $clinic->logo
                    ? Storage::disk('public')->url($clinic->logo)
                    : null,
                'timezone'   => $clinic->timezone,
                'currency'   => $clinic->currency,
                'week_start' => $clinic->week_start,
                'locale'     => $clinic->locale,
            ],
            'settings' => [
                'appointment_duration'              => $clinic->settings?->appointment_duration ?? 20,
                'buffer_time'                       => $clinic->settings?->buffer_time ?? 5,
                'allow_online_booking'              => $clinic->settings?->allow_online_booking ?? true,
                'require_approval_for_new_patients' => $clinic->settings?->require_approval_for_new_patients ?? false,
            ],
        ]);
    }

    public function updateClinic(Request $request): RedirectResponse
    {
        $this->authorize('manage-clinic');

        $clinic = auth()->user()->clinic;

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'phone'     => ['nullable', 'string', 'max:20'],
            'address'   => ['nullable', 'string', 'max:500'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'timezone'  => ['required', 'string', 'timezone'],
            'currency'  => ['required', 'string', 'size:3'],
            'week_start' => ['required', Rule::in(['saturday', 'sunday', 'monday'])],
            'logo'      => ['nullable', 'image', 'max:2048'],

            // Appointment settings
            'appointment_duration'              => ['required', 'integer', 'min:5', 'max:120'],
            'buffer_time'                       => ['required', 'integer', 'min:0', 'max:60'],
            'allow_online_booking'              => ['boolean'],
            'require_approval_for_new_patients' => ['boolean'],
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($clinic->logo) {
                Storage::disk('public')->delete($clinic->logo);
            }
            $data['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $clinic->update([
            'name'      => $data['name'],
            'phone'     => $data['phone'] ?? null,
            'address'   => $data['address'] ?? null,
            'specialty' => $data['specialty'] ?? null,
            'timezone'  => $data['timezone'],
            'currency'  => $data['currency'],
            'week_start' => $data['week_start'],
            'logo'      => $data['logo'] ?? $clinic->logo,
        ]);

        $clinic->settings()->updateOrCreate(
            ['clinic_id' => $clinic->id],
            [
                'appointment_duration'              => $data['appointment_duration'],
                'buffer_time'                       => $data['buffer_time'],
                'allow_online_booking'              => $request->boolean('allow_online_booking'),
                'require_approval_for_new_patients' => $request->boolean('require_approval_for_new_patients'),
            ]
        );

        return back()->with('success', 'تم حفظ إعدادات العيادة.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEAM MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    public function team(): Response
    {
        $this->authorize('manage-staff');

        $clinic = auth()->user()->clinic;

        $staff = User::where('clinic_id', $clinic->id)
            ->orderBy('role')
            ->orderBy('name')
            ->get()
            ->map(fn(User $u) => [
                'id'        => $u->id,
                'name'      => $u->name,
                'email'     => $u->email,
                'role'      => $u->role,
                'specialty' => $u->specialty,
                'phone'     => $u->phone,
                'is_active' => $u->is_active,
                'avatar'    => $u->avatar,
                'is_me'     => $u->id === auth()->id(),
            ]);

        return Inertia::render('Settings/Team', [
            'staff'         => $staff,
            'canAddDoctor'  => $clinic->canAddDoctor(),
            'plan'          => $clinic->subscription_plan,
        ]);
    }

    public function inviteStaff(Request $request): RedirectResponse
    {
        $this->authorize('manage-staff');

        $clinic = auth()->user()->clinic;

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'role'      => ['required', Rule::in(['doctor', 'receptionist'])],
            'specialty' => ['nullable', 'string', 'max:100'],
            'phone'     => ['nullable', 'string', 'max:20'],
        ]);

        // Enforce plan doctor limit
        if ($data['role'] === 'doctor' && ! $clinic->canAddDoctor()) {
            return back()->withErrors([
                'role' => 'وصلت إلى الحد الأقصى لعدد الأطباء في خطتك الحالية.',
            ]);
        }

        // Create staff account with a temporary password
        // They should reset it via forgot password flow
        $tempPassword = \Illuminate\Support\Str::random(12);

        User::create([
            'clinic_id' => $clinic->id,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $tempPassword,
            'role'      => $data['role'],
            'specialty' => $data['specialty'] ?? null,
            'phone'     => $data['phone'] ?? null,
            'is_active' => true,
        ]);

        // TODO Phase 3: Send invitation email with password reset link
        // Mail::to($data['email'])->queue(new StaffInvitationMail($user, $clinic));

        return back()->with('success', "تم إضافة {$data['name']} إلى فريق العيادة.");
    }

    public function updateStaff(Request $request, User $user): RedirectResponse
    {
        $this->authorize('manage-staff');

        // Ensure user belongs to same clinic
        abort_unless($user->clinic_id === auth()->user()->clinic_id, 403);

        // Can't edit yourself here — use profile settings
        abort_if($user->id === auth()->id(), 403);

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'role'      => ['required', Rule::in(['doctor', 'receptionist'])],
            'specialty' => ['nullable', 'string', 'max:100'],
            'phone'     => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $user->update($data);

        return back()->with('success', 'تم تحديث بيانات الموظف.');
    }

    public function removeStaff(User $user): RedirectResponse
    {
        $this->authorize('manage-staff');

        abort_unless($user->clinic_id === auth()->user()->clinic_id, 403);
        abort_if($user->id === auth()->id(), 403, 'لا يمكنك حذف حسابك الخاص.');
        abort_if($user->isOwner(), 403, 'لا يمكن حذف صاحب العيادة.');

        // Soft-delete or deactivate — never hard delete (appointments reference this user)
        $user->update(['is_active' => false]);

        return back()->with('success', 'تم تعطيل حساب الموظف.');
    }

    // ─────────────────────────────────────────────────────────────
    // SCHEDULE (Doctor working hours)
    // ─────────────────────────────────────────────────────────────

    public function schedule(): Response
    {
        $clinic  = auth()->user()->clinic;
        $user    = auth()->user();

        // Owners see all doctors; doctors see only their own schedule
        $doctors = $user->isOwner()
            ? User::where('clinic_id', $clinic->id)->doctors()->get(['id', 'name'])
            : collect([$user->only(['id', 'name'])]);

        $schedules = DoctorSchedule::where('clinic_id', $clinic->id)
            ->when(! $user->isOwner(), fn($q) => $q->where('doctor_id', $user->id))
            ->get()
            ->groupBy('doctor_id')
            ->map(fn($slots) => $slots->map(fn(DoctorSchedule $s) => [
                'id'           => $s->id,
                'day_of_week'  => $s->day_of_week,
                'day_name'     => $s->day_name,
                'start_time'   => $s->start_time,
                'end_time'     => $s->end_time,
                'slot_minutes' => $s->slot_minutes,
                'is_active'    => $s->is_active,
            ]));

        return Inertia::render('Settings/Schedule', [
            'doctors'   => $doctors,
            'schedules' => $schedules,
            'days'      => DoctorSchedule::DAYS_AR,
        ]);
    }

    public function updateSchedule(Request $request): RedirectResponse
    {
        $clinic = auth()->user()->clinic;
        $user   = auth()->user();

        $data = $request->validate([
            'doctor_id'           => ['required', 'exists:users,id'],
            'slots'               => ['required', 'array'],
            'slots.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'slots.*.start_time'  => ['required', 'date_format:H:i'],
            'slots.*.end_time'    => ['required', 'date_format:H:i', 'after:slots.*.start_time'],
            'slots.*.slot_minutes' => ['required', 'integer', 'min:5', 'max:120'],
            'slots.*.is_active'   => ['boolean'],
        ]);

        // Doctors can only update their own schedule
        if ($user->isDoctor() && $data['doctor_id'] != $user->id) {
            abort(403, 'لا يمكنك تعديل جدول طبيب آخر.');
        }

        // Ensure doctor belongs to same clinic
        $doctor = User::where('id', $data['doctor_id'])
            ->where('clinic_id', $clinic->id)
            ->firstOrFail();

        // Replace all schedule slots for this doctor
        DoctorSchedule::where('doctor_id', $doctor->id)
            ->where('clinic_id', $clinic->id)
            ->delete();

        foreach ($data['slots'] as $slot) {
            DoctorSchedule::create([
                'doctor_id'    => $doctor->id,
                'clinic_id'    => $clinic->id,
                'day_of_week'  => $slot['day_of_week'],
                'start_time'   => $slot['start_time'],
                'end_time'     => $slot['end_time'],
                'slot_minutes' => $slot['slot_minutes'],
                'is_active'    => $slot['is_active'] ?? true,
            ]);
        }

        return back()->with('success', 'تم حفظ جدول العمل.');
    }

    // ─────────────────────────────────────────────────────────────
    // BILLING (read-only in Phase 1)
    // ─────────────────────────────────────────────────────────────

    public function billing(): Response
    {
        $this->authorize('manage-clinic');

        $clinic = auth()->user()->clinic->load('activeSubscription');

        return Inertia::render('Settings/Billing', [
            'plan'          => $clinic->subscription_plan,
            'trialEndsAt'   => $clinic->trial_ends_at?->format('Y-m-d'),
            'isOnTrial'     => $clinic->trial_ends_at?->isFuture() ?? false,
            'subscription'  => $clinic->activeSubscription ? [
                'status'    => $clinic->activeSubscription->status,
                'ends_at'   => $clinic->activeSubscription->ends_at?->format('Y-m-d'),
            ] : null,
            'plans' => [
                [
                    'key'      => 'free',
                    'name'     => 'مجاني',
                    'price'    => 0,
                    'currency' => 'USD',
                    'features' => ['طبيب واحد', '50 موعد شهرياً', 'سجلات المرضى', 'الفواتير الأساسية'],
                ],
                [
                    'key'      => 'clinic',
                    'name'     => 'عيادة',
                    'price'    => 99,
                    'currency' => 'USD',
                    'features' => ['3 أطباء', 'مواعيد غير محدودة', 'حجز إلكتروني', 'تقارير متقدمة'],
                ],
                [
                    'key'      => 'chain',
                    'name'     => 'سلسلة',
                    'price'    => 299,
                    'currency' => 'USD',
                    'features' => ['أطباء غير محدودين', 'فروع متعددة', 'لوحة مركزية', 'دعم مخصص'],
                ],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // PROFILE (current user's own account)
    // ─────────────────────────────────────────────────────────────

    public function profile(): Response
    {
        $user = auth()->user();

        return Inertia::render('Settings/Profile', [
            'user' => [
                'name'      => $user->name,
                'email'     => $user->email,
                'phone'     => $user->phone,
                'specialty' => $user->specialty,
                'avatar'    => $user->avatar,
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'phone'            => ['nullable', 'string', 'max:20'],
            'specialty'        => ['nullable', 'string', 'max:100'],
            'current_password' => ['nullable', 'string'],
            'password'         => ['nullable', 'string', 'min:8', 'confirmed'],
            'avatar'           => ['nullable', 'image', 'max:1024'],
        ]);

        // Verify current password if changing password
        if (! empty($data['password'])) {
            if (empty($data['current_password']) || ! Hash::check($data['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'كلمة المرور الحالية غير صحيحة.']);
            }
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update(array_filter([
            'name'      => $data['name'],
            'phone'     => $data['phone'] ?? null,
            'specialty' => $data['specialty'] ?? null,
            'password'  => ! empty($data['password']) ? $data['password'] : null,
            'avatar'    => $data['avatar'] ?? null,
        ], fn($v) => $v !== null));

        return back()->with('success', 'تم تحديث ملفك الشخصي.');
    }
}
