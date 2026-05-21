<?php

use App\Http\Middleware\AuthenticatePatient;
use App\Http\Middleware\EnsureClinicIsSetup;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetUserTimezone;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            EnsureClinicIsSetup::class,
            SetUserTimezone::class,
        ]);

        $middleware->alias([
            'auth.patient' => AuthenticatePatient::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
