<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\Response;
use Inertia\Inertia;

class PublicProfileController extends Controller
{
    public function show(string $slug): \Inertia\Response|\Illuminate\Http\Response
    {
        $clinic = Clinic::where('slug', $slug)
            ->with([
                'activeBranches',
                'users' => fn($q) => $q->where('role', 'doctor')
                    ->select('id', 'clinic_id', 'name', 'specialty', 'avatar'),
            ])
            ->firstOrFail();

        return Inertia::render('Clinic/PublicProfile', [
            'clinic'  => $clinic,
            'doctors' => $clinic->users,
            'branches' => $clinic->activeBranches,
        ]);
    }
}
