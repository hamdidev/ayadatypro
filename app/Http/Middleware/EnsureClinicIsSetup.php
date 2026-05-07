<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClinicIsSetup
{
    /**
     * Routes that are allowed even if setup is incomplete.
     * Prevents redirect loops.
     */
    private const EXEMPT_ROUTES = [
        'onboarding',
        'onboarding.save',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $user->loadMissing('clinic');

        if (
            $user->clinic
            && ! $user->clinic->is_setup_complete
            && ! in_array($request->route()?->getName(), self::EXEMPT_ROUTES)
        ) {
            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
