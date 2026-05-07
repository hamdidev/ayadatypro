import { Head, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const SPECIALTIES = [
    "طب عام",
    "طب الأطفال",
    "طب الأسنان",
    "طب النساء والتوليد",
    "طب العيون",
    "الجراحة العامة",
    "طب القلب",
    "طب الجهاز الهضمي",
    "أمراض الجلدية",
    "الطب النفسي",
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
    { value: "SAR", label: "ريال سعودي" },
    { value: "AED", label: "درهم إماراتي" },
    { value: "KWD", label: "دينار كويتي" },
    { value: "QAR", label: "ريال قطري" },
    { value: "BHD", label: "دينار بحريني" },
    { value: "OMR", label: "ريال عماني" },
    { value: "EGP", label: "جنيه مصري" },
    { value: "EUR", label: "يورو" },
];

interface Props {
    clinic: {
        name: string;
        phone: string | null;
        address: string | null;
        specialty: string | null;
        logo: string | null;
        timezone: string;
        currency: string;
        week_start: string;
    };
    settings: {
        appointment_duration: number;
        buffer_time: number;
        allow_online_booking: boolean;
        require_approval_for_new_patients: boolean;
    };
}

export default function SettingsClinic({ clinic, settings }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(clinic.logo);

    const { data, setData, put, processing, errors } = useForm({
        name: clinic.name,
        phone: clinic.phone ?? "",
        address: clinic.address ?? "",
        specialty: clinic.specialty ?? "",
        timezone: clinic.timezone,
        currency: clinic.currency,
        week_start: clinic.week_start,
        logo: null as File | null,

        appointment_duration: settings.appointment_duration,
        buffer_time: settings.buffer_time,
        allow_online_booking: settings.allow_online_booking,
        require_approval_for_new_patients:
            settings.require_approval_for_new_patients,
    });

    const handleLogo = (file: File) => {
        setData("logo", file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put("/settings/clinic", { forceFormData: true });
    };

    return (
        <AppLayout title="إعدادات العيادة">
            <Head title="إعدادات العيادة" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                {/* ── Clinic identity ────────────────────── */}
                <Section title="هوية العيادة">
                    {/* Logo */}
                    <div>
                        <label className="form-label">شعار العيادة</label>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-colors bg-gray-50"
                                onClick={() => fileRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <Upload
                                        size={20}
                                        className="text-gray-400"
                                    />
                                )}
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="btn-secondary text-sm"
                                >
                                    تغيير الشعار
                                </button>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogoPreview(null);
                                            setData("logo", null);
                                        }}
                                        className="btn-secondary text-sm mr-2 text-red-500"
                                    >
                                        <X size={14} /> حذف
                                    </button>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG أو JPG · حد أقصى 2MB
                                </p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleLogo(e.target.files[0])
                                }
                            />
                        </div>
                    </div>

                    <Field label="اسم العيادة *" error={errors.name}>
                        <input
                            type="text"
                            className={cx(errors.name)}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
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
                            <option value="">اختر التخصص</option>
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
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            dir="ltr"
                        />
                    </Field>

                    <Field label="العنوان" error={errors.address}>
                        <textarea
                            className={cx(errors.address)}
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            rows={2}
                        />
                    </Field>
                </Section>

                {/* ── Localization ───────────────────────── */}
                <Section title="الإعدادات الإقليمية">
                    <Field label="المنطقة الزمنية" error={errors.timezone}>
                        <select
                            className={cx(errors.timezone)}
                            value={data.timezone}
                            onChange={(e) =>
                                setData("timezone", e.target.value)
                            }
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
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
                                <option key={c.value} value={c.value}>
                                    {c.label} ({c.value})
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="بداية الأسبوع" error={errors.week_start}>
                        <div className="flex gap-3">
                            {[
                                { value: "saturday", label: "السبت" },
                                { value: "sunday", label: "الأحد" },
                                { value: "monday", label: "الاثنين" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                        setData("week_start", opt.value)
                                    }
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        data.week_start === opt.value
                                            ? "bg-primary-50 border-primary-500 text-primary-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </Field>
                </Section>

                {/* ── Appointment settings ───────────────── */}
                <Section title="إعدادات المواعيد">
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
                                setData("buffer_time", Number(e.target.value))
                            }
                            className="w-full accent-primary-600"
                        />
                    </Field>

                    <Toggle
                        label="السماح بالحجز الإلكتروني"
                        sub="يتيح للمرضى الحجز عبر الرابط العام"
                        checked={data.allow_online_booking}
                        onChange={(v) => setData("allow_online_booking", v)}
                    />

                    <Toggle
                        label="طلب موافقة للمرضى الجدد"
                        sub="المواعيد من مرضى جدد تحتاج مراجعة يدوية"
                        checked={data.require_approval_for_new_patients}
                        onChange={(v) =>
                            setData("require_approval_for_new_patients", v)
                        }
                    />
                </Section>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        {processing ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
                {title}
            </h3>
            {children}
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

function Toggle({
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
        <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
            <div
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mr-4 ${checked ? "bg-primary-600" : "bg-gray-300"}`}
                onClick={() => onChange(!checked)}
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
