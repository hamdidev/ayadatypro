import { Head, Link, router, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Plus, Edit, Trash2, MapPin, Phone, Star } from "lucide-react";
import { useState } from "react";

interface Branch {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    timezone: string;
    is_main: boolean;
    is_active: boolean;
    appointments_count: number;
    users_count: number;
}

interface Props {
    branches: Branch[];
}

const GULF_TIMEZONES = [
    { value: "Asia/Riyadh", label: "الرياض (AST +3)" },
    { value: "Asia/Dubai", label: "دبي (GST +4)" },
    { value: "Asia/Kuwait", label: "الكويت (AST +3)" },
    { value: "Asia/Bahrain", label: "البحرين (AST +3)" },
    { value: "Asia/Qatar", label: "قطر (AST +3)" },
    { value: "Asia/Muscat", label: "مسقط (GST +4)" },
];

function BranchForm({
    initial,
    onSubmit,
    onCancel,
    processing,
}: {
    initial?: Partial<Branch>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    processing: boolean;
}) {
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        phone: initial?.phone ?? "",
        address: initial?.address ?? "",
        city: initial?.city ?? "",
        timezone: initial?.timezone ?? "Asia/Riyadh",
    });

    return (
        <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="form-label">اسم الفرع *</label>
                    <input
                        className="form-input"
                        value={form.name}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                        }
                    />
                </div>
                <div>
                    <label className="form-label">رقم الهاتف</label>
                    <input
                        className="form-input"
                        dir="ltr"
                        value={form.phone}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                    />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="form-label">المدينة</label>
                    <input
                        className="form-input"
                        value={form.city}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, city: e.target.value }))
                        }
                    />
                </div>
                <div>
                    <label className="form-label">المنطقة الزمنية</label>
                    <select
                        className="form-input"
                        value={form.timezone}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, timezone: e.target.value }))
                        }
                    >
                        {GULF_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label className="form-label">العنوان</label>
                <input
                    className="form-input"
                    value={form.address}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                    }
                />
            </div>
            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => onSubmit(form)}
                    disabled={processing}
                    className="btn-primary"
                >
                    {processing ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button onClick={onCancel} className="btn-secondary">
                    إلغاء
                </button>
            </div>
        </div>
    );
}

export default function BranchesIndex({ branches }: Props) {
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    function create(data: any) {
        setProcessing(true);
        router.post("/branches", data, {
            onFinish: () => {
                setProcessing(false);
                setCreating(false);
            },
        });
    }

    function update(branch: Branch, data: any) {
        setProcessing(true);
        router.patch(`/branches/${branch.id}`, data, {
            onFinish: () => {
                setProcessing(false);
                setEditingId(null);
            },
        });
    }

    function destroy(branch: Branch) {
        if (confirm(`حذف فرع "${branch.name}"؟`)) {
            router.delete(`/branches/${branch.id}`);
        }
    }

    return (
        <AppLayout title="الفروع">
            <Head title="الفروع" />
            <div className="p-6 max-w-4xl" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            الفروع
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            إدارة فروع العيادة
                        </p>
                    </div>
                    <button
                        onClick={() => setCreating(true)}
                        className="btn-primary"
                    >
                        <Plus size={15} />
                        فرع جديد
                    </button>
                </div>

                {/* Create form */}
                {creating && (
                    <div className="card p-5 mb-4">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
                            إضافة فرع جديد
                        </h2>
                        <BranchForm
                            onSubmit={create}
                            onCancel={() => setCreating(false)}
                            processing={processing}
                        />
                    </div>
                )}

                {/* Branch list */}
                <div className="space-y-3">
                    {branches.map((branch) => (
                        <div key={branch.id} className="card p-5">
                            {editingId === branch.id ? (
                                <BranchForm
                                    initial={branch}
                                    onSubmit={(data) => update(branch, data)}
                                    onCancel={() => setEditingId(null)}
                                    processing={processing}
                                />
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {branch.name}
                                            </h3>
                                            {branch.is_main && (
                                                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    <Star size={10} />
                                                    رئيسي
                                                </span>
                                            )}
                                            {!branch.is_active && (
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                    غير نشط
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            {branch.city && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {branch.city}
                                                    {branch.address
                                                        ? ` — ${branch.address}`
                                                        : ""}
                                                </span>
                                            )}
                                            {branch.phone && (
                                                <span
                                                    className="flex items-center gap-1"
                                                    dir="ltr"
                                                >
                                                    <Phone size={12} />
                                                    {branch.phone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                            <span>
                                                {branch.appointments_count} موعد
                                            </span>
                                            <span>
                                                {branch.users_count} موظف
                                            </span>
                                            <span>{branch.timezone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setEditingId(branch.id)
                                            }
                                            className="text-gray-400 hover:text-blue-600 p-1"
                                        >
                                            <Edit size={15} />
                                        </button>
                                        {!branch.is_main && (
                                            <button
                                                onClick={() => destroy(branch)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
