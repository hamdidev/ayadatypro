import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { ChevronLeft, Plus, Eye, Edit } from "lucide-react";

interface Visit {
    id: number;
    visited_at: string;
    chief_complaint: string;
    diagnosis_code: string | null;
    is_signed: boolean;
    patient: { id: number; name: string };
    doctor: { id: number; name: string } | null;
}

interface Props {
    visits: { data: Visit[]; links: any[] };
    filters: { search?: string };
}

const STATUS = {
    true: {
        label: "موقّعة",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    false: {
        label: "مسودة",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
};

export default function VisitsIndex({ visits, filters }: Props) {
    return (
        <AppLayout title="الزيارات">
            <Head title="الزيارات" />
            <div className="p-6" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        الزيارات
                    </h1>
                    <Link
                        href="/visits/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                    >
                        <Plus size={15} />
                        زيارة جديدة
                    </Link>
                </div>

                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="text-right font-medium text-gray-500 px-4 py-3">
                                    المريض
                                </th>
                                <th className="text-right font-medium text-gray-500 px-4 py-3">
                                    الشكوى
                                </th>
                                <th className="text-right font-medium text-gray-500 px-4 py-3">
                                    الطبيب
                                </th>
                                <th className="text-right font-medium text-gray-500 px-4 py-3">
                                    التاريخ
                                </th>
                                <th className="text-right font-medium text-gray-500 px-4 py-3">
                                    الحالة
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {visits.data.map((visit) => {
                                const s =
                                    STATUS[
                                        String(
                                            visit.is_signed,
                                        ) as keyof typeof STATUS
                                    ];
                                return (
                                    <tr
                                        key={visit.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/patients/${visit.patient.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                {visit.patient.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                            {visit.chief_complaint}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {visit.doctor?.name ?? "—"}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-gray-500 dark:text-gray-400"
                                            dir="ltr"
                                        >
                                            {visit.visited_at}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${s.cls}`}
                                            >
                                                {s.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/visits/${visit.id}`}
                                                    className="text-gray-400 hover:text-blue-600"
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                                {!visit.is_signed && (
                                                    <Link
                                                        href={`/visits/${visit.id}/edit`}
                                                        className="text-gray-400 hover:text-blue-600"
                                                    >
                                                        <Edit size={15} />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {visits.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-gray-400"
                                    >
                                        لا توجد زيارات بعد
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
