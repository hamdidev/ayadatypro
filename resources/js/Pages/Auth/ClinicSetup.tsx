import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface GoogleUser {
    name: string;
    email: string;
    avatar: string | null;
}

interface Props {
    googleUser: GoogleUser;
}

export default function ClinicSetup({ googleUser }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        clinic_name: "",
        phone: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/register/clinic");
    }

    return (
        <>
            <Head title="إعداد العيادة" />
            <div
                className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
                dir="rtl"
            >
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-blue-600">
                            AyadatyPro
                        </h1>
                        <p className="text-gray-500 mt-2">
                            خطوة أخيرة — أخبرنا عن عيادتك
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        {/* Google user info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
                            {googleUser.avatar && (
                                <img
                                    src={googleUser.avatar}
                                    alt={googleUser.name}
                                    className="w-10 h-10 rounded-full"
                                />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {googleUser.name}
                                </p>
                                <p
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                    dir="ltr"
                                >
                                    {googleUser.email}
                                </p>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                            إعداد العيادة
                        </h2>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    اسم العيادة{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.clinic_name}
                                    onChange={(e) =>
                                        setData("clinic_name", e.target.value)
                                    }
                                    placeholder="مثال: عيادة الشفاء"
                                    autoFocus
                                />
                                {errors.clinic_name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.clinic_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-white transition-colors"
                            >
                                {processing
                                    ? "جاري الإعداد..."
                                    : "إنشاء العيادة والمتابعة →"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
