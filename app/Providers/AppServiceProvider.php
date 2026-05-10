<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Visit;
use App\Observers\AppointmentObserver;
use App\Policies\AppointmentPolicy;
use App\Policies\PatientPolicy;
use App\Policies\VisitPolicy;
use App\Services\AppointmentService;
use App\Services\SmsService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind as singleton — buffer time cache is per-request
        $this->app->singleton(AppointmentService::class);
    }

    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
        Appointment::observe(AppointmentObserver::class);

        Gate::policy(Patient::class,     PatientPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(Visit::class,       VisitPolicy::class);

        Gate::define('manage-clinic', fn($user) => $user->isOwner());
        Gate::define('manage-staff',  fn($user) => $user->isOwner());
        Gate::define('see-finances',  fn($user) => $user->isOwner());
        Gate::define('write-notes',   fn($user) => $user->isDoctor());
        $this->app->singleton(SmsService::class, fn() => new SmsService());
    }
}
