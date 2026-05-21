<?php

use App\Models\Clinic;
use App\Models\User;

it('redirects guests away from financial reports', function () {
    $this->get('/reports/revenue')->assertRedirect('/login');
});

it('forbids receptionists from financial reports', function () {
    $clinic = Clinic::factory()->create();
    $receptionist = User::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'receptionist',
    ]);

    $this->actingAs($receptionist)
        ->get('/reports/revenue')
        ->assertForbidden();
});

it('forbids doctors from financial reports', function () {
    $clinic = Clinic::factory()->create();
    $doctor = User::factory()->create([
        'clinic_id' => $clinic->id,
        'role' => 'doctor',
    ]);

    $this->actingAs($doctor)
        ->get('/reports/revenue')
        ->assertForbidden();
});
