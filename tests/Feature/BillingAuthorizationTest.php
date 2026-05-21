<?php

use App\Models\Clinic;
use App\Models\User;

it('forbids non-owners from subscribing', function () {
    $clinic = Clinic::factory()->create();
    $receptionist = User::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'receptionist',
    ]);

    $this->actingAs($receptionist)
        ->post('/billing/subscribe', ['plan' => 'clinic'])
        ->assertForbidden();
});

it('forbids non-owners from opening the billing portal', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'doctor',
    ]);

    $this->actingAs($doctor)
        ->get('/billing/portal')
        ->assertForbidden();
});

it('rejects unknown plans', function () {
    $clinic = Clinic::factory()->create();
    $owner = User::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'owner',
    ]);

    $this->actingAs($owner)
        ->post('/billing/subscribe', ['plan' => 'enterprise'])
        ->assertSessionHasErrors('plan');
});
