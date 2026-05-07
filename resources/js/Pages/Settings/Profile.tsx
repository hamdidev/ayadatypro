// resources/js/Pages/Settings/Profile.tsx

import { Head, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface Props {
    user: {
        name: string;
        email: string;
        phone: string | null;
        specialty: string | null;
        avatar: string | null;
    };
}

export default function SettingsProfile({ user }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar,
    );

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        phone: user.phone ?? "",
        specialty: user.specialty ?? "",
        current_password: "",
        password: "",
        password_confirmation: "",
        avatar: null as File | null,
    });

    const handleAvatar = (file: File) => {
        setData("avatar", file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put("/settings/profile", { forceFormData: data.avatar !== null });
    };

    return (
        <AppLayout title="الملف الشخصي">
            <Head title="الملف الشخصي" />

            <div className="max-w-2xl space-y-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Avatar */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            الصورة الشخصية
                        </h3>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-colors bg-gray-50"
                                onClick={() => fileRef.current?.click()}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Upload
                                            size={18}
                                            className="text-gray-400 mx-auto mb-1"
                                        />
                                        <span className="text-xs text-gray-400">
                                            رفع
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="btn-secondary text-sm"
                                >
                                    تغيير الصورة
                                </button>
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG أو JPG · حد أقصى 1MB
                                </p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleAvatar(e.target.files[0])
                                }
                            />
                        </div>
                    </div>

                    {/* Basic info */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">
                            المعلومات الأساسية
                        </h3>

                        <Field label="الاسم الكامل *" error={errors.name}>
                            <input
                                type="text"
                                className={cx(errors.name)}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                autoFocus
                            />
                        </Field>

                        <Field label="البريد الإلكتروني" error={undefined}>
                            <input
                                type="email"
                                className="form-input bg-gray-50 text-gray-400 cursor-not-allowed"
                                value={user.email}
                                disabled
                                dir="ltr"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                لا يمكن تغيير البريد الإلكتروني
                            </p>
                        </Field>

                        <Field label="رقم الجوال" error={errors.phone}>
                            <input
                                type="tel"
                                className={cx(errors.phone)}
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                dir="ltr"
                            />
                        </Field>

                        <Field label="التخصص" error={errors.specialty}>
                            <input
                                type="text"
                                className={cx(errors.specialty)}
                                value={data.specialty}
                                onChange={(e) =>
                                    setData("specialty", e.target.value)
                                }
                                placeholder="طب الأطفال..."
                            />
                        </Field>
                    </div>

                    {/* Change password */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">
                            تغيير كلمة المرور
                        </h3>
                        <p className="text-xs text-gray-500 -mt-2">
                            اتركها فارغة إذا لم تريد تغييرها
                        </p>

                        <Field
                            label="كلمة المرور الحالية"
                            error={errors.current_password}
                        >
                            <input
                                type="password"
                                className={cx(errors.current_password)}
                                value={data.current_password}
                                onChange={(e) =>
                                    setData("current_password", e.target.value)
                                }
                                autoComplete="current-password"
                            />
                        </Field>

                        <Field
                            label="كلمة المرور الجديدة"
                            error={errors.password}
                        >
                            <input
                                type="password"
                                className={cx(errors.password)}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                autoComplete="new-password"
                            />
                        </Field>

                        <Field
                            label="تأكيد كلمة المرور الجديدة"
                            error={errors.password_confirmation}
                        >
                            <input
                                type="password"
                                className={cx(errors.password_confirmation)}
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                autoComplete="new-password"
                            />
                        </Field>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary"
                    >
                        {processing ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                    </button>
                </form>
            </div>
        </AppLayout>
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

const cx = (error?: string) =>
    `form-input ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;
