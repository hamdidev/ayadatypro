<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BookingPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────
Route::get('/', fn() => inertia('Welcome'))->name('home');

// Signed avatar URL — validated by signature, no session needed
Route::get('/avatar/{user}', AvatarController::class)
    ->middleware('signed')
    ->name('avatar.show');

// Public booking portal — patients have no account
Route::get('/book/{clinicSlug}',  [BookingPortalController::class, 'show'])->name('booking.portal');
Route::post('/book/{clinicSlug}', [BookingPortalController::class, 'store'])->name('booking.store');

// Stripe webhook — no session, excluded from CSRF in bootstrap/app.php
Route::post('/stripe/webhook', [BillingController::class, 'webhook'])->name('stripe.webhook');

// ── Guest-only ────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register',  [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    Route::get('/login',  [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/auth/google',               [GoogleController::class, 'redirect'])->name('auth.google');
    Route::get('/auth/google/callback',      [GoogleController::class, 'callback']);
    Route::get('/auth/google/clinic-setup',  [GoogleController::class, 'clinicSetup'])->name('register.clinic');
    Route::post('/auth/google/clinic-setup', [GoogleController::class, 'clinicStore']);
});

// ── Authenticated ─────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('/logout', [LogoutController::class, 'destroy'])->name('logout');

    Route::get('/onboarding',  [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'save'])->name('onboarding.save');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patients — search before resource to prevent route collision
    Route::get('/patients/search', function (\Illuminate\Http\Request $request) {
        $term = $request->validate(['q' => 'required|string|min:2'])['q'];
        return \App\Models\Patient::query()
            ->search($term)
            ->limit(8)
            ->get(['id', 'name', 'phone']);
    })->name('patients.search');

    Route::resource('patients', PatientController::class);

    // Appointments
    Route::resource('appointments', AppointmentController::class);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('appointments.status');

    // Visits — standalone index + shallow nested resource
    Route::get('/visits', [VisitController::class, 'index'])->name('visits.index');
    Route::resource('patients.visits', VisitController::class)->shallow()->except(['index']);
    Route::post('/visits/{visit}/sign', [VisitController::class, 'sign'])->name('visits.sign');

    // Invoices
    Route::resource('invoices', InvoiceController::class);
    Route::post('/invoices/{invoice}/payment', [InvoiceController::class, 'recordPayment'])
        ->name('invoices.payment');

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', fn() => inertia('Settings/Index'))->name('index');

        Route::get('/clinic', [SettingsController::class, 'clinic'])->name('clinic');
        Route::put('/clinic', [SettingsController::class, 'updateClinic'])->name('clinic.update');

        Route::get('/team',           [SettingsController::class, 'team'])->name('team');
        Route::post('/team',          [SettingsController::class, 'inviteStaff'])->name('team.invite');
        Route::put('/team/{user}',    [SettingsController::class, 'updateStaff'])->name('team.update');
        Route::delete('/team/{user}', [SettingsController::class, 'removeStaff'])->name('team.remove');

        Route::get('/schedule', [SettingsController::class, 'schedule'])->name('schedule');
        Route::put('/schedule', [SettingsController::class, 'updateSchedule'])->name('schedule.update');

        Route::get('/billing', [SettingsController::class, 'billing'])->name('billing');

        Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
        Route::put('/profile', [SettingsController::class, 'updateProfile'])->name('profile.update');
    });

    // Billing actions (Stripe — Phase 4)
    Route::post('/billing/subscribe', [BillingController::class, 'subscribe'])->name('billing.subscribe');
    Route::post('/billing/cancel',    [BillingController::class, 'cancel'])->name('billing.cancel');
    Route::get('/billing/portal',     [BillingController::class, 'portal'])->name('billing.portal');
});
