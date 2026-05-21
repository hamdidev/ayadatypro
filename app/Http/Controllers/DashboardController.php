<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $clinic = $request->user()->clinic;

        $appointmentsChart = Appointment::query()
            ->where('clinic_id', $clinic->id)
            ->where('starts_at', '>=', now()->subMonths(12)->startOfMonth())
            ->select(
                DB::raw("TO_CHAR(starts_at, 'YYYY-MM') as month"),
                DB::raw('COUNT(*) as total'),
                DB::raw("COUNT(*) FILTER (WHERE status = 'completed') as completed"),
                DB::raw("COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled"),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'label' => $this->arabicMonth($row->month),
                'total' => (int) $row->total,
                'completed' => (int) $row->completed,
                'cancelled' => (int) $row->cancelled,
            ]);

        $revenueChart = Invoice::query()
            ->where('clinic_id', $clinic->id)
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'label' => $this->arabicMonth($row->month),
                'revenue' => (float) $row->revenue,
            ]);

        // Quick stats
        $stats = [
            'appointments_today' => Appointment::where('clinic_id', $clinic->id)
                ->whereDate('starts_at', today())
                ->count(),
            'appointments_month' => Appointment::where('clinic_id', $clinic->id)
                ->whereMonth('starts_at', now()->month)
                ->whereYear('starts_at', now()->year)
                ->count(),
            'revenue_month' => Invoice::where('clinic_id', $clinic->id)
                ->where('status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
            'pending_invoices' => Invoice::where('clinic_id', $clinic->id)
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('Dashboard', [
            'appointmentsChart' => $appointmentsChart,
            'revenueChart' => $revenueChart,
            'stats' => $stats,
        ]);
    }

    private function arabicMonth(string $yearMonth): string
    {
        $months = [
            '01' => 'يناير',
            '02' => 'فبراير',
            '03' => 'مارس',
            '04' => 'أبريل',
            '05' => 'مايو',
            '06' => 'يونيو',
            '07' => 'يوليو',
            '08' => 'أغسطس',
            '09' => 'سبتمبر',
            '10' => 'أكتوبر',
            '11' => 'نوفمبر',
            '12' => 'ديسمبر',
        ];
        [, $month] = explode('-', $yearMonth);

        return $months[$month] ?? $yearMonth;
    }
}
