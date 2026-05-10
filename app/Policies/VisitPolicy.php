<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Visit;

class VisitPolicy
{
    /**
     * Any clinic staff can view visits in their clinic.
     */
    public function view(User $user, Visit $visit): bool
    {
        return $user->clinic_id === $visit->clinic_id;
    }

    /**
     * Doctors and owners can create visit records.
     * Receptionists cannot — they don't write clinical notes.
     */
    public function create(User $user): bool
    {
        return $user->isDoctor() || $user->isOwner();
    }

    /**
     * Only the authoring doctor or owner can edit a visit.
     * Signed visits cannot be edited at all (enforced in controller too).
     */
    public function update(User $user, Visit $visit): bool
    {
        if ($visit->is_signed) {
            return false;
        }

        if ($user->clinic_id !== $visit->clinic_id) {
            return false;
        }

        return $user->isOwner() || $user->id === $visit->doctor_id;
    }

    /**
     * Only owners can delete visits.
     * Signed visits can never be deleted.
     */
    public function delete(User $user, Visit $visit): bool
    {
        return $user->isOwner()
            && $user->clinic_id === $visit->clinic_id
            && ! $visit->is_signed;
    }

    /**
     * Doctors can sign their own visits.
     * Owners can sign any visit in their clinic.
     */
    public function sign(User $user, Visit $visit): bool
    {
        if ($user->clinic_id !== $visit->clinic_id) {
            return false;
        }

        return $user->isOwner() || $user->id === $visit->doctor_id;
    }
}
