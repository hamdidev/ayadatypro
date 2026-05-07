import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

import { Plus, UserX, Shield, Stethoscope, User } from "lucide-react";
import { useState } from "react";

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: "owner" | "doctor" | "receptionist";
    specialty: string | null;
    phone: string | null;
    is_active: boolean;
    avatar: string | null;
    is_me: boolean;
}

interface Props {
    staff: StaffMember[];
    canAddDoctor: boolean;
    plan: string;
}

const ROLE_LABELS = {
    owner: "صاحب العيادة",
    doctor: "طبيب",
    receptionist: "موظف استقبال",
};
const ROLE_ICONS = {
    owner: <Shield size={14} />,
    doctor: <Stethoscope size={14} />,
    receptionist: <User size={14} />,
};
const ROLE_COLORS = {
    owner: "bg-amber-50 text-amber-700 border-amber-200",
    doctor: "bg-primary-50 text-primary-700 border-primary-200",
    receptionist: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function SettingsTeam({ staff, canAddDoctor, plan }: Props) {
    const [showInvite, setShowInvite] = useState(false);

    const invite = useForm({
        name: "",
        email: "",
        role: "doctor",
        specialty: "",
        phone: "",
    });

    const submitInvite = (e: React.FormEvent) => {
        e.preventDefault();
        invite.post("/settings/team", {
            onSuccess: () => {
                setShowInvite(false);
                invite.reset();
            },
        });
    };

    const deactivate = (user: StaffMember) => {
        if (confirm(`هل أنت متأكد من تعطيل حساب ${user.name}؟`)) {
            router.delete(`/settings/team/${user.id}`);
        }
    };

    return (
        <AppLayout title="إدارة الفريق">
            <Head title="إدارة الفريق" />

            <div className="max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display font-bold text-lg text-gray-900">
                            فريق العيادة
                        </h2>
                        <p className="text-sm text-gray-500">
                            {staff.filter((s) => s.is_active).length} عضو نشط
                        </p>
                    </div>
                    <button
                        onClick={() => setShowInvite(true)}
                        className="btn-primary"
                    >
                        <Plus size={16} />
                        إضافة موظف
                    </button>
                </div>

                {/* Staff list */}
                <div className="card divide-y divide-gray-50">
                    {staff.map((member) => (
                        <div
                            key={member.id}
                            className={`flex items-center justify-between px-5 py-4 ${!member.is_active ? "opacity-50" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">
                                            {member.name}
                                        </p>
                                        {member.is_me && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                أنت
                                            </span>
                                        )}
                                        {!member.is_active && (
                                            <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                                                معطّل
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {member.email}
                                    </p>
                                    {member.specialty && (
                                        <p className="text-xs text-gray-400">
                                            {member.specialty}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${ROLE_COLORS[member.role]}`}
                                >
                                    {ROLE_ICONS[member.role]}
                                    {ROLE_LABELS[member.role]}
                                </span>

                                {!member.is_me &&
                                    !member.role.includes("owner") &&
                                    member.is_active && (
                                        <button
                                            onClick={() => deactivate(member)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="تعطيل الحساب"
                                        >
                                            <UserX size={15} />
                                        </button>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plan note */}
                {!canAddDoctor && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        وصلت إلى الحد الأقصى لعدد الأطباء في خطة{" "}
                        <strong>{plan}</strong>.
                        <a href="/settings/billing" className="underline mr-1">
                            ارقِّ خطتك
                        </a>{" "}
                        لإضافة المزيد.
                    </div>
                )}
            </div>

            {/* ── Invite modal ──────────────────────────── */}
            {showInvite && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    dir="rtl"
                >
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="font-bold text-gray-900 mb-4">
                            إضافة موظف جديد
                        </h3>

                        <form onSubmit={submitInvite} className="space-y-4">
                            <Field
                                label="الاسم الكامل *"
                                error={invite.errors.name}
                            >
                                <input
                                    type="text"
                                    className={cx(invite.errors.name)}
                                    value={invite.data.name}
                                    onChange={(e) =>
                                        invite.setData("name", e.target.value)
                                    }
                                    autoFocus
                                />
                            </Field>

                            <Field
                                label="البريد الإلكتروني *"
                                error={invite.errors.email}
                            >
                                <input
                                    type="email"
                                    className={cx(invite.errors.email)}
                                    value={invite.data.email}
                                    onChange={(e) =>
                                        invite.setData("email", e.target.value)
                                    }
                                    dir="ltr"
                                />
                            </Field>

                            <Field label="الدور *" error={invite.errors.role}>
                                <div className="flex gap-2">
                                    {[
                                        { value: "doctor", label: "طبيب" },
                                        {
                                            value: "receptionist",
                                            label: "موظف استقبال",
                                        },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                invite.setData(
                                                    "role",
                                                    opt.value,
                                                )
                                            }
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                                invite.data.role === opt.value
                                                    ? "bg-primary-50 border-primary-500 text-primary-700"
                                                    : "border-gray-200 text-gray-600"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {invite.data.role === "doctor" && (
                                <Field
                                    label="التخصص"
                                    error={invite.errors.specialty}
                                >
                                    <input
                                        type="text"
                                        className={cx(invite.errors.specialty)}
                                        value={invite.data.specialty}
                                        onChange={(e) =>
                                            invite.setData(
                                                "specialty",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="طب الأطفال..."
                                    />
                                </Field>
                            )}

                            <Field
                                label="رقم الجوال"
                                error={invite.errors.phone}
                            >
                                <input
                                    type="tel"
                                    className={cx(invite.errors.phone)}
                                    value={invite.data.phone}
                                    onChange={(e) =>
                                        invite.setData("phone", e.target.value)
                                    }
                                    dir="ltr"
                                />
                            </Field>

                            <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                                سيتم إنشاء الحساب وإرسال تعليمات تغيير كلمة
                                المرور للموظف عبر البريد الإلكتروني.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={invite.processing}
                                    className="btn-primary flex-1 justify-center"
                                >
                                    {invite.processing
                                        ? "جارٍ الإضافة..."
                                        : "إضافة الموظف"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInvite(false)}
                                    className="btn-secondary flex-1 justify-center"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
