<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicSetupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ClinicSetup');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'clinic_name' => 'required|string|max:255',
            'specialty'   => 'required|string|max:100',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string|max:500',
        ]);

        $clinic = Clinic::create([
            'name'      => $request->clinic_name,
            'specialty' => $request->specialty,
            'phone'     => $request->phone,
            'address'   => $request->address,
            'plan'      => 'free',
        ]);

        $request->user()->update(['clinic_id' => $clinic->id]);

        return redirect('/dashboard');
    }
}
