// resources/js/Pages/Appointments/Edit.tsx

import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { useEffect } from "react";

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
}

interface Props {
    appointment: {
        id: number;
        patient_id: number;
        patient: string;
        doctor_id: number;
        starts_at: string; // 'YYYY-MM-DD HH:mm'
        ends_at: string; // 'YYYY-MM-DD HH:mm'
        type: string;
        notes: string | null;
    };
    doctors: Doctor[];
}

export default function AppointmentEdit({ appointment, doctors }: Props) {
    const [date, startTime] = appointment.starts_at.split(" ");
    const [, endTime] = appointment.ends_at.split(" ");

    const { data, setData, put, processing, errors } = useForm({
        doctor_id: appointment.doctor_id.toString(),
        date,
        start_time: startTime,
        end_time: endTime,
        ends_at: appointment.ends_at,
        type: appointment.type,
        notes: appointment.notes ?? "",
    });

    // Rebuild ends_at whenever date or end_time changes
    useEffect(() => {
        setData("ends_at", `${data.date} ${data.end_time}`);
    }, [data.date, data.end_time]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/appointments/${appointment.id}`, {
            data: {
                doctor_id: data.doctor_id,
                starts_at: `${data.date} ${data.start_time}`,
                ends_at: `${data.date} ${data.end_time}`,
                type: data.type,
                notes: data.notes,
            },
        } as any);
    };

    return (
        <AppLayout title="تعديل الموعد">
            <Head title={`تعديل موعد — ${appointment.patient}`} />

            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="card p-6 space-y-5">
                        <h3 className="font-semibold text-gray-900">
                            تعديل الموعد
                        </h3>

                        {/* Patient — read-only */}
                        <div>
                            <label className="form-label">المريض</label>
                            <div className="form-input bg-gray-50 text-gray-500">
                                {appointment.patient}
                            </div>
                        </div>

                        {/* Doctor */}
                        <div>
                            <label className="form-label">الطبيب *</label>
                            <select
                                className={`form-input ${errors.doctor_id ? "border-red-400" : ""}`}
                                value={data.doctor_id}
                                onChange={(e) =>
                                    setData("doctor_id", e.target.value)
                                }
                            >
                                {doctors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        د. {d.name}
                                        {d.specialty ? ` — ${d.specialty}` : ""}
                                    </option>
                                ))}
                            </select>
                            {errors.doctor_id && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.doctor_id}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="form-label">التاريخ *</label>
                            <input
                                type="date"
                                className={`form-input ${errors.starts_at ? "border-red-400" : ""}`}
                                value={data.date}
                                onChange={(e) =>
                                    setData("date", e.target.value)
                                }
                                dir="ltr"
                            />
                        </div>

                        {/* Start + End time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">
                                    وقت البداية *
                                </label>
                                <input
                                    type="time"
                                    className={`form-input ${errors.starts_at ? "border-red-400" : ""}`}
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    وقت الانتهاء *
                                </label>
                                <input
                                    type="time"
                                    className={`form-input ${errors.ends_at ? "border-red-400" : ""}`}
                                    value={data.end_time}
                                    onChange={(e) =>
                                        setData("end_time", e.target.value)
                                    }
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        {errors.starts_at && (
                            <p className="text-xs text-red-500 -mt-3">
                                {errors.starts_at}
                            </p>
                        )}

                        {/* Type */}
                        <div>
                            <label className="form-label">نوع الموعد</label>
                            <div className="flex gap-3">
                                {[
                                    { value: "booked", label: "محجوز مسبقاً" },
                                    { value: "walk_in", label: "حضور مباشر" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            setData("type", opt.value)
                                        }
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                                            data.type === opt.value
                                                ? "bg-primary-50 border-primary-500 text-primary-700"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="form-label">ملاحظات</label>
                            <textarea
                                className="form-input"
                                rows={2}
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="أي ملاحظات خاصة بهذا الموعد..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(`/appointments/${appointment.id}`)
                            }
                            className="btn-secondary"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
