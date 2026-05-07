import { InertiaFormProps } from "@inertiajs/react";
import { X, Plus } from "lucide-react";
import { useState } from "react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
    name: string;
    phone: string;
    national_id: string;
    dob: string;
    gender: string;
    blood_type: string;
    allergies: string[];
    chronic_conditions: string[];
    notes: string;
    [key: string]: unknown;
}

interface Props {
    form: InertiaFormProps<FormData>;
    submitLabel: string;
    onCancel: () => void;
}

export default function PatientForm({ form, submitLabel, onCancel }: Props) {
    const { data, setData, errors, processing } = form;
    const [allergyInput, setAllergyInput] = useState("");
    const [conditionInput, setConditionInput] = useState("");

    const addTag = (
        field: "allergies" | "chronic_conditions",
        value: string,
    ) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!(data[field] as string[]).includes(trimmed)) {
            setData(field, [...(data[field] as string[]), trimmed]);
        }
    };

    const removeTag = (
        field: "allergies" | "chronic_conditions",
        index: number,
    ) => {
        setData(
            field,
            (data[field] as string[]).filter((_, i) => i !== index),
        );
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Column 1: Basic info ─────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        المعلومات الأساسية
                    </h3>

                    <div className="space-y-4">
                        {/* Name */}
                        <Field label="الاسم الكامل *" error={errors.name}>
                            <input
                                type="text"
                                className={cx(errors.name)}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="محمد عبدالله"
                                autoFocus
                            />
                        </Field>

                        {/* Phone */}
                        <Field label="رقم الجوال" error={errors.phone}>
                            <input
                                type="tel"
                                className={cx(errors.phone)}
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="+966 5x xxx xxxx"
                                dir="ltr"
                            />
                        </Field>

                        {/* National ID */}
                        <Field label="رقم الهوية" error={errors.national_id}>
                            <input
                                type="text"
                                className={cx(errors.national_id)}
                                value={data.national_id}
                                onChange={(e) =>
                                    setData("national_id", e.target.value)
                                }
                                placeholder="1xxxxxxxxx"
                                dir="ltr"
                            />
                        </Field>

                        {/* DOB */}
                        <Field label="تاريخ الميلاد" error={errors.dob}>
                            <input
                                type="date"
                                className={cx(errors.dob)}
                                value={data.dob}
                                onChange={(e) => setData("dob", e.target.value)}
                                dir="ltr"
                            />
                        </Field>

                        {/* Gender */}
                        <Field label="الجنس" error={errors.gender}>
                            <div className="flex gap-3">
                                {[
                                    { value: "male", label: "ذكر" },
                                    { value: "female", label: "أنثى" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            setData("gender", opt.value)
                                        }
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            data.gender === opt.value
                                                ? "bg-primary-50 border-primary-500 text-primary-700"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>
                </div>

                {/* Medical info */}
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        المعلومات الطبية
                    </h3>

                    <div className="space-y-4">
                        {/* Allergies */}
                        <Field label="الحساسية" error={errors.allergies}>
                            <TagInput
                                tags={data.allergies as string[]}
                                input={allergyInput}
                                onInputChange={setAllergyInput}
                                onAdd={() => {
                                    addTag("allergies", allergyInput);
                                    setAllergyInput("");
                                }}
                                onRemove={(i) => removeTag("allergies", i)}
                                placeholder="أضف حساسية واضغط Enter"
                            />
                        </Field>

                        {/* Chronic conditions */}
                        <Field
                            label="الأمراض المزمنة"
                            error={errors.chronic_conditions}
                        >
                            <TagInput
                                tags={data.chronic_conditions as string[]}
                                input={conditionInput}
                                onInputChange={setConditionInput}
                                onAdd={() => {
                                    addTag(
                                        "chronic_conditions",
                                        conditionInput,
                                    );
                                    setConditionInput("");
                                }}
                                onRemove={(i) =>
                                    removeTag("chronic_conditions", i)
                                }
                                placeholder="أضف مرضاً مزمناً واضغط Enter"
                            />
                        </Field>

                        {/* Notes */}
                        <Field label="ملاحظات" error={errors.notes}>
                            <textarea
                                className={cx(errors.notes)}
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                rows={3}
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </Field>
                    </div>
                </div>
            </div>

            {/* ── Column 2: Blood type + actions ──────────── */}
            <div className="space-y-4">
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        فصيلة الدم
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {BLOOD_TYPES.map((bt) => (
                            <button
                                key={bt}
                                type="button"
                                onClick={() =>
                                    setData(
                                        "blood_type",
                                        data.blood_type === bt ? "" : bt,
                                    )
                                }
                                className={`py-2.5 rounded-lg text-sm font-mono font-bold border transition-colors ${
                                    data.blood_type === bt
                                        ? "bg-red-50 border-red-400 text-red-700"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {bt}
                            </button>
                        ))}
                    </div>
                    {errors.blood_type && (
                        <p className="text-xs text-red-500 mt-2">
                            {errors.blood_type}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="card p-4 space-y-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full justify-center"
                    >
                        {processing ? "جارٍ الحفظ..." : submitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary w-full justify-center"
                    >
                        إلغاء
                    </button>
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

function TagInput({
    tags,
    input,
    onInputChange,
    onAdd,
    onRemove,
    placeholder,
}: {
    tags: string[];
    input: string;
    onInputChange: (v: string) => void;
    onAdd: () => void;
    onRemove: (i: number) => void;
    placeholder: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    className="form-input flex-1"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onAdd();
                        }
                    }}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={onAdd}
                    className="btn-secondary px-3"
                >
                    <Plus size={16} />
                </button>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const cx = (error?: string) =>
    `form-input ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;
