import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({ email: "" });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route("password.email"));
    }

    return (
        <>
            <Head title="نسيت كلمة المرور" />
            <div
                className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
                dir="rtl"
            >
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            نسيت كلمة المرور؟
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة
                            التعيين.
                        </p>

                        {status && (
                            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@clinic.com"
                                    dir="ltr"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-white transition-colors"
                            >
                                {processing
                                    ? "جاري الإرسال..."
                                    : "إرسال رابط إعادة التعيين"}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <a
                                href={route("login")}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                العودة لتسجيل الدخول
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
