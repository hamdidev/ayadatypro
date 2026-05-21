<?php

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;

it('scopes patient queries to the authenticated user clinic', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    Patient::factory()->create(['clinic_id' => $clinicA->id, 'name' => 'Alice A']);
    Patient::factory()->create(['clinic_id' => $clinicB->id, 'name' => 'Bob B']);

    $owner = User::factory()->create(['clinic_id' => $clinicA->id, 'role' => 'owner']);
    $this->actingAs($owner);

    $names = Patient::pluck('name');

    expect($names)->toContain('Alice A')
        ->and($names)->not->toContain('Bob B');
});

it('lets a superadmin bypass the clinic scope', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    Patient::factory()->create(['clinic_id' => $clinicA->id]);
    Patient::factory()->create(['clinic_id' => $clinicB->id]);

    $super = User::factory()->create(['clinic_id' => $clinicA->id, 'role' => 'superadmin']);
    $this->actingAs($super);

    expect(Patient::count())->toBe(2);
});

it('applies no clinic scope when unauthenticated', function () {
    $clinicA = Clinic::factory()->create();
    $clinicB = Clinic::factory()->create();

    Patient::factory()->create(['clinic_id' => $clinicA->id]);
    Patient::factory()->create(['clinic_id' => $clinicB->id]);

    // No actingAs — the global scope is a documented no-op without auth.
    expect(Patient::count())->toBe(2);
});
