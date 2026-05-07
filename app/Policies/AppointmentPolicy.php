<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function view(User $user, Appointment $appointment): bool
    {
        return $user->clinic_id === $appointment->clinic_id;
    }

    public function create(User $user): bool
    {
        return true; // all authenticated clinic users
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $user->clinic_id === $appointment->clinic_id;
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        return $user->clinic_id === $appointment->clinic_id
            && in_array($user->role, ['owner', 'receptionist']);
    }
}
