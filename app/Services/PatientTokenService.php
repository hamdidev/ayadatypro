<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\PatientLoginToken;
use Illuminate\Support\Str;

class PatientTokenService
{
    private int $ttlMinutes = 15;

    public function generate(Patient $patient): PatientLoginToken
    {
        // Invalidate any existing unused tokens
        PatientLoginToken::where('patient_id', $patient->id)
            ->whereNull('used_at')
            ->delete();

        return PatientLoginToken::create([
            'patient_id' => $patient->id,
            'token'      => Str::random(64),
            'expires_at' => now()->addMinutes($this->ttlMinutes),
        ]);
    }

    public function validate(string $token): ?Patient
    {
        $record = PatientLoginToken::where('token', $token)
            ->with('patient')
            ->first();

        if (! $record || ! $record->isValid()) {
            return null;
        }

        $record->update(['used_at' => now()]);

        return $record->patient;
    }

    public function portalUrl(PatientLoginToken $token): string
    {
        return url("/portal/verify/{$token->token}");
    }
}
