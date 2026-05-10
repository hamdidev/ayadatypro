import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import {
    Stethoscope,
    Calendar,
    Clock,
    User,
    Phone,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react";

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
}

interface Slot {
    starts_at: string;
    ends_at: string;
    label: string;
}

interface Clinic {
    id: number;
    name: string;
    specialty: string | null;
    slug: string;
    timezone: string;
}

interface Props {
    clinic: Clinic;
    doctors: Doctor[];
    availableDates: string[];
}

const STEPS = [
    { id: 1, label: "الطبيب" },
    { id: 2, label: "الموعد" },
    { id: 3, label: "بياناتك" },
];

export default function BookingPortal({
    clinic,
    doctors,
    availableDates,
}: Props) {
    const [step, setStep] = useState(1);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoading] = useState(false);
    const [selectedSlot, setSlot] = useState<Slot | null>(null);
    const [currentMonth, setMonth] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const { data, setData, post, processing, errors } = useForm({
        doctor_id: "",
        starts_at: "",
        ends_at: "",
        date: "",
        name: "",
        phone: "",
        notes: "",
    });

    const selectedDoctor = doctors.find(
        (d) => d.id.toString() === data.doctor_id,
    );

    // ── Date helpers ──────────────────────────────────────────

    const daysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();

    const firstDayOfMonth = (year: number, month: number) =>
        new Date(year, month, 1).getDay(); // 0=Sun

    const formatDate = (year: number, month: number, day: number) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const isAvailable = (dateStr: string) => availableDates.includes(dateStr);

    const isPast = (dateStr: string) =>
        dateStr <= new Date().toISOString().split("T")[0];

    // ── Slot loading ──────────────────────────────────────────

    const loadSlots = async (doctorId: string, date: string) => {
        setLoading(true);
        setSlots([]);
        setSlot(null);
        try {
            const res = await axios.get(`/book/${clinic.slug}/slots`, {
                params: { doctor_id: doctorId, date },
            });
            setSlots(res.data);
        } finally {
            setLoading(false);
        }
    };

    const selectDate = (dateStr: string) => {
        if (isPast(dateStr) || !isAvailable(dateStr)) return;
        setData("date", dateStr);
        setSlot(null);
        if (data.doctor_id) loadSlots(data.doctor_id, dateStr);
    };

    const selectDoctor = (doctorId: string) => {
        setData("doctor_id", doctorId);
        setSlot(null);
        setSlots([]);
        if (data.date) loadSlots(doctorId, data.date);
    };

    const selectSlot = (slot: Slot) => {
        setSlot(slot);
        setData("starts_at", slot.starts_at);
        setData("ends_at", slot.ends_at);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/book/${clinic.slug}`);
    };

    const ARABIC_MONTHS = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
    ];
    const ARABIC_DAYS_SHORT = ["أح", "اث", "ثل", "أر", "خم", "جم", "سب"];

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            <Head title={`حجز موعد — ${clinic.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-gray-900">
                            {clinic.name}
                        </h1>
                        {clinic.specialty && (
                            <p className="text-xs text-gray-500">
                                {clinic.specialty}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Step indicators */}
                <div className="flex items-center justify-center gap-0 mb-8">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div
                                className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                                ${
                                    step === s.id
                                        ? "bg-primary-600 text-white"
                                        : step > s.id
                                          ? "text-primary-600"
                                          : "text-gray-400"
                                }
                            `}
                            >
                                {step > s.id ? (
                                    <Check size={14} />
                                ) : (
                                    <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs border-current">
                                        {s.id}
                                    </span>
                                )}
                                <span className="hidden sm:inline">
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-8 h-px mx-1 ${step > s.id ? "bg-primary-400" : "bg-gray-200"}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={submit}>
                    <div className="card p-6">
                        {/* ── Step 1: Doctor ─────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <StepHeader title="اختر الطبيب" />
                                <div className="space-y-3">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            type="button"
                                            onClick={() =>
                                                selectDoctor(
                                                    doctor.id.toString(),
                                                )
                                            }
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right ${
                                                data.doctor_id ===
                                                doctor.id.toString()
                                                    ? "border-primary-500 bg-primary-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900">
                                                    د. {doctor.name}
                                                </p>
                                                {doctor.specialty && (
                                                    <p className="text-sm text-gray-500">
                                                        {doctor.specialty}
                                                    </p>
                                                )}
                                            </div>
                                            {data.doctor_id ===
                                                doctor.id.toString() && (
                                                <Check
                                                    size={20}
                                                    className="text-primary-600 shrink-0"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Date + Time ─────────────────── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <StepHeader
                                    title="اختر التاريخ والوقت"
                                    sub={
                                        selectedDoctor
                                            ? `د. ${selectedDoctor.name}`
                                            : undefined
                                    }
                                />

                                {/* Calendar */}
                                <div>
                                    {/* Month navigation */}
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMonth((m) => {
                                                    const d = new Date(
                                                        m.year,
                                                        m.month - 1,
                                                    );
                                                    return {
                                                        year: d.getFullYear(),
                                                        month: d.getMonth(),
                                                    };
                                                })
                                            }
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {ARABIC_MONTHS[currentMonth.month]}{" "}
                                            {currentMonth.year}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMonth((m) => {
                                                    const d = new Date(
                                                        m.year,
                                                        m.month + 1,
                                                    );
                                                    return {
                                                        year: d.getFullYear(),
                                                        month: d.getMonth(),
                                                    };
                                                })
                                            }
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    </div>

                                    {/* Day headers — starts Saturday for Gulf */}
                                    <div className="grid grid-cols-7 mb-1">
                                        {ARABIC_DAYS_SHORT.map((d) => (
                                            <div
                                                key={d}
                                                className="text-center text-xs text-gray-400 py-1"
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Day grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {/* Empty cells before first day */}
                                        {Array.from({
                                            length: firstDayOfMonth(
                                                currentMonth.year,
                                                currentMonth.month,
                                            ),
                                        }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}

                                        {Array.from({
                                            length: daysInMonth(
                                                currentMonth.year,
                                                currentMonth.month,
                                            ),
                                        }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = formatDate(
                                                currentMonth.year,
                                                currentMonth.month,
                                                day,
                                            );
                                            const past = isPast(dateStr);
                                            const avail = isAvailable(dateStr);
                                            const selected =
                                                data.date === dateStr;

                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() =>
                                                        selectDate(dateStr)
                                                    }
                                                    disabled={past || !avail}
                                                    className={`
                                                        aspect-square rounded-xl text-sm font-medium transition-colors
                                                        ${
                                                            selected
                                                                ? "bg-primary-600 text-white"
                                                                : past
                                                                  ? "text-gray-300 cursor-not-allowed"
                                                                  : avail
                                                                    ? "hover:bg-primary-50 text-gray-900 cursor-pointer"
                                                                    : "text-gray-300 cursor-not-allowed"
                                                        }
                                                    `}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Slots */}
                                {data.date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                            الأوقات المتاحة ليوم{" "}
                                            <span dir="ltr">{data.date}</span>
                                        </p>

                                        {loadingSlots ? (
                                            <div className="text-center py-6 text-gray-400 text-sm">
                                                جارٍ تحميل الأوقات...
                                            </div>
                                        ) : slots.length === 0 ? (
                                            <div className="text-center py-6 text-gray-400 text-sm">
                                                لا توجد أوقات متاحة في هذا اليوم
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {slots.map((slot) => (
                                                    <button
                                                        key={slot.starts_at}
                                                        type="button"
                                                        onClick={() =>
                                                            selectSlot(slot)
                                                        }
                                                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                                            selectedSlot?.starts_at ===
                                                            slot.starts_at
                                                                ? "bg-primary-600 text-white border-primary-600"
                                                                : "border-gray-200 text-gray-700 hover:border-primary-400"
                                                        }`}
                                                        dir="ltr"
                                                    >
                                                        {slot.starts_at
                                                            .split(" ")[1]
                                                            .substring(0, 5)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 3: Patient info ────────────────── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <StepHeader
                                    title="بياناتك الشخصية"
                                    sub="نحتاج معلوماتك لتأكيد الموعد"
                                />

                                {/* Summary */}
                                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm space-y-2">
                                    <div className="flex items-center gap-2 text-primary-700">
                                        <User size={14} className="shrink-0" />
                                        <span>د. {selectedDoctor?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-700">
                                        <Calendar
                                            size={14}
                                            className="shrink-0"
                                        />
                                        <span dir="ltr">{data.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-700">
                                        <Clock size={14} className="shrink-0" />
                                        <span dir="ltr">
                                            {selectedSlot?.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="form-label">
                                            الاسم الكامل *
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.name ? "border-red-400" : ""}`}
                                            placeholder="محمد عبدالله"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            autoFocus
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">
                                            رقم الجوال *
                                        </label>
                                        <input
                                            type="tel"
                                            className={`form-input ${errors.phone ? "border-red-400" : ""}`}
                                            placeholder="+966 5x xxx xxxx"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            dir="ltr"
                                        />
                                        {errors.phone && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.phone}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            سيُستخدم لإرسال تأكيد الموعد
                                        </p>
                                    </div>

                                    <div>
                                        <label className="form-label">
                                            ملاحظات (اختياري)
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={2}
                                            placeholder="أي معلومات تريد إبلاغ الطبيب بها..."
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData("notes", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setStep((s) => s - 1)}
                                className={`btn-secondary flex items-center gap-2 ${step === 1 ? "invisible" : ""}`}
                            >
                                <ChevronRight size={16} />
                                السابق
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep((s) => s + 1)}
                                    disabled={
                                        (step === 1 && !data.doctor_id) ||
                                        (step === 2 &&
                                            (!data.date || !selectedSlot))
                                    }
                                    className="btn-primary flex items-center gap-2"
                                >
                                    التالي
                                    <ChevronLeft size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={
                                        processing || !data.name || !data.phone
                                    }
                                    className="btn-primary flex items-center gap-2 px-6"
                                >
                                    {processing ? (
                                        "جارٍ الحجز..."
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            تأكيد الحجز
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StepHeader({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="mb-2">
            <h2 className="font-display font-bold text-lg text-gray-900">
                {title}
            </h2>
            {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
        </div>
    );
}
