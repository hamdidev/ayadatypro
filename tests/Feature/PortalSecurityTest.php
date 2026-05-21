<?php

use App\Mail\PatientMagicLink;
use App\Models\Clinic;
use App\Models\Patient;
use App\Services\PatientTokenService;
use Illuminate\Support\Facades\Mail;

it('does not reveal whether a patient exists', function () {
    Mail::fake();

    $this->post('/portal/login', ['identifier' => 'nobody@example.com'])
        ->assertSessionHas('status');

    Mail::assertNothingQueued();
});

it('rate limits magic-link requests after 5 attempts', function () {
    $clinic = Clinic::factory()->create();
    Patient::factory()->create(['clinic_id' => $clinic->id, 'email' => 'p@example.com']);
    Mail::fake();

    for ($i = 0; $i < 5; $i++) {
        $this->post('/portal/login', ['identifier' => 'p@example.com'])
            ->assertSessionHas('status');
    }

    $this->post('/portal/login', ['identifier' => 'p@example.com'])
        ->assertSessionHas('error');

    Mail::assertQueued(PatientMagicLink::class, 5);
});

it('sends a separate clinic-specific link for a shared email across clinics', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();
    Patient::factory()->create(['clinic_id' => $clinicA->id, 'email' => 'dup@example.com']);
    Patient::factory()->create(['clinic_id' => $clinicB->id, 'email' => 'dup@example.com']);
    Mail::fake();

    $this->post('/portal/login', ['identifier' => 'dup@example.com'])
        ->assertSessionHas('status');

    Mail::assertQueued(PatientMagicLink::class, 2);
});

it('binds the portal session to the token clinic', function () {
    $clinic = Clinic::factory()->create();
    $patient = Patient::factory()->create(['clinic_id' => $clinic->id]);

    $token = app(PatientTokenService::class)->generate($patient);

    $this->get('/portal/verify/'.$token->token)
        ->assertRedirect('/portal/dashboard');

    expect(session('patient_portal_clinic_id'))->toBe($clinic->id)
        ->and(session('patient_portal_id'))->toBe($patient->id);
});

it('rejects an invalid portal token', function () {
    $this->get('/portal/verify/not-a-real-token')
        ->assertRedirect('/portal/login')
        ->assertSessionHas('error');
});
