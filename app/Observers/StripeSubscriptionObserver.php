<?php

namespace App\Observers;

use Laravel\Cashier\Subscription;

class StripeSubscriptionObserver
{
    /**
     * Sync clinics.subscription_plan whenever the Stripe subscription changes.
     */
    public function saved(Subscription $subscription): void
    {
        $clinic = $subscription->owner;

        if (! $clinic) {
            return;
        }

        $plan = $this->resolvePlan($subscription);

        if ($plan === null || $clinic->subscription_plan === $plan) {
            return;
        }

        $clinic->forceFill(['subscription_plan' => $plan])->saveQuietly();
    }

    /**
     * Map the subscription's current Stripe price + status to our plan enum.
     * Returns null when the change shouldn't trigger a plan update.
     */
    private function resolvePlan(Subscription $subscription): ?string
    {
        // Once the grace period has fully ended, drop back to the free plan.
        if ($subscription->ended()) {
            return 'free';
        }

        if (! in_array($subscription->stripe_status, ['active', 'trialing'], true)) {
            return null;
        }

        $plan = collect(config('billing.plans', []))
            ->search($subscription->stripe_price);

        return $plan === false ? null : $plan;
    }
}
