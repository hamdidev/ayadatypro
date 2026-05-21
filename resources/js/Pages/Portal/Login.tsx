import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface Props {
    status?: string;
    error?: string;
}

export default function PortalLogin({ status, error }: Props) {
    const { data, setData, post, processing } = useForm({ identifier: "" });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/portal/login");
    }

    return (
        <>
            <Head title="بوابة المريض" />
            <div
                className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
                dir="rtl"
            >
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">
                                ع
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            بوابة المريض
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رابط
                            الدخول
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        {status && (
                            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    البريد الإلكتروني أو رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.identifier}
                                    onChange={(e) =>
                                        setData("identifier", e.target.value)
                                    }
                                    placeholder="you@example.com أو 05xxxxxxxx"
                                    dir="ltr"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-2.5 text-sm font-medium text-white transition-colors"
                            >
                                {processing
                                    ? "جاري الإرسال..."
                                    : "إرسال رابط الدخول"}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        الرابط صالح لمدة 15 دقيقة فقط
                    </p>
                </div>
            </div>
        </>
    );
}
