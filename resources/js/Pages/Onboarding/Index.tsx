import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    Stethoscope,
    Building2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ClinicData {
    name: string;
    specialty: string;
    phone: string;
    address: string;
    timezone: string;
    currency: string;
    week_start: string;
}

interface SettingsData {
    appointment_duration: number;
    buffer_time: number;
    allow_online_booking: boolean;
    require_approval_for_new_patients: boolean;
}

interface Props {
    user: { name: string; email: string };
    clinic: ClinicData;
    settings: SettingsData;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const SPECIALTIES = [
    "طب عام",
    "طب الأطفال",
    "طب الأسنان",
    "طب النساء والتوليد",
    "طب العيون",
    "الجراحة العامة",
    "طب القلب",
    "طب الجهاز الهضمي",
    "طب الجهاز البولي",
    "أمراض الجلدية",
    "الطب النفسي",
    "طب الطوارئ",
    "التخدير",
    "الأشعة",
    "أخرى",
];

const TIMEZONES = [
    { value: "Asia/Riyadh", label: "الرياض (GMT+3)" },
    { value: "Asia/Dubai", label: "دبي (GMT+4)" },
    { value: "Asia/Kuwait", label: "الكويت (GMT+3)" },
    { value: "Asia/Bahrain", label: "البحرين (GMT+3)" },
    { value: "Asia/Qatar", label: "قطر (GMT+3)" },
    { value: "Asia/Muscat", label: "مسقط (GMT+4)" },
    { value: "Africa/Cairo", label: "القاهرة (GMT+2)" },
    { value: "Europe/Berlin", label: "برلين (GMT+1)" },
];

const CURRENCIES = [
    { value: "SAR", label: "ريال سعودي (SAR)" },
    { value: "AED", label: "درهم إماراتي (AED)" },
    { value: "KWD", label: "دينار كويتي (KWD)" },
    { value: "QAR", label: "ريال قطري (QAR)" },
    { value: "BHD", label: "دينار بحريني (BHD)" },
    { value: "OMR", label: "ريال عماني (OMR)" },
    { value: "EGP", label: "جنيه مصري (EGP)" },
    { value: "EUR", label: "يورو (EUR)" },
];

const WEEK_STARTS = [
    { value: "saturday", label: "السبت (الخليج)" },
    { value: "sunday", label: "الأحد" },
    { value: "monday", label: "الاثنين (أوروبا)" },
];

const STEPS = [
    { id: 1, label: "هوية العيادة", icon: Building2 },
    { id: 2, label: "الإعدادات الإقليمية", icon: Clock },
    { id: 3, label: "إعدادات المواعيد", icon: Stethoscope },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function Onboarding({ user, clinic, settings }: Props) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        // Step 1
        clinic_name: clinic.name ?? "",
        specialty: clinic.specialty ?? "",
        phone: clinic.phone ?? "",
        address: clinic.address ?? "",
        // Step 2
        timezone: clinic.timezone ?? "Asia/Riyadh",
        currency: clinic.currency ?? "SAR",
        week_start: clinic.week_start ?? "saturday",
        // Step 3
        appointment_duration: settings.appointment_duration ?? 20,
        buffer_time: settings.buffer_time ?? 5,
        allow_online_booking: settings.allow_online_booking ?? true,
        require_approval_for_new_patients:
            settings.require_approval_for_new_patients ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/onboarding");
    };

    const canProceed = () => {
        if (step === 1) return data.clinic_name.trim().length > 0;
        return true;
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 to-white"
            dir="rtl"
        >
            <Head title="إعداد العيادة" />

            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg mb-4">
                        <Stethoscope size={28} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
                        مرحباً، {user.name.split(" ")[0]} 👋
                    </h1>
                    <p className="text-gray-500 text-sm">
                        دعنا نُعِدّ عيادتك في دقيقتين
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-0 mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            {/* Step circle */}
                            <button
                                onClick={() => step > s.id && setStep(s.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${
                                        step === s.id
                                            ? "bg-primary-600 text-white shadow-sm"
                                            : step > s.id
                                              ? "text-primary-600 hover:bg-primary-50 cursor-pointer"
                                              : "text-gray-400 cursor-default"
                                    }
                                `}
                            >
                                {step > s.id ? (
                                    <Check size={14} />
                                ) : (
                                    <s.icon size={14} />
                                )}
                                <span className="hidden sm:inline">
                                    {s.label}
                                </span>
                                <span className="sm:hidden">{s.id}</span>
                            </button>

                            {/* Connector */}
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-8 h-px mx-1 ${step > s.id ? "bg-primary-400" : "bg-gray-200"}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <form onSubmit={submit}>
                    <div className="card p-8">
                        {/* ── Step 1: Clinic identity ─────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <StepHeader
                                    title="ما اسم عيادتك؟"
                                    sub="يمكنك تغيير هذه المعلومات لاحقاً من الإعدادات"
                                />

                                <Field
                                    label="اسم العيادة *"
                                    error={errors.clinic_name}
                                >
                                    <input
                                        type="text"
                                        className={cx(errors.clinic_name)}
                                        placeholder="عيادة الدكتور أحمد"
                                        value={data.clinic_name}
                                        onChange={(e) =>
                                            setData(
                                                "clinic_name",
                                                e.target.value,
                                            )
                                        }
                                        autoFocus
                                    />
                                </Field>

                                <Field label="التخصص" error={errors.specialty}>
                                    <select
                                        className={cx(errors.specialty)}
                                        value={data.specialty}
                                        onChange={(e) =>
                                            setData("specialty", e.target.value)
                                        }
                                    >
                                        <option value="">اختر التخصص...</option>
                                        {SPECIALTIES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="رقم الهاتف" error={errors.phone}>
                                    <input
                                        type="tel"
                                        className={cx(errors.phone)}
                                        placeholder="+966 1x xxx xxxx"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        dir="ltr"
                                    />
                                </Field>

                                <Field label="العنوان" error={errors.address}>
                                    <textarea
                                        className={cx(errors.address)}
                                        placeholder="شارع الملك فهد، الرياض..."
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        rows={2}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* ── Step 2: Localization ────────────────────────── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <StepHeader
                                    title="الإعدادات الإقليمية"
                                    sub="تؤثر على عرض التواريخ والأوقات والعملة"
                                />

                                <Field
                                    label="المنطقة الزمنية"
                                    error={errors.timezone}
                                >
                                    <select
                                        className={cx(errors.timezone)}
                                        value={data.timezone}
                                        onChange={(e) =>
                                            setData("timezone", e.target.value)
                                        }
                                    >
                                        {TIMEZONES.map((tz) => (
                                            <option
                                                key={tz.value}
                                                value={tz.value}
                                            >
                                                {tz.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="العملة" error={errors.currency}>
                                    <select
                                        className={cx(errors.currency)}
                                        value={data.currency}
                                        onChange={(e) =>
                                            setData("currency", e.target.value)
                                        }
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option
                                                key={c.value}
                                                value={c.value}
                                            >
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="بداية الأسبوع"
                                    error={errors.week_start}
                                >
                                    <div className="flex gap-3">
                                        {WEEK_STARTS.map((ws) => (
                                            <button
                                                key={ws.value}
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        "week_start",
                                                        ws.value,
                                                    )
                                                }
                                                className={`
                                                    flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                                                    ${
                                                        data.week_start ===
                                                        ws.value
                                                            ? "bg-primary-50 border-primary-500 text-primary-700"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                    }
                                                `}
                                            >
                                                {ws.label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        )}

                        {/* ── Step 3: Appointment settings ───────────────── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <StepHeader
                                    title="إعدادات المواعيد"
                                    sub="كيف تريد تنظيم مواعيد عيادتك؟"
                                />

                                <Field
                                    label={`مدة الموعد الافتراضية: ${data.appointment_duration} دقيقة`}
                                    error={errors.appointment_duration}
                                >
                                    <input
                                        type="range"
                                        min={5}
                                        max={120}
                                        step={5}
                                        value={data.appointment_duration}
                                        onChange={(e) =>
                                            setData(
                                                "appointment_duration",
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full accent-primary-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>5 د</span>
                                        <span>30 د</span>
                                        <span>60 د</span>
                                        <span>120 د</span>
                                    </div>
                                </Field>

                                <Field
                                    label={`وقت الفاصل بين المواعيد: ${data.buffer_time} دقيقة`}
                                    error={errors.buffer_time}
                                >
                                    <input
                                        type="range"
                                        min={0}
                                        max={60}
                                        step={5}
                                        value={data.buffer_time}
                                        onChange={(e) =>
                                            setData(
                                                "buffer_time",
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full accent-primary-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>بدون فاصل</span>
                                        <span>30 د</span>
                                        <span>60 د</span>
                                    </div>
                                </Field>

                                <div className="space-y-3 pt-2">
                                    <ToggleField
                                        label="السماح بالحجز الإلكتروني"
                                        sub="يتيح للمرضى حجز مواعيد عبر الرابط العام"
                                        checked={data.allow_online_booking}
                                        onChange={(v) =>
                                            setData("allow_online_booking", v)
                                        }
                                    />
                                    <ToggleField
                                        label="طلب موافقة للمرضى الجدد"
                                        sub="المواعيد من مرضى جدد تحتاج موافقة يدوية"
                                        checked={
                                            data.require_approval_for_new_patients
                                        }
                                        onChange={(v) =>
                                            setData(
                                                "require_approval_for_new_patients",
                                                v,
                                            )
                                        }
                                    />
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
                                    disabled={!canProceed()}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    التالي
                                    <ChevronLeft size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary flex items-center gap-2 px-6"
                                >
                                    {processing ? (
                                        "جارٍ الحفظ..."
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            ابدأ الآن
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Step counter */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    الخطوة {step} من {STEPS.length}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function StepHeader({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="mb-2">
            <h3 className="font-display font-bold text-lg text-gray-900">
                {title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="form-label">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function ToggleField({
    label,
    sub,
    checked,
    onChange,
}: {
    label: string;
    sub: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onChange(!checked)}
        >
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
            <div
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mr-4 ${checked ? "bg-primary-600" : "bg-gray-300"}`}
            >
                <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "right-0.5" : "left-0.5"}`}
                />
            </div>
        </label>
    );
}

const cx = (error?: string) =>
    `form-input ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;
