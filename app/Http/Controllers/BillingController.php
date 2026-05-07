<?php
// app/Http/Controllers/BillingController.php
// Stub — full Stripe implementation in Phase 4

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function subscribe(Request $request): RedirectResponse
    {
        // Phase 4 — create Stripe subscription
        abort(501, 'Billing coming in Phase 4');
    }

    public function cancel(Request $request): RedirectResponse
    {
        // Phase 4 — cancel Stripe subscription
        abort(501, 'Billing coming in Phase 4');
    }

    public function portal(Request $request): RedirectResponse
    {
        // Phase 4 — redirect to Stripe billing portal
        abort(501, 'Billing coming in Phase 4');
    }

    public function webhook(Request $request): Response
    {
        // Phase 4 — handle Stripe webhook events
        return response('ok', 200);
    }
}
