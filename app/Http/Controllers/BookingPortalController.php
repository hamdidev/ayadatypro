<?php


namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingPortalController extends Controller
{
    public function show(string $clinicSlug)
    {
        $clinic = Clinic::where('slug', $clinicSlug)
            ->where('is_active', true)
            ->firstOrFail();

        // Phase 2 — return booking portal page
        return Inertia::render('Booking/Portal', [
            'clinic' => [
                'id'       => $clinic->id,
                'name'     => $clinic->name,
                'specialty' => $clinic->specialty,
            ],
        ]);
    }

    public function store(Request $request, string $clinicSlug)
    {
        // Phase 2 — handle public booking submission
        abort(501, 'Booking portal coming in Phase 2');
    }
}
