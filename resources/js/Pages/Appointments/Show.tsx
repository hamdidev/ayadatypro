// resources/js/Pages/Appointments/Show.tsx

import { Head, Link, router, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
    ChevronLeft,
    Clock,
    User,
    Stethoscope,
    FileText,
    AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface StatusLog {
    old_status: string;
    new_status: string;
    changed_by: string;
    changed_at: string;
    reason: string | null;
}

interface Appointment {
    id: number;
    status: string;
    status_badge: { label: string; color: string; value: string };
    type: string;
    starts_at: string;
    ends_at: string;
    duration: number;
    notes: string | null;
    is_past: boolean;
    patient: { id: number; name: string; phone: string | null };
    doctor: { id: number; name: string };
    created_by: string | null;
    has_visit: boolean;
    visit_id: number | null;
    allowed_transitions: { value: string; label: string }[];
    status_logs: StatusLog[];
}

const STATUS_STYLES: Record<string, string> = {
    scheduled: "status-scheduled",
    confirmed: "status-confirmed",
    in_progress: "status-in_progress",
    completed: "status-completed",
    cancelled: "status-cancelled",
    no_show: "status-no_show",
};

const COLOR_MAP: Record<string, string> = {
    blue: "bg-blue-600",
    violet: "bg-violet-600",
    amber: "bg-amber-500",
    emerald: "bg-emerald-600",
    red: "bg-red-600",
    gray: "bg-gray-500",
};

export default function AppointmentShow({
    appointment,
}: {
    appointment: Appointment;
}) {
    const { auth } = usePage<PageProps>().props;
    const [showCancelModal, setShowCancelModal] = useState(false);

    const statusForm = useForm({ status: "", reason: "" });

    const transitionTo = (status: string) => {
        if (status === "cancelled") {
            setShowCancelModal(true);
            statusForm.setData("status", "cancelled");
            return;
        }
        statusForm.setData("status", status);
        statusForm.patch(`/appointments/${appointment.id}/status`);
    };

    const confirmCancel = () => {
        statusForm.patch(`/appointments/${appointment.id}/status`, {
            onSuccess: () => setShowCancelModal(false),
        });
    };

    return (
        <AppLayout title="تفاصيل الموعد">
            <Head title={`موعد — ${appointment.patient.name}`} />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/appointments" className="hover:text-gray-700">
                    المواعيد
                </Link>
                <ChevronLeft size={14} className="rtl:rotate-180" />
                <span className="text-gray-900 font-medium">
                    {appointment.patient.name}
                </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Main info ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Appointment card */}
                    <div className="card p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[appointment.status] ?? ""}`}
                                >
                                    {appointment.status_badge.label}
                                </span>
                                {appointment.type === "walk_in" && (
                                    <span className="mr-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full">
                                        حضور مباشر
                                    </span>
                                )}
                            </div>
                            {!appointment.is_past &&
                                !["completed", "cancelled", "no_show"].includes(
                                    appointment.status,
                                ) && (
                                    <Link
                                        href={`/appointments/${appointment.id}/edit`}
                                        className="btn-secondary text-xs py-1.5"
                                    >
                                        تعديل
                                    </Link>
                                )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoBlock icon={<User size={16} />} label="المريض">
                                <Link
                                    href={`/patients/${appointment.patient.id}`}
                                    className="font-medium text-primary-600 hover:text-primary-700"
                                >
                                    {appointment.patient.name}
                                </Link>
                                {appointment.patient.phone && (
                                    <p
                                        className="text-xs text-gray-500 mt-0.5"
                                        dir="ltr"
                                    >
                                        {appointment.patient.phone}
                                    </p>
                                )}
                            </InfoBlock>

                            <InfoBlock
                                icon={<Stethoscope size={16} />}
                                label="الطبيب"
                            >
                                <p className="font-medium text-gray-900">
                                    د. {appointment.doctor.name}
                                </p>
                            </InfoBlock>

                            <InfoBlock icon={<Clock size={16} />} label="الوقت">
                                <p
                                    className="font-mono font-medium text-gray-900"
                                    dir="ltr"
                                >
                                    {appointment.starts_at.split(" ")[1]} —{" "}
                                    {appointment.ends_at}
                                </p>
                                <p className="text-xs text-gray-500" dir="ltr">
                                    {appointment.starts_at.split(" ")[0]} ·{" "}
                                    {appointment.duration} دقيقة
                                </p>
                            </InfoBlock>

                            {appointment.created_by && (
                                <InfoBlock
                                    icon={<FileText size={16} />}
                                    label="أُنشئ بواسطة"
                                >
                                    <p className="text-gray-700">
                                        {appointment.created_by}
                                    </p>
                                </InfoBlock>
                            )}
                        </div>

                        {appointment.notes && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    ملاحظات
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status history */}
                    {appointment.status_logs.length > 0 && (
                        <div className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                                سجل الحالة
                            </h3>
                            <div className="space-y-3">
                                {appointment.status_logs.map((log, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${COLOR_MAP[STATUS_STYLES[log.new_status]] ?? "bg-gray-400"}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">
                                                    {log.changed_by}
                                                </span>{" "}
                                                غيّر الحالة إلى{" "}
                                                <span
                                                    className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLES[log.new_status] ?? ""}`}
                                                >
                                                    {log.new_status}
                                                </span>
                                            </p>
                                            {log.reason && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    السبب: {log.reason}
                                                </p>
                                            )}
                                            <p
                                                className="text-xs text-gray-400 mt-0.5"
                                                dir="ltr"
                                            >
                                                {log.changed_at}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Actions sidebar ────────────────────────── */}
                <div className="space-y-4">
                    {/* Status transitions */}
                    {appointment.allowed_transitions.length > 0 && (
                        <div className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                                تغيير الحالة
                            </h3>
                            <div className="space-y-2">
                                {appointment.allowed_transitions.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => transitionTo(t.value)}
                                        disabled={statusForm.processing}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium border transition-colors text-right ${
                                            t.value === "cancelled" ||
                                            t.value === "no_show"
                                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                                : "border-primary-200 text-primary-700 hover:bg-primary-50"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Visit link / create */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                            سجل الزيارة
                        </h3>
                        {appointment.has_visit ? (
                            <Link
                                href={`/visits/${appointment.visit_id}`}
                                className="btn-secondary w-full justify-center text-sm"
                            >
                                <FileText size={14} />
                                عرض سجل الزيارة
                            </Link>
                        ) : appointment.status === "in_progress" ||
                          appointment.status === "completed" ? (
                            <Link
                                href={`/visits/create?appointment_id=${appointment.id}`}
                                className="btn-primary w-full justify-center text-sm"
                            >
                                <FileText size={14} />
                                إنشاء سجل الزيارة
                            </Link>
                        ) : (
                            <p className="text-xs text-gray-400 text-center">
                                سيتاح إنشاء سجل الزيارة عند بدء الموعد
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    dir="rtl"
                >
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle
                                    size={20}
                                    className="text-red-600"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">
                                إلغاء الموعد
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            هل أنت متأكد من إلغاء موعد{" "}
                            {appointment.patient.name}؟
                        </p>
                        <div className="mb-4">
                            <label className="form-label">
                                سبب الإلغاء (اختياري)
                            </label>
                            <textarea
                                className="form-input"
                                rows={2}
                                value={statusForm.data.reason}
                                onChange={(e) =>
                                    statusForm.setData("reason", e.target.value)
                                }
                                placeholder="رجاءً أدخل سبب الإلغاء..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmCancel}
                                disabled={statusForm.processing}
                                className="btn-danger flex-1 justify-center"
                            >
                                {statusForm.processing
                                    ? "جارٍ الإلغاء..."
                                    : "تأكيد الإلغاء"}
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="btn-secondary flex-1 justify-center"
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InfoBlock({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                {children}
            </div>
        </div>
    );
}
