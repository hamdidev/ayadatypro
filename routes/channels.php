<?php


use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Private clinic channel — only authenticated staff of that clinic
// Frontend subscribes to: Echo.private(`clinic.${clinicId}`)
Broadcast::channel('clinic.{clinicId}', function (User $user, int $clinicId) {
    return $user->clinic_id === $clinicId;
});

// Private doctor channel — for doctor-specific queue updates
// Frontend subscribes to: Echo.private(`doctor.${doctorId}`)
Broadcast::channel('doctor.{doctorId}', function (User $user, int $doctorId) {
    // Doctors can only subscribe to their own channel
    // Owners and receptionists can subscribe to any doctor in their clinic
    if ($user->isOwner() || $user->isReceptionist()) {
        return User::where('id', $doctorId)
            ->where('clinic_id', $user->clinic_id)
            ->exists();
    }

    return $user->id === $doctorId;
});
