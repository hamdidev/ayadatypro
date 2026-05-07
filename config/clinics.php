<?php
// config/clinics.php
// Clinic-level defaults referenced throughout the app

return [
    /*
    |--------------------------------------------------------------------------
    | Default Subscription Plan
    |--------------------------------------------------------------------------
    | Plan assigned to every new clinic on registration.
    | Options: 'free', 'clinic', 'chain'
    */
    'default_plan' => env('CLINIC_DEFAULT_PLAN', 'free'),

    /*
    |--------------------------------------------------------------------------
    | Trial Period
    |--------------------------------------------------------------------------
    | Number of days new clinics get on the free trial.
    */
    'trial_days' => env('CLINIC_TRIAL_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Plan Limits
    |--------------------------------------------------------------------------
    | Enforced server-side in UsageLimiter service (Phase 4).
    */
    'limits' => [
        'free' => [
            'doctors'               => 1,
            'appointments_per_month' => 50,
            'storage_mb'            => 100,
        ],
        'clinic' => [
            'doctors'               => 3,
            'appointments_per_month' => null, // unlimited
            'storage_mb'            => 1000,
        ],
        'chain' => [
            'doctors'               => null, // unlimited
            'appointments_per_month' => null,
            'storage_mb'            => 10000,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Stripe Price IDs
    |--------------------------------------------------------------------------
    */
    'stripe_prices' => [
        'clinic' => env('STRIPE_PRICE_CLINIC'),
        'chain'  => env('STRIPE_PRICE_CHAIN'),
    ],
];
