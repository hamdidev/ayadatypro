import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { ChevronLeft } from "lucide-react";
import { FormEvent } from "react";

interface Visit {
    id: number;
    patient_id: number;
    appointment_id: number | null;
    doctor_id: number | null;
    visited_at: string;
    chief_complaint: string;
    notes: string | null;
    diagnosis_code: string | null;
    diagnosis_free_text: string | null;
    patient: { name: string };
}

interface Doctor {
    id: number;
    name: string;
}

interface Props {
    visit: Visit;
    doctors: Doctor[];
}

export default function VisitEdit({ visit, doctors }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        doctor_id: visit.doctor_id ?? "",
        visited_at: visit.visited_at,
        chief_complaint: visit.chief_complaint,
        notes: visit.notes ?? "",
        diagnosis_code: visit.diagnosis_code ?? "",
        diagnosis_free_text: visit.diagnosis_free_text ?? "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/visits/${visit.id}`);
    }

    return (
        <AppLayout title="تعديل الزيارة">
            <Head title="تعديل الزيارة" />
            <div className="max-w-2xl mx-auto p-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/visits" className="hover:text-gray-700">
                        الزيارات
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <Link
                        href={`/visits/${visit.id}`}
                        className="hover:text-gray-700"
                    >
                        {visit.patient.name}
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 font-medium">تعديل</span>
                </div>

                <div className="card p-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        تعديل زيارة — {visit.patient.name}
                    </h1>

                    <form onSubmit={submit} className="space-y-5">
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

                        <div>
                            <label className="form-label">تاريخ الزيارة</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={data.visited_at}
                                onChange={(e) =>
                                    setData("visited_at", e.target.value)
                                }
                                dir="ltr"
                            />
                        </div>

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
                            />
                            {errors.chief_complaint && (
                                <p className="form-error">
                                    {errors.chief_complaint}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="form-label">ملاحظات الطبيب</label>
                            <textarea
                                className="form-input min-h-[80px]"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                            />
                        </div>

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
                                    dir="ltr"
                                    placeholder="مثال: J06.9"
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
                                />
                            </div>
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
                                href={`/visits/${visit.id}`}
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
