import { Head, Link, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { ChevronLeft, Printer, Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";

interface Item {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    subtotal: number;
    discount: number;
    total: number;
    amount_paid: number;
    balance_due: number;
    payment_method: string | null;
    notes: string | null;
    created_at: string;
    paid_at: string | null;
    patient: { id: number; name: string; phone: string | null };
    visit: { id: number; doctor: string } | null;
    items: Item[];
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
const STATUS_LABELS: Record<string, string> = {
    pending: "معلّق",
    paid: "مدفوع",
    partial: "مدفوع جزئياً",
    cancelled: "ملغى",
};
const PAYMENT_LABELS: Record<string, string> = {
    cash: "نقداً",
    card: "بطاقة",
    bank_transfer: "تحويل بنكي",
};

export default function InvoiceShow({
    invoice,
    currency,
}: {
    invoice: Invoice;
    currency: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const [showPayment, setShowPayment] = useState(false);

    const paymentForm = useForm({
        amount: invoice.balance_due,
        payment_method: "cash",
    });

    const fmt = (n: number) => `${Number(n).toFixed(2)} ${currency}`;

    const confirmDelete = () => {
        if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
            router.delete(`/invoices/${invoice.id}`);
        }
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(`/invoices/${invoice.id}/payment`, {
            onSuccess: () => setShowPayment(false),
        });
    };

    return (
        <AppLayout title={invoice.invoice_number}>
            <Head title={invoice.invoice_number} />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/invoices" className="hover:text-gray-700">
                    الفواتير
                </Link>
                <ChevronLeft size={14} className="rtl:rotate-180" />
                <span className="text-gray-900 font-mono font-medium">
                    {invoice.invoice_number}
                </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Invoice card ───────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="font-mono text-lg font-bold text-gray-900">
                                    {invoice.invoice_number}
                                </p>
                                <p
                                    className="text-sm text-gray-500 mt-0.5"
                                    dir="ltr"
                                >
                                    {invoice.created_at}
                                </p>
                            </div>
                            <span
                                className={`text-sm px-3 py-1.5 rounded-full border font-medium ${STATUS_STYLES[invoice.status] ?? ""}`}
                            >
                                {STATUS_LABELS[invoice.status] ??
                                    invoice.status}
                            </span>
                        </div>

                        {/* Patient + Visit */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    المريض
                                </p>
                                <Link
                                    href={`/patients/${invoice.patient.id}`}
                                    className="font-medium text-primary-600 hover:text-primary-700"
                                >
                                    {invoice.patient.name}
                                </Link>
                                {invoice.patient.phone && (
                                    <p
                                        className="text-xs text-gray-500 mt-0.5"
                                        dir="ltr"
                                    >
                                        {invoice.patient.phone}
                                    </p>
                                )}
                            </div>
                            {invoice.visit && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                        الزيارة
                                    </p>
                                    <Link
                                        href={`/visits/${invoice.visit.id}`}
                                        className="font-medium text-primary-600 hover:text-primary-700 text-sm"
                                    >
                                        عرض الزيارة
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        د. {invoice.visit.doctor}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Line items */}
                        <table className="w-full text-sm mb-5">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-right font-medium text-gray-500 pb-2">
                                        الوصف
                                    </th>
                                    <th className="text-center font-medium text-gray-500 pb-2 w-16">
                                        الكمية
                                    </th>
                                    <th className="text-center font-medium text-gray-500 pb-2 w-24">
                                        السعر
                                    </th>
                                    <th className="text-left font-medium text-gray-500 pb-2 w-24">
                                        الإجمالي
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2.5 text-gray-900">
                                            {item.description}
                                        </td>
                                        <td className="py-2.5 text-center text-gray-600">
                                            {item.quantity}
                                        </td>
                                        <td
                                            className="py-2.5 text-center text-gray-600"
                                            dir="ltr"
                                        >
                                            {fmt(item.unit_price)}
                                        </td>
                                        <td
                                            className="py-2.5 font-medium text-gray-900 text-left"
                                            dir="ltr"
                                        >
                                            {fmt(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>المجموع الفرعي</span>
                                <span dir="ltr">{fmt(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>الخصم</span>
                                    <span dir="ltr" className="text-red-600">
                                        - {fmt(invoice.discount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>الإجمالي</span>
                                <span dir="ltr">{fmt(invoice.total)}</span>
                            </div>
                            {invoice.amount_paid > 0 && (
                                <div className="flex justify-between text-sm text-emerald-700">
                                    <span>المدفوع</span>
                                    <span dir="ltr">
                                        {fmt(invoice.amount_paid)}
                                    </span>
                                </div>
                            )}
                            {invoice.balance_due > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                                    <span>المتبقي</span>
                                    <span dir="ltr">
                                        {fmt(invoice.balance_due)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Payment method */}
                        {invoice.payment_method && (
                            <p className="mt-4 text-xs text-gray-500">
                                طريقة الدفع:{" "}
                                {PAYMENT_LABELS[invoice.payment_method] ??
                                    invoice.payment_method}
                                {invoice.paid_at && (
                                    <span dir="ltr"> · {invoice.paid_at}</span>
                                )}
                            </p>
                        )}

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                    ملاحظات
                                </p>
                                <p className="text-sm text-gray-700">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sidebar actions ────────────────────── */}
                <div className="space-y-4">
                    <div className="card p-5 space-y-2">
                        {/* Record payment */}
                        {invoice.balance_due > 0 &&
                            invoice.status !== "cancelled" && (
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="btn-primary w-full justify-center"
                                >
                                    <Plus size={15} />
                                    تسجيل دفعة
                                </button>
                            )}

                        {/* Print */}
                        <button
                            onClick={() => window.print()}
                            className="btn-secondary w-full justify-center"
                        >
                            <Printer size={15} />
                            طباعة
                        </button>

                        {/* Edit */}
                        {invoice.status !== "paid" && (
                            <Link
                                href={`/invoices/${invoice.id}/edit`}
                                className="btn-secondary w-full justify-center"
                            >
                                <Edit size={15} />
                                تعديل
                            </Link>
                        )}

                        {/* Delete */}
                        {auth.user?.can.see_finances &&
                            invoice.status !== "paid" && (
                                <button
                                    onClick={confirmDelete}
                                    className="btn-danger w-full justify-center"
                                >
                                    <Trash2 size={15} />
                                    حذف
                                </button>
                            )}
                    </div>
                </div>
            </div>

            {/* Payment modal */}
            {showPayment && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    dir="rtl"
                >
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-bold text-gray-900 mb-4">
                            تسجيل دفعة
                        </h3>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="form-label">المبلغ</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min={0.01}
                                    max={invoice.balance_due}
                                    step={0.01}
                                    value={paymentForm.data.amount}
                                    onChange={(e) =>
                                        paymentForm.setData(
                                            "amount",
                                            Number(e.target.value),
                                        )
                                    }
                                    dir="ltr"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    المتبقي: {fmt(invoice.balance_due)}
                                </p>
                            </div>
                            <div>
                                <label className="form-label">
                                    طريقة الدفع
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "cash", label: "نقداً" },
                                        { value: "card", label: "بطاقة" },
                                        {
                                            value: "bank_transfer",
                                            label: "تحويل",
                                        },
                                    ].map((m) => (
                                        <button
                                            key={m.value}
                                            type="button"
                                            onClick={() =>
                                                paymentForm.setData(
                                                    "payment_method",
                                                    m.value,
                                                )
                                            }
                                            className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                                                paymentForm.data
                                                    .payment_method === m.value
                                                    ? "bg-primary-50 border-primary-500 text-primary-700"
                                                    : "border-gray-200 text-gray-600"
                                            }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="btn-primary flex-1 justify-center"
                                >
                                    {paymentForm.processing
                                        ? "جارٍ..."
                                        : "تسجيل"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPayment(false)}
                                    className="btn-secondary flex-1 justify-center"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
