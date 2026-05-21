<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetUserTimezone
{
    public function handle(Request $request, Closure $next): mixed
    {
        if ($user = $request->user()) {
            if (! empty($user->timezone)) {
                config(['app.timezone' => $user->timezone]);
                date_default_timezone_set($user->timezone);
            }
            App::setLocale($user->locale ?: 'ar');
        }

        return $next($request);
    }
}
