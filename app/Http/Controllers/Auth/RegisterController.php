<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'clinic_name' => ['required', 'string', 'max:255'],
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => ['required', 'string', 'min:8', 'confirmed'],
            'phone'       => ['nullable', 'string', 'max:20'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $clinic = Clinic::create([
                'name'              => $data['clinic_name'],
                'slug'              => Str::slug($data['clinic_name']) . '-' . Str::random(4),
                'phone'             => $data['phone'] ?? null,
                'subscription_plan' => 'free',
                'trial_ends_at'     => now()->addDays(14),
            ]);

            return User::create([
                'clinic_id' => $clinic->id,
                'name'      => $data['name'],
                'email'     => $data['email'],
                'password'  => $data['password'],
                'phone'     => $data['phone'] ?? null,
                'role'      => 'owner',
            ]);
        });

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
