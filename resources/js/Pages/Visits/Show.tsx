// resources/js/Pages/Visits/Show.tsx

import { Head, Link, router, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import RichTextEditor from "../../Components/RichTextEditor";
import {
    ChevronLeft,
    Edit,
    Trash2,
    CheckCircle,
    FileText,
    Calendar,
    Paperclip,
    Upload,
    X,
} from "lucide-react";
import { useRef, useState } from "react";

interface PrescriptionItem {
    id: number;
    medicine_name: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
}

interface Prescription {
    id: number;
    instructions: string | null;
    issued_at: string | null;
    items: PrescriptionItem[];
}

interface Attachment {
    id: number;
    label: string | null;
    original_name: string | null;
    file_type: string | null;
    file_size: number | null;
    url: string;
}

interface Visit {
    id: number;
    chief_complaint: string | null;
    diagnosis_code: string | null;
    diagnosis_free_text: string | null;
    full_diagnosis: string;
    notes: string | null;
    follow_up_date: string | null;
    is_signed: boolean;
    signed_at: string | null;
    signed_by: string | null;
    created_at: string;
    patient: { id: number; name: string };
    doctor: { id: number; name: string };
    appointment_id: number | null;
    can_edit: boolean;
    can_sign: boolean;
    can_delete: boolean;
    prescriptions: Prescription[];
    attachments: Attachment[];
}

export default function VisitShow({ visit }: { visit: Visit }) {
    const [showUpload, setShowUpload] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const signForm = useForm({});

    const uploadForm = useForm({
        file: null as File | null,
        label: "",
    });

    const confirmSign = () => {
        if (
            confirm(
                "هل أنت متأكد من توقيع هذا السجل؟ لن تتمكن من تعديله بعد التوقيع.",
            )
        ) {
            signForm.post(`/visits/${visit.id}/sign`);
        }
    };

    const confirmDelete = () => {
        if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
            router.delete(`/visits/${visit.id}`);
        }
    };

    const handleFileSelect = (file: File) => {
        uploadForm.setData("file", file);
    };

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(`/visits/${visit.id}/attachments`, {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                uploadForm.reset();
            },
        });
    };

    const deleteAttachment = (attachmentId: number) => {
        if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
            router.delete(`/visits/${visit.id}/attachments/${attachmentId}`);
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <AppLayout title="سجل الزيارة">
            <Head title={`زيارة — ${visit.patient.name}`} />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link
                    href={`/patients/${visit.patient.id}`}
                    className="hover:text-gray-700"
                >
                    {visit.patient.name}
                </Link>
                <ChevronLeft size={14} className="rtl:rotate-180" />
                <span className="text-gray-900 font-medium">سجل الزيارة</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Main content ───────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Status banner */}
                    {visit.is_signed ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                            <CheckCircle
                                size={18}
                                className="text-emerald-600 shrink-0"
                            />
                            <div>
                                <span className="font-medium">موقّع ومقفل</span>
                                {" · "}وقّعه {visit.signed_by} في{" "}
                                {visit.signed_at}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                            ✏️ مسودة — يمكن تعديل هذا السجل. وقّعه لإقفاله
                            رسمياً.
                        </div>
                    )}

                    {/* Visit details */}
                    <div className="card p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                                تفاصيل الزيارة
                            </h3>
                            <span className="text-xs text-gray-400" dir="ltr">
                                {visit.created_at}
                            </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl text-sm">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    المريض
                                </p>
                                <Link
                                    href={`/patients/${visit.patient.id}`}
                                    className="font-medium text-primary-600"
                                >
                                    {visit.patient.name}
                                </Link>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    الطبيب
                                </p>
                                <p className="font-medium text-gray-900">
                                    د. {visit.doctor.name}
                                </p>
                            </div>
                        </div>

                        {visit.chief_complaint && (
                            <Section label="الشكوى الرئيسية">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {visit.chief_complaint}
                                </p>
                            </Section>
                        )}

                        {visit.full_diagnosis && (
                            <Section label="التشخيص">
                                <div className="flex items-start gap-2">
                                    {visit.diagnosis_code && (
                                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded shrink-0 font-bold">
                                            {visit.diagnosis_code}
                                        </span>
                                    )}
                                    <p className="text-gray-700 text-sm">
                                        {visit.diagnosis_free_text}
                                    </p>
                                </div>
                            </Section>
                        )}

                        {visit.notes && (
                            <Section label="ملاحظات الطبيب">
                                {/* Read-only TipTap view */}
                                <RichTextEditor
                                    value={visit.notes}
                                    onChange={() => {}}
                                    editable={false}
                                    minHeight="auto"
                                />
                            </Section>
                        )}

                        {visit.follow_up_date && (
                            <Section label="موعد المتابعة">
                                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-sm w-fit">
                                    <Calendar size={15} className="shrink-0" />
                                    <span dir="ltr">
                                        {visit.follow_up_date}
                                    </span>
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Prescriptions */}
                    {visit.prescriptions.length > 0 && (
                        <div className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                الوصفة الطبية
                            </h3>
                            {visit.prescriptions.map((p) => (
                                <div key={p.id} className="space-y-3">
                                    {p.instructions && (
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {p.instructions}
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {p.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg"
                                            >
                                                <div className="w-2 h-2 bg-primary-400 rounded-full mt-1.5 shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">
                                                        {item.medicine_name}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-0.5">
                                                        {[
                                                            item.dosage,
                                                            item.frequency,
                                                            item.duration,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Attachments */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Paperclip
                                    size={16}
                                    className="text-gray-400"
                                />
                                المرفقات
                            </h3>
                            {visit.can_edit && (
                                <button
                                    onClick={() => setShowUpload((v) => !v)}
                                    className="btn-secondary text-sm"
                                >
                                    <Upload size={14} />
                                    رفع ملف
                                </button>
                            )}
                        </div>

                        {/* Upload form */}
                        {showUpload && (
                            <form
                                onSubmit={submitUpload}
                                className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3"
                            >
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {uploadForm.data.file ? (
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                            <Paperclip size={16} />
                                            {uploadForm.data.file.name}
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload
                                                size={20}
                                                className="mx-auto text-gray-400 mb-2"
                                            />
                                            <p className="text-sm text-gray-500">
                                                اضغط لاختيار ملف
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PDF، صور — حد أقصى 10MB
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(e) =>
                                            e.target.files?.[0] &&
                                            handleFileSelect(e.target.files[0])
                                        }
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        placeholder="تسمية الملف (اختياري) — مثال: نتيجة تحليل دم"
                                        value={uploadForm.data.label}
                                        onChange={(e) =>
                                            uploadForm.setData(
                                                "label",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            !uploadForm.data.file ||
                                            uploadForm.processing
                                        }
                                        className="btn-primary text-sm"
                                    >
                                        {uploadForm.processing
                                            ? "جارٍ الرفع..."
                                            : "رفع"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="btn-secondary text-sm"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        )}

                        {visit.attachments.length === 0 && !showUpload ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                لا توجد مرفقات
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {visit.attachments.map((a) => (
                                    <div
                                        key={a.id}
                                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Paperclip
                                                size={16}
                                                className="text-gray-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={a.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-primary-600 hover:text-primary-700 truncate block"
                                            >
                                                {a.label ?? a.original_name}
                                            </a>
                                            <p className="text-xs text-gray-400">
                                                {a.file_type}{" "}
                                                {a.file_size
                                                    ? `· ${formatFileSize(a.file_size)}`
                                                    : ""}
                                            </p>
                                        </div>
                                        {visit.can_edit && (
                                            <button
                                                onClick={() =>
                                                    deleteAttachment(a.id)
                                                }
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sidebar actions ────────────────────── */}
                <div className="space-y-4">
                    <div className="card p-5 space-y-2">
                        {visit.can_sign && !visit.is_signed && (
                            <button
                                onClick={confirmSign}
                                disabled={signForm.processing}
                                className="btn-primary w-full justify-center"
                            >
                                <CheckCircle size={15} />
                                توقيع وإقفال السجل
                            </button>
                        )}

                        {visit.can_edit && (
                            <Link
                                href={`/visits/${visit.id}/edit`}
                                className="btn-secondary w-full justify-center"
                            >
                                <Edit size={15} />
                                تعديل
                            </Link>
                        )}

                        {visit.appointment_id && (
                            <Link
                                href={`/appointments/${visit.appointment_id}`}
                                className="btn-secondary w-full justify-center text-sm"
                            >
                                عرض الموعد
                            </Link>
                        )}

                        {visit.can_delete && (
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
        </AppLayout>
    );
}

function Section({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            {children}
        </div>
    );
}
