import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { ChevronLeft } from "lucide-react";
import { FormEvent } from "react";

interface Patient {
    id: number;
    name: string;
}
interface Doctor {
    id: number;
    name: string;
}
interface Appointment {
    id: number;
    scheduled_at: string;
    patient: Patient;
}

interface Props {
    patients: Patient[];
    doctors: Doctor[];
    appointments: Appointment[];
    prefill?: { patient_id?: number; appointment_id?: number };
}

export default function VisitCreate({
    patients,
    doctors,
    appointments,
    prefill,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: prefill?.patient_id ?? "",
        appointment_id: prefill?.appointment_id ?? "",
        doctor_id: "",
        visited_at: new Date().toISOString().slice(0, 16),
        chief_complaint: "",
        notes: "",
        diagnosis_code: "",
        diagnosis_free_text: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/visits");
    }

    return (
        <AppLayout title="زيارة جديدة">
            <Head title="زيارة جديدة" />
            <div className="max-w-2xl mx-auto p-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/visits" className="hover:text-gray-700">
                        الزيارات
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 font-medium">
                        زيارة جديدة
                    </span>
                </div>

                <div className="card p-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        تسجيل زيارة جديدة
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
                                    setData("patient_id", e.target.value)
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

                        {/* Appointment (optional) */}
                        <div>
                            <label className="form-label">
                                الموعد (اختياري)
                            </label>
                            <select
                                className="form-input"
                                value={data.appointment_id}
                                onChange={(e) =>
                                    setData("appointment_id", e.target.value)
                                }
                            >
                                <option value="">بدون موعد مرتبط</option>
                                {appointments.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.patient.name} — {a.scheduled_at}
                                    </option>
                                ))}
                            </select>
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
                        <div>
                            <label className="form-label">
                                تاريخ الزيارة{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={data.visited_at}
                                onChange={(e) =>
                                    setData("visited_at", e.target.value)
                                }
                                dir="ltr"
                            />
                            {errors.visited_at && (
                                <p className="form-error">
                                    {errors.visited_at}
                                </p>
                            )}
                        </div>

                        {/* Chief complaint */}
                        <div>
                            <label className="form-label">
                                الشكوى الرئيسية{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="form-input min-h-[80px]"
                                value={data.chief_complaint}
                                onChange={(e) =>
                                    setData("chief_complaint", e.target.value)
                                }
                                placeholder="وصف الحالة التي جاء بها المريض..."
                            />
                            {errors.chief_complaint && (
                                <p className="form-error">
                                    {errors.chief_complaint}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="form-label">ملاحظات الطبيب</label>
                            <textarea
                                className="form-input min-h-[80px]"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="ملاحظات الفحص والعلاج..."
                            />
                        </div>

                        {/* Diagnosis */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">
                                    كود التشخيص (ICD)
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={data.diagnosis_code}
                                    onChange={(e) =>
                                        setData(
                                            "diagnosis_code",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="مثال: J06.9"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    التشخيص النصي
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={data.diagnosis_free_text}
                                    onChange={(e) =>
                                        setData(
                                            "diagnosis_free_text",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="وصف التشخيص..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? "جاري الحفظ..." : "حفظ الزيارة"}
                            </button>
                            <Link href="/visits" className="btn-secondary">
                                إلغاء
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
