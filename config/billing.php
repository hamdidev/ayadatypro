<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Plan → Stripe Price mapping
    |--------------------------------------------------------------------------
    |
    | Each subscription_plan key maps to its monthly Stripe Price ID. The
    | webhook handler also reverses this map to translate an incoming Price
    | back into the clinics.subscription_plan column.
    */
    'plans' => [
        'clinic' => env('STRIPE_PRICE_CLINIC_MONTHLY'),
        'chain' => env('STRIPE_PRICE_CHAIN_MONTHLY'),
    ],

    /*
    | Length of the free trial Cashier seeds when a subscription is created
    | through Checkout. Set to null to disable.
    */
    'trial_days' => env('BILLING_TRIAL_DAYS', 14),

];
