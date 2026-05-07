import { Head, useForm, Link } from "@inertiajs/react";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
    termsVersion: string;
    privacyVersion: string;
}

export default function Register({ termsVersion, privacyVersion }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        terms_accepted: false,
        privacy_accepted: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/register");
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4"
            dir="rtl"
        >
            <Head title="إنشاء حساب" />

            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Stethoscope size={24} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-3xl text-gray-900">
                        AyadatyPro
                    </h1>
                </div>

                <div className="card p-8">
                    <h2 className="font-display font-bold text-xl text-gray-900 mb-1">
                        أنشئ حسابك مجاناً
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        14 يوماً تجريبية · لا حاجة لبطاقة ائتمان
                    </p>

                    {(errors as Record<string, string>).server && (
                        <p className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {(errors as Record<string, string>).server}
                        </p>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <Field label="اسمك الكامل *" error={errors.name}>
                            <input
                                type="text"
                                className={cx(errors.name)}
                                placeholder="د. أحمد محمد"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                autoFocus
                            />
                        </Field>

                        <Field label="البريد الإلكتروني *" error={errors.email}>
                            <input
                                type="email"
                                className={cx(errors.email)}
                                placeholder="ahmed@clinic.com"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                dir="ltr"
                                autoComplete="email"
                            />
                        </Field>

                        <Field label="رقم الجوال" error={errors.phone}>
                            <input
                                type="tel"
                                className={cx(errors.phone)}
                                placeholder="+966 5x xxx xxxx"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                dir="ltr"
                            />
                        </Field>

                        <Field label="كلمة المرور *" error={errors.password}>
                            <PasswordInput
                                value={data.password}
                                onChange={(v) => setData("password", v)}
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                                placeholder="٨ أحرف على الأقل"
                                error={errors.password}
                                autoComplete="new-password"
                            />
                        </Field>

                        <Field
                            label="تأكيد كلمة المرور *"
                            error={errors.password_confirmation}
                        >
                            <PasswordInput
                                value={data.password_confirmation}
                                onChange={(v) =>
                                    setData("password_confirmation", v)
                                }
                                show={showConfirm}
                                onToggle={() => setShowConfirm((v) => !v)}
                                placeholder="أعد كتابة كلمة المرور"
                                error={errors.password_confirmation}
                                autoComplete="new-password"
                            />
                        </Field>

                        <div className="space-y-2 pt-1">
                            <CheckboxField
                                id="terms"
                                checked={data.terms_accepted}
                                onChange={(v) => setData("terms_accepted", v)}
                                error={errors.terms_accepted}
                            >
                                أوافق على{" "}
                                <a
                                    href="/terms"
                                    target="_blank"
                                    className="text-primary-600 hover:underline"
                                >
                                    شروط الاستخدام
                                </a>{" "}
                                (v{termsVersion})
                            </CheckboxField>

                            <CheckboxField
                                id="privacy"
                                checked={data.privacy_accepted}
                                onChange={(v) => setData("privacy_accepted", v)}
                                error={errors.privacy_accepted}
                            >
                                أوافق على{" "}
                                <a
                                    href="/privacy"
                                    target="_blank"
                                    className="text-primary-600 hover:underline"
                                >
                                    سياسة الخصوصية
                                </a>{" "}
                                (v{privacyVersion})
                            </CheckboxField>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full justify-center py-2.5 mt-2"
                        >
                            {processing ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        لديك حساب؟{" "}
                        <Link
                            href="/login"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

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

function PasswordInput({
    value,
    onChange,
    show,
    onToggle,
    placeholder,
    error,
    autoComplete,
}: {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder?: string;
    error?: string;
    autoComplete?: string;
}) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                className={`${cx(error)} pl-10`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
            <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={onToggle}
                tabIndex={-1}
                aria-label={show ? "إخفاء" : "إظهار"}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

function CheckboxField({
    id,
    checked,
    onChange,
    error,
    children,
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer select-none"
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                />
                <span>{children}</span>
            </label>
            {error && <p className="text-xs text-red-500 mt-1 mr-6">{error}</p>}
        </div>
    );
}

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{label}</span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

const cx = (error?: string) =>
    `form-input ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;
