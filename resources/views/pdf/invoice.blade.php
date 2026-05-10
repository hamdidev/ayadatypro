<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Amiri';
            font-style: normal;
            font-weight: normal;
            src: url('{{ storage_path('fonts/amiri-regular.ttf') }}') format('truetype');
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Amiri', 'DejaVu Sans', sans-serif;
            font-size: 13px;
            color: #1a1a2e;
            direction: rtl;
            line-height: 1.6;
        }

        .page {
            padding: 40px;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
        }

        .clinic-name {
            font-size: 22px;
            font-weight: bold;
            color: #1e40af;
        }

        .clinic-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }

        .invoice-badge {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px 20px;
            text-align: center;
        }

        .invoice-badge .label {
            font-size: 11px;
            color: #64748b;
        }

        .invoice-badge .number {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
        }

        /* Meta row */
        .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 28px;
        }

        .meta-block .label {
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 2px;
        }

        .meta-block .value {
            font-size: 13px;
            font-weight: bold;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        thead tr {
            background: #f8fafc;
        }

        th {
            padding: 10px 12px;
            text-align: right;
            font-size: 11px;
            color: #64748b;
            font-weight: normal;
            border-bottom: 1px solid #e2e8f0;
        }

        td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        /* Totals */
        .totals {
            margin-right: auto;
            margin-left: 0;
            width: 260px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 13px;
        }

        .totals-row.total {
            border-top: 2px solid #1e40af;
            margin-top: 8px;
            padding-top: 10px;
            font-weight: bold;
            font-size: 15px;
            color: #1e40af;
        }

        /* Status badge */
        .status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: bold;
        }

        .status-paid {
            background: #dcfce7;
            color: #166534;
        }

        .status-pending {
            background: #fef9c3;
            color: #854d0e;
        }

        .status-overdue {
            background: #fee2e2;
            color: #991b1b;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 11px;
        }
    </style>
</head>

<body>
    <div class="page">

        <!-- Header -->
        <div class="header">
            <div>
                <div class="clinic-name">{{ $invoice->clinic->name }}</div>
                <div class="clinic-sub">{{ $invoice->clinic->address ?? '' }}</div>
                <div class="clinic-sub">{{ $invoice->clinic->phone ?? '' }}</div>
            </div>
            <div class="invoice-badge">
                <div class="label">فاتورة رقم</div>
                <div class="number">{{ $invoice->number }}</div>
            </div>
        </div>

        <!-- Meta -->
        <div class="meta">
            <div class="meta-block">
                <div class="label">المريض</div>
                <div class="value">{{ $invoice->patient->full_name }}</div>
                <div style="font-size:11px;color:#64748b;">{{ $invoice->patient->phone ?? '' }}</div>
            </div>
            <div class="meta-block">
                <div class="label">تاريخ الإصدار</div>
                <div class="value">{{ $invoice->issued_at?->format('Y/m/d') ?? '—' }}</div>
            </div>
            <div class="meta-block">
                <div class="label">تاريخ الاستحقاق</div>
                <div class="value">{{ $invoice->due_at?->format('Y/m/d') ?? '—' }}</div>
            </div>
            <div class="meta-block">
                <div class="label">الحالة</div>
                <div class="value">
                    <span class="status status-{{ $invoice->status->value }}">
                        {{ match ($invoice->status->value) {
                            'paid' => 'مدفوعة',
                            'pending' => 'معلّقة',
                            'overdue' => 'متأخرة',
                            default => $invoice->status->value,
                        } }}
                    </span>
                </div>
            </div>
        </div>

        <hr class="divider">

        <!-- Items table -->
        <table>
            <thead>
                <tr>
                    <th style="width:50%">الخدمة / الوصف</th>
                    <th style="width:15%;text-align:center">الكمية</th>
                    <th style="width:17.5%;text-align:left">سعر الوحدة</th>
                    <th style="width:17.5%;text-align:left">المجموع</th>
                </tr>
            </thead>
            <tbody>
                @forelse($invoice->items as $item)
                    <tr>
                        <td>{{ $item->description }}</td>
                        <td style="text-align:center">{{ $item->quantity }}</td>
                        <td style="text-align:left">{{ number_format($item->unit_price, 2) }}
                            {{ $invoice->currency ?? 'SAR' }}</td>
                        <td style="text-align:left">{{ number_format($item->quantity * $item->unit_price, 2) }}
                            {{ $invoice->currency ?? 'SAR' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">لا توجد بنود</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Totals -->
        <div style="display:flex;justify-content:flex-start;">
            <div class="totals">
                <div class="totals-row">
                    <span>المجموع الفرعي</span>
                    <span>{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency ?? 'SAR' }}</span>
                </div>
                @if ($invoice->discount > 0)
                    <div class="totals-row">
                        <span>الخصم</span>
                        <span>- {{ number_format($invoice->discount, 2) }}</span>
                    </div>
                @endif
                @if ($invoice->tax > 0)
                    <div class="totals-row">
                        <span>الضريبة ({{ $invoice->tax_rate ?? 15 }}%)</span>
                        <span>{{ number_format($invoice->tax, 2) }}</span>
                    </div>
                @endif
                <div class="totals-row total">
                    <span>الإجمالي</span>
                    <span>{{ number_format($invoice->total, 2) }} {{ $invoice->currency ?? 'SAR' }}</span>
                </div>
            </div>
        </div>

        @if ($invoice->notes)
            <div
                style="margin-top:28px;padding:12px 16px;background:#f8fafc;border-radius:6px;font-size:12px;color:#64748b;">
                <strong>ملاحظات:</strong> {{ $invoice->notes }}
            </div>
        @endif

        <div class="footer">
            شكراً لثقتكم بنا — {{ $invoice->clinic->name }}
            @if ($invoice->clinic->website)
                · {{ $invoice->clinic->website }}
            @endif
        </div>
    </div>
</body>

</html>
