// resources/js/Pages/Patients/Show.tsx

import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import {
    Phone,
    Calendar,
    FileText,
    CreditCard,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
} from "lucide-react";

interface Appointment {
    id: number;
    doctor: string;
    starts_at: string;
    status: string;
}
interface Visit {
    id: number;
    doctor: string;
    diagnosis: string;
    created_at: string;
    is_signed: boolean;
}
interface Invoice {
    id: number;
    invoice_number: string;
    total: number;
    status: string;
    created_at: string;
}

interface Patient {
    id: number;
    name: string;
    phone: string | null;
    national_id: string | null;
    dob: string | null;
    age: number | null;
    gender: string | null;
    blood_type: string | null;
    allergies: string[] | null;
    chronic_conditions: string[] | null;
    notes: string | null;
    created_at: string;
    appointments: Appointment[];
    visits: Visit[];
    invoices: Invoice[];
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    scheduled: { label: "مجدول", cls: "status-scheduled" },
    confirmed: { label: "مؤكد", cls: "status-confirmed" },
    in_progress: { label: "جارٍ", cls: "status-in_progress" },
    completed: { label: "مكتمل", cls: "status-completed" },
    cancelled: { label: "ملغى", cls: "status-cancelled" },
    no_show: { label: "لم يحضر", cls: "status-no_show" },
};

const INVOICE_STATUS: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    paid: "bg-emerald-50 text-emerald-700",
    partial: "bg-blue-50 text-blue-700",
    cancelled: "bg-gray-100 text-gray-500",
};

const INVOICE_LABELS: Record<string, string> = {
    pending: "معلّق",
    paid: "مدفوع",
    partial: "جزئي",
    cancelled: "ملغى",
};

export default function PatientShow({ patient }: { patient: Patient }) {
    const { auth } = usePage<PageProps>().props;

    const confirmDelete = () => {
        if (confirm(`هل أنت متأكد من حذف المريض "${patient.name}"؟`)) {
            router.delete(`/patients/${patient.id}`);
        }
    };

    return (
        <AppLayout title={patient.name}>
            <Head title={patient.name} />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/patients" className="hover:text-gray-700">
                    المرضى
                </Link>
                <ChevronLeft size={14} className="rtl:rotate-180" />
                <span className="text-gray-900 font-medium">
                    {patient.name}
                </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Patient profile card ───────────────────── */}
                <div className="space-y-4">
                    <div className="card p-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold shrink-0">
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-gray-900 text-lg">
                                    {patient.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {patient.gender === "male"
                                        ? "ذكر"
                                        : patient.gender === "female"
                                          ? "أنثى"
                                          : ""}
                                    {patient.age ? ` · ${patient.age} سنة` : ""}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            {patient.phone && (
                                <InfoRow label="الجوال">
                                    <span
                                        dir="ltr"
                                        className="flex items-center gap-1.5"
                                    >
                                        <Phone
                                            size={13}
                                            className="text-gray-400"
                                        />
                                        {patient.phone}
                                    </span>
                                </InfoRow>
                            )}
                            {patient.dob && (
                                <InfoRow label="تاريخ الميلاد">
                                    <span dir="ltr">{patient.dob}</span>
                                </InfoRow>
                            )}
                            {patient.blood_type && (
                                <InfoRow label="فصيلة الدم">
                                    <span className="font-mono text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold">
                                        {patient.blood_type}
                                    </span>
                                </InfoRow>
                            )}
                            <InfoRow label="تاريخ التسجيل">
                                <span dir="ltr">{patient.created_at}</span>
                            </InfoRow>
                        </div>
                    </div>

                    {/* Medical info */}
                    {(patient.allergies?.length ||
                        patient.chronic_conditions?.length ||
                        patient.notes) && (
                        <div className="card p-5 space-y-4">
                            {patient.allergies?.length ? (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                        الحساسية
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {patient.allergies.map((a, i) => (
                                            <span
                                                key={i}
                                                className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full"
                                            >
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {patient.chronic_conditions?.length ? (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                        الأمراض المزمنة
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {patient.chronic_conditions.map(
                                            (c, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full"
                                                >
                                                    {c}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {patient.notes && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                        ملاحظات
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {patient.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="card p-4 space-y-2">
                        <Link
                            href={`/patients/${patient.id}/edit`}
                            className="btn-secondary w-full justify-center"
                        >
                            <Edit size={15} />
                            تعديل البيانات
                        </Link>
                        <Link
                            href={`/appointments/create?patient_id=${patient.id}`}
                            className="btn-primary w-full justify-center"
                        >
                            <Plus size={15} />
                            موعد جديد
                        </Link>
                        {auth.user?.can.manage_clinic && (
                            <button
                                onClick={confirmDelete}
                                className="btn-danger w-full justify-center"
                            >
                                <Trash2 size={15} />
                                حذف المريض
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Activity columns ───────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent appointments */}
                    <SectionCard
                        title="المواعيد الأخيرة"
                        icon={<Calendar size={16} />}
                        action={{
                            label: "موعد جديد",
                            href: `/appointments/create?patient_id=${patient.id}`,
                        }}
                    >
                        {patient.appointments.length === 0 ? (
                            <EmptyState text="لا توجد مواعيد" />
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {patient.appointments.map((a) => {
                                    const s = STATUS_LABELS[a.status] ?? {
                                        label: a.status,
                                        cls: "",
                                    };
                                    return (
                                        <div
                                            key={a.id}
                                            className="flex items-center justify-between px-5 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    د. {a.doctor}
                                                </p>
                                                <p
                                                    className="text-xs text-gray-500 mt-0.5"
                                                    dir="ltr"
                                                >
                                                    {a.starts_at}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full ${s.cls}`}
                                            >
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    {/* Recent visits */}
                    <SectionCard
                        title="سجل الزيارات"
                        icon={<FileText size={16} />}
                    >
                        {patient.visits.length === 0 ? (
                            <EmptyState text="لا توجد زيارات مسجّلة" />
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {patient.visits.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex items-start justify-between px-5 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {v.diagnosis || "بدون تشخيص"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                د. {v.doctor} ·{" "}
                                                <span dir="ltr">
                                                    {v.created_at}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {v.is_signed && (
                                                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                                    موقّع
                                                </span>
                                            )}
                                            <Link
                                                href={`/visits/${v.id}`}
                                                className="text-xs text-primary-600 hover:text-primary-700"
                                            >
                                                عرض
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Invoices */}
                    <SectionCard
                        title="الفواتير"
                        icon={<CreditCard size={16} />}
                        action={{
                            label: "فاتورة جديدة",
                            href: `/invoices/create?patient_id=${patient.id}`,
                        }}
                    >
                        {patient.invoices.length === 0 ? (
                            <EmptyState text="لا توجد فواتير" />
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {patient.invoices.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div>
                                            <p
                                                className="text-sm font-medium text-gray-900"
                                                dir="ltr"
                                            >
                                                {inv.invoice_number}
                                            </p>
                                            <p
                                                className="text-xs text-gray-500 mt-0.5"
                                                dir="ltr"
                                            >
                                                {inv.created_at}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full ${INVOICE_STATUS[inv.status] ?? ""}`}
                                            >
                                                {INVOICE_LABELS[inv.status] ??
                                                    inv.status}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {Number(inv.total).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900">{children}</span>
        </div>
    );
}

function SectionCard({
    title,
    icon,
    action,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    action?: { label: string; href: string };
    children: React.ReactNode;
}) {
    return (
        <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-gray-400">{icon}</span>
                    {title}
                </h3>
                {action && (
                    <Link
                        href={action.href}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                        <Plus size={12} />
                        {action.label}
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">{text}</p>
        </div>
    );
}
