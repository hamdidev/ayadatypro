<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Cashier\Exceptions\IncompletePayment;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;

class BillingController extends Controller
{
    public function subscribe(Request $request): SymfonyRedirect
    {
        $clinic = $this->clinic($request);

        $validated = $request->validate([
            'plan' => 'required|in:clinic,chain',
        ]);

        $priceId = config('billing.plans.'.$validated['plan']);

        if (! $priceId) {
            throw ValidationException::withMessages([
                'plan' => 'هذه الباقة غير متاحة حالياً.',
            ]);
        }

        $builder = $clinic->newSubscription('default', $priceId);

        // Only seed a fresh trial for clinics that have never subscribed.
        if (($trial = (int) config('billing.trial_days')) && ! $clinic->subscribed('default')) {
            $builder->trialDays($trial);
        }

        try {
            $checkout = $builder->checkout([
                'success_url' => route('settings.billing').'?checkout=success',
                'cancel_url' => route('settings.billing').'?checkout=cancelled',
            ]);
        } catch (IncompletePayment $e) {
            return redirect()->route('cashier.payment', [
                $e->payment->id,
                'redirect' => route('settings.billing'),
            ]);
        }

        return redirect($checkout->url);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $clinic = $this->clinic($request);

        $subscription = $clinic->subscription('default');

        if ($subscription && ! $subscription->canceled()) {
            $subscription->cancel();
        }

        return back()->with(
            'success',
            'تم إلغاء الاشتراك. سيظل نشطاً حتى نهاية الفترة الحالية.'
        );
    }

    public function portal(Request $request): SymfonyRedirect
    {
        $clinic = $this->clinic($request);

        return $clinic->redirectToBillingPortal(route('settings.billing'));
    }

    private function clinic(Request $request)
    {
        $this->authorize('manage-clinic', $request->user());

        return $request->user()->clinic;
    }
}
