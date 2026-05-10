import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { FileText, CheckCircle } from "lucide-react";

interface Visit {
    id: number;
    patient: string;
    doctor: string;
    diagnosis: string;
    is_signed: boolean;
    created_at: string;
    follow_up: string | null;
}

interface Pagination {
    data: Visit[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    visits: Pagination;
}

export default function VisitsIndex({ visits }: Props) {
    return (
        <AppLayout title="سجلات الزيارات">
            <Head title="سجلات الزيارات" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-xl text-gray-900">
                        سجلات الزيارات
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {visits.total} زيارة
                    </p>
                </div>
            </div>

            <div className="card overflow-hidden">
                {visits.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText
                            size={40}
                            className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">
                            لا توجد سجلات زيارات
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-right font-medium text-gray-600 px-5 py-3">
                                        المريض
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden sm:table-cell">
                                        الطبيب
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        التشخيص
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3">
                                        التاريخ
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden lg:table-cell">
                                        المتابعة
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visits.data.map((visit) => (
                                    <tr
                                        key={visit.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {visit.patient}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                                            د. {visit.doctor}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 max-w-48 truncate">
                                            {visit.diagnosis || "—"}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-gray-500 text-xs"
                                            dir="ltr"
                                        >
                                            {visit.created_at}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {visit.follow_up ? (
                                                <span
                                                    className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full"
                                                    dir="ltr"
                                                >
                                                    {visit.follow_up}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 justify-end">
                                                {visit.is_signed && (
                                                    <CheckCircle
                                                        size={14}
                                                        className="text-emerald-500"
                                                        title="موقّع"
                                                    />
                                                )}
                                                <Link
                                                    href={`/visits/${visit.id}`}
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    عرض
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {visits.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    صفحة {visits.current_page} من{" "}
                                    {visits.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {visits.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url)
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
