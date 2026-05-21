<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthenticatePatient
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (! session('patient_portal_id')) {
            return redirect('/portal/login')
                ->with('error', 'يرجى تسجيل الدخول للوصول إلى بوابتك.');
        }

        return $next($request);
    }
}
