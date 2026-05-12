import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { ChevronLeft } from "lucide-react";
import { FormEvent } from "react";

interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number | null;
    scheduled_at: string;
    duration_minutes: number;
    type: string;
    status: string;
    notes: string | null;
    patient: { name: string };
}

interface Patient {
    id: number;
    name: string;
}
interface Doctor {
    id: number;
    name: string;
}

interface Props {
    appointment: Appointment;
    patients: Patient[];
    doctors: Doctor[];
}

const TYPES = [
    { value: "checkup", label: "كشف" },
    { value: "follow_up", label: "متابعة" },
    { value: "procedure", label: "إجراء" },
    { value: "emergency", label: "طارئ" },
];

const STATUSES = [
    { value: "scheduled", label: "مجدول" },
    { value: "confirmed", label: "مؤكد" },
    { value: "completed", label: "مكتمل" },
    { value: "cancelled", label: "ملغى" },
    { value: "no_show", label: "لم يحضر" },
];

export default function AppointmentEdit({
    appointment,
    patients,
    doctors,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id ?? "",
        scheduled_at: appointment.scheduled_at,
        duration_minutes: appointment.duration_minutes,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes ?? "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/appointments/${appointment.id}`);
    }

    return (
        <AppLayout title="تعديل الموعد">
            <Head title="تعديل الموعد" />
            <div className="max-w-2xl mx-auto p-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/appointments" className="hover:text-gray-700">
                        المواعيد
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 font-medium">
                        تعديل — {appointment.patient.name}
                    </span>
                </div>

                <div className="card p-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        تعديل الموعد
                    </h1>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Patient */}
                        <div>
                            <label className="form-label">
                                المريض <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="form-input"
                                value={data.patient_id}
                                onChange={(e) =>
                                    setData(
                                        "patient_id",
                                        Number(e.target.value),
                                    )
                                }
                            >
                                <option value="">اختر المريض</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            {errors.patient_id && (
                                <p className="form-error">
                                    {errors.patient_id}
                                </p>
                            )}
                        </div>

                        {/* Doctor */}
                        <div>
                            <label className="form-label">الطبيب</label>
                            <select
                                className="form-input"
                                value={data.doctor_id}
                                onChange={(e) =>
                                    setData("doctor_id", e.target.value)
                                }
                            >
                                <option value="">اختر الطبيب</option>
                                {doctors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date/time */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">
                                    التاريخ والوقت{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={data.scheduled_at}
                                    onChange={(e) =>
                                        setData("scheduled_at", e.target.value)
                                    }
                                    dir="ltr"
                                />
                                {errors.scheduled_at && (
                                    <p className="form-error">
                                        {errors.scheduled_at}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="form-label">
                                    المدة (دقيقة)
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            "duration_minutes",
                                            Number(e.target.value),
                                        )
                                    }
                                    min={5}
                                    step={5}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Type + Status */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">نوع الموعد</label>
                                <select
                                    className="form-input"
                                    value={data.type}
                                    onChange={(e) =>
                                        setData("type", e.target.value)
                                    }
                                >
                                    {TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">الحالة</label>
                                <select
                                    className="form-input"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="form-label">ملاحظات</label>
                            <textarea
                                className="form-input min-h-[80px]"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? "جاري الحفظ..." : "حفظ التعديلات"}
                            </button>
                            <Link
                                href="/appointments"
                                className="btn-secondary"
                            >
                                إلغاء
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
