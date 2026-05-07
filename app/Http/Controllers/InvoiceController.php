<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::with(['patient'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas(
                'patient',
                fn($p) =>
                $p->where('name', 'ILIKE', "%{$request->search}%")
            ))
            ->when($request->month, fn($q) => $q->whereMonth('created_at', $request->month))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn(Invoice $inv) => [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'patient'        => $inv->patient->name,
                'total'          => $inv->total,
                'amount_paid'    => $inv->amount_paid,
                'balance_due'    => $inv->balance_due,
                'status'         => $inv->status,
                'payment_method' => $inv->payment_method,
                'created_at'     => $inv->created_at->format('Y-m-d'),
                'paid_at'        => $inv->paid_at?->format('Y-m-d'),
            ]);

        // Revenue summary for the month
        $summary = [
            'total_revenue' => Invoice::paid()
                ->whereMonth('paid_at', now()->month)
                ->sum('total'),
            'pending_amount' => Invoice::pending()->sum('total'),
            'invoices_count' => Invoice::whereMonth('created_at', now()->month)->count(),
        ];

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'summary'  => $summary,
            'filters'  => $request->only(['status', 'search', 'month']),
            'currency' => auth()->user()->clinic->currency ?? 'SAR',
        ]);
    }

    public function create(Request $request): Response
    {
        // Pre-select patient if coming from patient profile
        $patient = null;
        if ($request->patient_id) {
            $patient = Patient::find($request->patient_id, ['id', 'name', 'phone']);
        }

        // Pre-fill from visit if coming from visit show page
        $visit = null;
        if ($request->visit_id) {
            $visit = Visit::with('patient')->find($request->visit_id);
            if ($visit) {
                $patient = $visit->patient;
            }
        }

        return Inertia::render('Invoices/Create', [
            'preselectedPatient' => $patient ? [
                'id'   => $patient->id,
                'name' => $patient->name,
            ] : null,
            'visitId'  => $visit?->id,
            'currency' => auth()->user()->clinic->currency ?? 'SAR',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'patient_id'     => ['required', 'integer', 'exists:patients,id'],
            'visit_id'       => ['nullable', 'integer', 'exists:visits,id'],
            'discount'       => ['nullable', 'numeric', 'min:0'],
            'notes'          => ['nullable', 'string', 'max:500'],
            'payment_method' => ['nullable', Rule::in(['cash', 'card', 'bank_transfer'])],
            'status'         => ['required', Rule::in(['pending', 'paid', 'partial'])],
            'amount_paid'    => ['nullable', 'numeric', 'min:0'],

            'items'              => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $invoice = Invoice::create([
            'clinic_id'      => auth()->user()->clinic_id,
            'patient_id'     => $data['patient_id'],
            'visit_id'       => $data['visit_id'] ?? null,
            'discount'       => $data['discount'] ?? 0,
            'notes'          => $data['notes'] ?? null,
            'payment_method' => $data['payment_method'] ?? null,
            'status'         => $data['status'],
            'amount_paid'    => $data['amount_paid'] ?? 0,
            'subtotal'       => 0, // recalculated after items are created
            'total'          => 0,
        ]);

        // Create line items — InvoiceItem::saved() calls recalculateTotals()
        foreach ($data['items'] as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'total'       => $item['quantity'] * $item['unit_price'],
            ]);
        }

        // Recalculate after all items are inserted
        $invoice->recalculateTotals();

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'تم إنشاء الفاتورة بنجاح.');
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['patient', 'items', 'visit.doctor']);

        return Inertia::render('Invoices/Show', [
            'invoice' => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status'         => $invoice->status,
                'subtotal'       => $invoice->subtotal,
                'discount'       => $invoice->discount,
                'total'          => $invoice->total,
                'amount_paid'    => $invoice->amount_paid,
                'balance_due'    => $invoice->balance_due,
                'payment_method' => $invoice->payment_method,
                'notes'          => $invoice->notes,
                'created_at'     => $invoice->created_at->format('Y-m-d'),
                'paid_at'        => $invoice->paid_at?->format('Y-m-d'),

                'patient' => [
                    'id'    => $invoice->patient->id,
                    'name'  => $invoice->patient->name,
                    'phone' => $invoice->patient->phone,
                ],

                'visit' => $invoice->visit ? [
                    'id'     => $invoice->visit->id,
                    'doctor' => $invoice->visit->doctor->name,
                ] : null,

                'items' => $invoice->items->map(fn(InvoiceItem $item) => [
                    'id'          => $item->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                    'total'       => $item->total,
                ]),
            ],
            'currency' => auth()->user()->clinic->currency ?? 'SAR',
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        if ($invoice->status === 'paid') {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'لا يمكن تعديل فاتورة مدفوعة.');
        }

        $invoice->load(['patient', 'items']);

        return Inertia::render('Invoices/Edit', [
            'invoice' => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'patient_id'     => $invoice->patient_id,
                'patient'        => $invoice->patient->name,
                'visit_id'       => $invoice->visit_id,
                'discount'       => $invoice->discount,
                'notes'          => $invoice->notes,
                'status'         => $invoice->status,
                'payment_method' => $invoice->payment_method,
                'amount_paid'    => $invoice->amount_paid,
                'items'          => $invoice->items->map(fn(InvoiceItem $item) => [
                    'id'          => $item->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                ]),
            ],
            'currency' => auth()->user()->clinic->currency ?? 'SAR',
        ]);
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        if ($invoice->status === 'paid') {
            return back()->withErrors(['status' => 'لا يمكن تعديل فاتورة مدفوعة.']);
        }

        $data = $request->validate([
            'discount'       => ['nullable', 'numeric', 'min:0'],
            'notes'          => ['nullable', 'string', 'max:500'],
            'payment_method' => ['nullable', Rule::in(['cash', 'card', 'bank_transfer'])],
            'status'         => ['required', Rule::in(['pending', 'paid', 'partial'])],
            'amount_paid'    => ['nullable', 'numeric', 'min:0'],

            'items'              => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $invoice->update([
            'discount'       => $data['discount'] ?? 0,
            'notes'          => $data['notes'] ?? null,
            'payment_method' => $data['payment_method'] ?? null,
            'status'         => $data['status'],
            'amount_paid'    => $data['amount_paid'] ?? 0,
        ]);

        // Replace all items
        $invoice->items()->delete();

        foreach ($data['items'] as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'total'       => $item['quantity'] * $item['unit_price'],
            ]);
        }

        $invoice->recalculateTotals();

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'تم تحديث الفاتورة.');
    }

    /**
     * Record a payment against a pending/partial invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $data = $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01', "max:{$invoice->balance_due}"],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'bank_transfer'])],
        ]);

        $invoice->recordPayment($data['amount'], $data['payment_method']);

        return back()->with('success', 'تم تسجيل الدفعة بنجاح.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        if ($invoice->status === 'paid') {
            return back()->withErrors(['status' => 'لا يمكن حذف فاتورة مدفوعة.']);
        }

        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'تم حذف الفاتورة.');
    }
}
