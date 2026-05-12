import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { ChevronLeft, Edit, FileSignature, Trash2 } from "lucide-react";

interface Visit {
    id: number;
    visited_at: string;
    chief_complaint: string;
    notes: string | null;
    diagnosis_code: string | null;
    diagnosis_free_text: string | null;
    is_signed: boolean;
    signed_at: string | null;
    patient: { id: number; name: string; phone: string | null };
    doctor: { id: number; name: string } | null;
    signed_by_user: { name: string } | null;
    prescriptions: Prescription[];
    attachments: Attachment[];
}

interface Prescription {
    id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string | null;
}

interface Attachment {
    id: number;
    file_name: string;
    label: string | null;
    url: string;
    file_type: string;
}

interface Props {
    visit: Visit;
    canEdit: boolean;
}

export default function VisitShow({ visit, canEdit }: Props) {
    function confirmDelete() {
        if (confirm("هل أنت متأكد من حذف هذه الزيارة؟")) {
            router.delete(`/visits/${visit.id}`);
        }
    }

    function sign() {
        router.post(`/visits/${visit.id}/sign`);
    }

    return (
        <AppLayout title={`زيارة — ${visit.patient.name}`}>
            <Head title={`زيارة ${visit.patient.name}`} />
            <div className="p-6" dir="rtl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/visits" className="hover:text-gray-700">
                        الزيارات
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 font-medium">
                        {visit.patient.name}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main card */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="card p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <Link
                                        href={`/patients/${visit.patient.id}`}
                                        className="text-lg font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        {visit.patient.name}
                                    </Link>
                                    {visit.patient.phone && (
                                        <p
                                            className="text-sm text-gray-500 mt-0.5"
                                            dir="ltr"
                                        >
                                            {visit.patient.phone}
                                        </p>
                                    )}
                                    <p
                                        className="text-sm text-gray-500 mt-1"
                                        dir="ltr"
                                    >
                                        {visit.visited_at}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                                        visit.is_signed
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                >
                                    {visit.is_signed ? "موقّعة" : "مسودة"}
                                </span>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                        الشكوى الرئيسية
                                    </p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        {visit.chief_complaint}
                                    </p>
                                </div>

                                {visit.notes && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            ملاحظات الطبيب
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                            {visit.notes}
                                        </p>
                                    </div>
                                )}

                                {(visit.diagnosis_code ||
                                    visit.diagnosis_free_text) && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">
                                            التشخيص
                                        </p>
                                        {visit.diagnosis_code && (
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-mono px-2 py-0.5 rounded me-2">
                                                {visit.diagnosis_code}
                                            </span>
                                        )}
                                        {visit.diagnosis_free_text && (
                                            <span className="text-sm text-gray-800 dark:text-gray-200">
                                                {visit.diagnosis_free_text}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {visit.doctor && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            الطبيب المعالج
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            د. {visit.doctor.name}
                                        </p>
                                    </div>
                                )}

                                {visit.is_signed && visit.signed_by_user && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-300">
                                        وقّعها د. {visit.signed_by_user.name} —{" "}
                                        {visit.signed_at}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Prescriptions */}
                        {visit.prescriptions.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                    الوصفات الطبية
                                </h2>
                                <div className="space-y-2">
                                    {visit.prescriptions.map((p) => (
                                        <div
                                            key={p.id}
                                            className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg text-sm"
                                        >
                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                {p.medication_name}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {p.dosage} — {p.frequency} —{" "}
                                                {p.duration}
                                            </p>
                                            {p.instructions && (
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {p.instructions}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {visit.attachments.length > 0 && (
                            <div className="card p-5">
                                <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                    المرفقات
                                </h2>
                                <div className="space-y-2">
                                    {visit.attachments.map((a) => (
                                        <a
                                            key={a.id}
                                            href={a.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg hover:bg-gray-100 transition-colors text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <span className="text-gray-400 text-xs font-mono uppercase">
                                                {a.file_type}
                                            </span>
                                            {a.label ?? a.file_name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="card p-5 space-y-2">
                            {!visit.is_signed && canEdit && (
                                <button
                                    onClick={sign}
                                    className="btn-primary w-full justify-center"
                                >
                                    <FileSignature size={15} />
                                    توقيع الزيارة
                                </button>
                            )}
                            {!visit.is_signed && canEdit && (
                                <Link
                                    href={`/visits/${visit.id}/edit`}
                                    className="btn-secondary w-full justify-center"
                                >
                                    <Edit size={15} />
                                    تعديل
                                </Link>
                            )}
                            {!visit.is_signed && canEdit && (
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
            </div>
        </AppLayout>
    );
}
