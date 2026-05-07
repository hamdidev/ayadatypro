// resources/js/Pages/Appointments/Create.tsx

import { Head, useForm, router } from "@inertiajs/react";

import { useState, useEffect } from "react";
import { Search, User } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import AppLayout from "../../Layouts/AppLayout";

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
}
interface PatientResult {
    id: number;
    name: string;
    phone: string | null;
}

interface Props {
    doctors: Doctor[];
    preselectedPatient: PatientResult | null;
    defaultDate: string;
    slotDuration: number;
}

export default function AppointmentCreate({
    doctors,
    preselectedPatient,
    defaultDate,
    slotDuration,
}: Props) {
    const [patientSearch, setPatientSearch] = useState(
        preselectedPatient?.name ?? "",
    );
    const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        patient_id: preselectedPatient?.id?.toString() ?? "",
        doctor_id: doctors[0]?.id?.toString() ?? "",
        date: defaultDate,
        start_time: "09:00",
        ends_at: "",
        type: "booked",
        notes: "",
    });

    // Auto-calculate ends_at from start time + slot duration
    useEffect(() => {
        if (data.date && data.start_time) {
            const [h, m] = data.start_time.split(":").map(Number);
            const start = new Date(`${data.date}T${data.start_time}`);
            start.setMinutes(start.getMinutes() + slotDuration);
            const endH = String(start.getHours()).padStart(2, "0");
            const endM = String(start.getMinutes()).padStart(2, "0");
            setData("ends_at", `${data.date} ${endH}:${endM}`);
        }
    }, [data.date, data.start_time]);

    const searchPatients = useDebouncedCallback(async (term: string) => {
        if (term.length < 2) {
            setPatientResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await axios.get("/patients/search", {
                params: { q: term },
            });
            setPatientResults(res.data);
            setShowResults(true);
        } finally {
            setSearching(false);
        }
    }, 300);

    const selectPatient = (patient: PatientResult) => {
        setData("patient_id", patient.id.toString());
        setPatientSearch(patient.name);
        setShowResults(false);
        setPatientResults([]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const starts_at = `${data.date} ${data.start_time}`;
        post("/appointments", {
            data: { ...data, starts_at },
        } as any);
    };

    return (
        <AppLayout title="موعد جديد">
            <Head title="موعد جديد" />

            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="card p-6 space-y-5">
                        <h3 className="font-semibold text-gray-900">
                            تفاصيل الموعد
                        </h3>

                        {/* Patient search */}
                        <div>
                            <label className="form-label">المريض *</label>
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    className={`form-input pr-9 ${errors.patient_id ? "border-red-400" : ""}`}
                                    placeholder="ابحث باسم المريض أو رقم الجوال..."
                                    value={patientSearch}
                                    onChange={(e) => {
                                        setPatientSearch(e.target.value);
                                        setData("patient_id", "");
                                        searchPatients(e.target.value);
                                    }}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowResults(false),
                                            200,
                                        )
                                    }
                                    autoFocus={!preselectedPatient}
                                />

                                {/* Results dropdown */}
                                {showResults && patientResults.length > 0 && (
                                    <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                        {patientResults.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => selectPatient(p)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-right"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {p.name}
                                                    </p>
                                                    {p.phone && (
                                                        <p
                                                            className="text-xs text-gray-500"
                                                            dir="ltr"
                                                        >
                                                            {p.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searching && (
                                    <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500 z-20">
                                        جارٍ البحث...
                                    </div>
                                )}
                            </div>

                            {/* Selected patient confirmation */}
                            {data.patient_id && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                    <User size={12} />
                                    تم اختيار المريض
                                </div>
                            )}
                            {errors.patient_id && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.patient_id}
                                </p>
                            )}
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

                        {/* Date + Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">التاريخ *</label>
                                <input
                                    type="date"
                                    className={`form-input ${errors.starts_at ? "border-red-400" : ""}`}
                                    value={data.date}
                                    onChange={(e) =>
                                        setData("date", e.target.value)
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                    dir="ltr"
                                />
                            </div>
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
                        </div>
                        {errors.starts_at && (
                            <p className="text-xs text-red-500 -mt-3">
                                {errors.starts_at}
                            </p>
                        )}

                        {/* Duration display */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                            <span>المدة الافتراضية:</span>
                            <span className="font-medium text-gray-700">
                                {slotDuration} دقيقة
                            </span>
                            {data.ends_at && (
                                <>
                                    <span>·</span>
                                    <span>ينتهي:</span>
                                    <span
                                        className="font-mono font-medium text-gray-700"
                                        dir="ltr"
                                    >
                                        {data.ends_at.split(" ")[1]}
                                    </span>
                                </>
                            )}
                        </div>

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
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                rows={2}
                                placeholder="أي ملاحظات خاصة بهذا الموعد..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing || !data.patient_id}
                            className="btn-primary"
                        >
                            {processing ? "جارٍ الحفظ..." : "حجز الموعد"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit("/appointments")}
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
