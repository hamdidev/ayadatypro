<?php

namespace App\Http\Controllers;

use App\Services\ReportingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    private function service(Request $request): ReportingService
    {
        return new ReportingService($request->user()->clinic_id);
    }

    public function index(): Response
    {
        return Inertia::render('Reports/Index');
    }

    public function revenue(Request $request): Response
    {
        return Inertia::render('Reports/Revenue', [
            'data' => $this->service($request)->revenue(),
        ]);
    }

    public function clinical(Request $request): Response
    {
        return Inertia::render('Reports/Clinical', [
            'data' => $this->service($request)->clinical(),
        ]);
    }

    public function appointments(Request $request): Response
    {
        return Inertia::render('Reports/Appointments', [
            'data' => $this->service($request)->appointments(),
        ]);
    }

    public function patients(Request $request): Response
    {
        return Inertia::render('Reports/Patients', [
            'data' => $this->service($request)->patients(),
        ]);
    }

    public function operational(Request $request): Response
    {
        return Inertia::render('Reports/Operational', [
            'data' => $this->service($request)->operational(),
        ]);
    }

    public function flush(Request $request): \Illuminate\Http\RedirectResponse
    {
        $this->service($request)->flush();
        return back()->with('success', 'تم تحديث التقارير.');
    }
}
