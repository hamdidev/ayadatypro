import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

import {
    Plus,
    FileText,
    TrendingUp,
    Clock,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Invoice {
    id: number;
    invoice_number: string;
    patient: string;
    total: number;
    amount_paid: number;
    balance_due: number;
    status: "pending" | "paid" | "partial" | "cancelled";
    payment_method: string | null;
    created_at: string;
    paid_at: string | null;
}

interface Summary {
    total_revenue: number;
    pending_amount: number;
    invoices_count: number;
}

interface Pagination {
    data: Invoice[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    invoices: Pagination;
    summary: Summary;
    filters: { status?: string; search?: string; month?: string };
    currency: string;
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
    partial: "جزئي",
    cancelled: "ملغى",
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: "نقداً",
    card: "بطاقة",
    bank_transfer: "تحويل",
};

export default function InvoicesIndex({
    invoices,
    summary,
    filters,
    currency,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "");

    const applyFilters = (params: Record<string, string>) => {
        router.get("/invoices", params, { preserveState: true, replace: true });
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        applyFilters({ search: value, status });
    }, 350);

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleStatus = (value: string) => {
        setStatus(value);
        applyFilters({ search, status: value });
    };

    const fmt = (amount: number) => `${Number(amount).toFixed(2)} ${currency}`;

    return (
        <AppLayout title="الفواتير">
            <Head title="الفواتير" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-xl text-gray-900">
                        الفواتير
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {invoices.total} فاتورة
                    </p>
                </div>
                <Link href="/invoices/create" className="btn-primary">
                    <Plus size={16} />
                    فاتورة جديدة
                </Link>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                            <TrendingUp
                                size={17}
                                className="text-emerald-600"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                إيرادات هذا الشهر
                            </p>
                            <p className="font-display font-bold text-gray-900">
                                {fmt(summary.total_revenue)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <Clock size={17} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                مبالغ معلّقة
                            </p>
                            <p className="font-display font-bold text-gray-900">
                                {fmt(summary.pending_amount)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={17} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                فواتير هذا الشهر
                            </p>
                            <p className="font-display font-bold text-gray-900">
                                {summary.invoices_count}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-4 flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        className="form-input pr-9"
                        placeholder="ابحث باسم المريض..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {/* Status filter */}
                <div className="flex gap-2">
                    {[
                        { value: "", label: "الكل" },
                        { value: "pending", label: "معلّق" },
                        { value: "paid", label: "مدفوع" },
                        { value: "partial", label: "جزئي" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleStatus(opt.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                status === opt.value
                                    ? "bg-primary-50 border-primary-500 text-primary-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {invoices.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText
                            size={40}
                            className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">لا توجد فواتير</p>
                        <Link
                            href="/invoices/create"
                            className="btn-primary mt-4 inline-flex"
                        >
                            <Plus size={16} />
                            فاتورة جديدة
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-right font-medium text-gray-600 px-5 py-3">
                                        رقم الفاتورة
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3">
                                        المريض
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden sm:table-cell">
                                        الإجمالي
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        المتبقي
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        طريقة الدفع
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3">
                                        الحالة
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoices.data.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs text-gray-700">
                                                {inv.invoice_number}
                                            </span>
                                            <p
                                                className="text-xs text-gray-400 mt-0.5"
                                                dir="ltr"
                                            >
                                                {inv.created_at}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {inv.patient}
                                        </td>
                                        <td
                                            className="px-4 py-3 hidden sm:table-cell font-semibold text-gray-900"
                                            dir="ltr"
                                        >
                                            {fmt(inv.total)}
                                        </td>
                                        <td
                                            className="px-4 py-3 hidden md:table-cell"
                                            dir="ltr"
                                        >
                                            {inv.balance_due > 0 ? (
                                                <span className="text-amber-600 font-medium">
                                                    {fmt(inv.balance_due)}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                                            {inv.payment_method
                                                ? PAYMENT_LABELS[
                                                      inv.payment_method
                                                  ]
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[inv.status] ?? ""}`}
                                            >
                                                {STATUS_LABELS[inv.status] ??
                                                    inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <Link
                                                href={`/invoices/${inv.id}`}
                                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {invoices.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    صفحة {invoices.current_page} من{" "}
                                    {invoices.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {invoices.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                })
                                            }
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                            className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs transition-colors ${
                                                link.active
                                                    ? "bg-primary-600 text-white"
                                                    : link.url
                                                      ? "text-gray-600 hover:bg-gray-100"
                                                      : "text-gray-300 cursor-not-allowed"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
