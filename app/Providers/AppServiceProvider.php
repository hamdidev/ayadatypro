<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Policies\AppointmentPolicy;
use App\Policies\PatientPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Force HTTPS in production
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Policies (Laravel 11+ registers here, not in AuthServiceProvider)
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);

        // Role gates
        Gate::define('manage-clinic', fn ($user) => $user->isOwner());
        Gate::define('manage-staff', fn ($user) => $user->isOwner());
        Gate::define('view-reports', fn ($user) => $user->isOwner() || $user->isDoctor());
        Gate::define('add-patient', fn ($user) => ! $user->isOwner() || true); // all roles
        Gate::define('see-finances', fn ($user) => $user->isOwner());
    }
}
