import { Head, useForm, Link } from "@inertiajs/react";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4"
            dir="rtl"
        >
            <Head title="تسجيل الدخول" />

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
                        مرحباً بعودتك
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        سجّل دخولك للمتابعة
                    </p>

                    {errors.email && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {errors.email}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="form-label">
                                البريد الإلكتروني
                            </label>
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
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="form-label">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`${cx(errors.password)} pl-10`}
                                    placeholder="كلمة المرور"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword ? "إخفاء" : "إظهار"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            تذكرني
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full justify-center py-2.5 mt-2"
                        >
                            {processing ? "جارٍ الدخول..." : "تسجيل الدخول"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        ليس لديك حساب؟{" "}
                        <Link
                            href="/register"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            أنشئ حساباً مجاناً
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const cx = (error?: string) =>
    `form-input ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;
