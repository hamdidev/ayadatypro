import { Head } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import { FileText, Download } from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    total: number;
    amount_paid: number;
    balance_due: number;
    created_at: string;
    paid_at: string | null;
}

interface Props {
    invoices: Invoice[];
}

const STATUS_STYLES: Record<string, string> = {
    paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    partial:   'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
    paid:      'مدفوعة',
    pending:   'معلّقة',
    partial:   'مدفوعة جزئياً',
    cancelled: 'ملغاة',
};

export default function PortalInvoices({ invoices }: Props) {
    return (
        <PortalLayout title="فواتيري">
            <Head title="الفواتير" />

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                فواتيري
            </h1>

            {invoices.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
                    لا توجد فواتير بعد
                </div>
            ) : (
                <div className="space-y-3">
                    {invoices.map(inv => (
                        <div
                            key={inv.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-mono font-semibold text-gray-900 dark:text-white text-sm">
                                        {inv.invoice_number}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                                        {inv.created_at}
                                    </p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[inv.status] ?? ''}`}>
                                    {STATUS_LABELS[inv.status] ?? inv.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white" dir="ltr">
                                        {Number(inv.total).toLocaleString('ar-SA')} SAR
                                    </p>
                                    {inv.balance_due > 0 && (
                                        <p className="text-xs text-amber-600">
                                            متبقي: {Number(inv.balance_due).toLocaleString('ar-SA')} SAR
                                        </p>
                                    )}
                                </div>


                                    href={`/invoices/${inv.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
                                >
                                    <Download size={13} />
                                    PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
