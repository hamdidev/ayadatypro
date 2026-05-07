// resources/js/Pages/Appointments/Index.tsx

import { Head, Link, router } from "@inertiajs/react";

import {
    Plus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
} from "lucide-react";
import { useState } from "react";
import AppLayout from "../../Layouts/AppLayout";

interface Appointment {
    id: number;
    patient: string;
    doctor: string;
    starts_at: string;
    ends_at: string;
    status: string;
    type: string;
    duration: number;
}

interface Doctor {
    id: number;
    name: string;
}
interface Status {
    value: string;
    label: string;
}

interface Pagination {
    data: Appointment[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    appointments: Pagination;
    doctors: Doctor[];
    statuses: Status[];
    filters: { date?: string; doctor_id?: string; status?: string };
}

const STATUS_STYLES: Record<string, string> = {
    scheduled: "status-scheduled",
    confirmed: "status-confirmed",
    in_progress: "status-in_progress",
    completed: "status-completed",
    cancelled: "status-cancelled",
    no_show: "status-no_show",
};

const TYPE_LABELS: Record<string, string> = {
    booked: "محجوز",
    walk_in: "حضور مباشر",
};

export default function AppointmentsIndex({
    appointments,
    doctors,
    statuses,
    filters,
}: Props) {
    const [date, setDate] = useState(filters.date ?? "");
    const [doctorId, setDoctorId] = useState(filters.doctor_id ?? "");
    const [status, setStatus] = useState(filters.status ?? "");

    const applyFilters = (params: Record<string, string>) => {
        router.get("/appointments", params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDate = (v: string) => {
        setDate(v);
        applyFilters({ date: v, doctor_id: doctorId, status });
    };

    const handleDoctor = (v: string) => {
        setDoctorId(v);
        applyFilters({ date, doctor_id: v, status });
    };

    const handleStatus = (v: string) => {
        setStatus(v);
        applyFilters({ date, doctor_id: doctorId, status: v });
    };

    const clearFilters = () => {
        setDate("");
        setDoctorId("");
        setStatus("");
        router.get("/appointments", {}, { preserveState: true, replace: true });
    };

    const hasFilters = date || doctorId || status;

    return (
        <AppLayout title="المواعيد">
            <Head title="المواعيد" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-xl text-gray-900">
                        المواعيد
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {appointments.total} موعد
                    </p>
                </div>
                <Link href="/appointments/create" className="btn-primary">
                    <Plus size={16} />
                    موعد جديد
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">
                            التاريخ
                        </label>
                        <input
                            type="date"
                            className="form-input text-sm"
                            value={date}
                            onChange={(e) => handleDate(e.target.value)}
                            dir="ltr"
                        />
                    </div>

                    {/* Doctor */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">
                            الطبيب
                        </label>
                        <select
                            className="form-input text-sm"
                            value={doctorId}
                            onChange={(e) => handleDoctor(e.target.value)}
                        >
                            <option value="">جميع الأطباء</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">
                            الحالة
                        </label>
                        <select
                            className="form-input text-sm"
                            value={status}
                            onChange={(e) => handleStatus(e.target.value)}
                        >
                            <option value="">جميع الحالات</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="btn-secondary text-sm"
                        >
                            مسح الفلاتر
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {appointments.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Calendar
                            size={40}
                            className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">
                            {hasFilters
                                ? "لا توجد مواعيد بهذه الفلاتر"
                                : "لا توجد مواعيد قادمة"}
                        </p>
                        <Link
                            href="/appointments/create"
                            className="btn-primary mt-4 inline-flex"
                        >
                            <Plus size={16} />
                            موعد جديد
                        </Link>
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
                                    <th className="text-right font-medium text-gray-600 px-4 py-3">
                                        الوقت
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        النوع
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3">
                                        الحالة
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {appointments.data.map((appt) => (
                                    <tr
                                        key={appt.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900">
                                                {appt.patient}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                                            د. {appt.doctor}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p
                                                className="font-mono text-sm text-gray-900"
                                                dir="ltr"
                                            >
                                                {appt.starts_at.split(" ")[1]} —{" "}
                                                {appt.ends_at}
                                            </p>
                                            <p
                                                className="text-xs text-gray-400"
                                                dir="ltr"
                                            >
                                                {appt.starts_at.split(" ")[0]}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                    appt.type === "walk_in"
                                                        ? "bg-orange-50 text-orange-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {TYPE_LABELS[appt.type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[appt.status] ?? ""}`}
                                            >
                                                {statuses.find(
                                                    (s) =>
                                                        s.value === appt.status,
                                                )?.label ?? appt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <Link
                                                href={`/appointments/${appt.id}`}
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
                        {appointments.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    صفحة {appointments.current_page} من{" "}
                                    {appointments.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {appointments.links.map((link, i) => (
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
