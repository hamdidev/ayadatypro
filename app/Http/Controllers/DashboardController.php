<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $clinic = auth()->user()->clinic;

        $stats = [
            'appointments_today' => Appointment::whereDate('starts_at', today())
                ->whereIn('status', ['scheduled', 'confirmed', 'in_progress'])
                ->count(),

            'patients_total' => Patient::count(),

            'revenue_month' => Invoice::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->sum('total'),

            'appointments_this_month' => Appointment::whereMonth('starts_at', now()->month)
                ->count(),
        ];

        $todayAppointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('starts_at', today())
            ->orderBy('starts_at')
            ->get()
            ->map(fn(Appointment $a) => [
                'id'        => $a->id,
                'patient'   => $a->patient->name,
                'doctor'    => $a->doctor->name,
                'starts_at' => $a->starts_at->format('H:i'),
                'status'    => $a->status,
                'type'      => $a->type,
            ]);

        return Inertia::render('Dashboard/Index', [
            'clinic'            => $clinic,
            'stats'             => $stats,
            'todayAppointments' => $todayAppointments,
            'plan'              => $clinic->subscription_plan,
            'trialEndsAt'       => $clinic->trial_ends_at?->diffForHumans(),
        ]);
    }
}
