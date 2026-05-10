<?php

namespace App\Http\Controllers;

use App\Mail\StaffInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:doctor,nurse,receptionist',
        ]);

        $temporaryPassword = Str::random(12);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'role'      => $request->role,
            'clinic_id' => $request->user()->clinic_id,
            'password'  => Hash::make($temporaryPassword),
        ]);

        Mail::to($user->email)
            ->queue(new StaffInvitation(
                $user,
                $temporaryPassword,
                $request->user()->clinic->name,
            ));

        return redirect()->route('users.index')
            ->with('success', 'تمت إضافة الموظف وإرسال دعوة بالبريد الإلكتروني.');
    }
}
