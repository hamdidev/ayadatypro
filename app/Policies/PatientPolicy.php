<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    // All clinic staff can view patients in their clinic
    public function view(User $user, Patient $patient): bool
    {
        return $user->clinic_id === $patient->clinic_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['owner', 'doctor', 'receptionist']);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->clinic_id === $patient->clinic_id
            && in_array($user->role, ['owner', 'doctor', 'receptionist']);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->clinic_id === $patient->clinic_id && $user->isOwner();
    }
}
