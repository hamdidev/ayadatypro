// resources/js/Components/VisitForm.tsx
// Shared by Visits/Create and Visits/Edit

import { InertiaFormProps } from "@inertiajs/react";
import RichTextEditor from "./RichTextEditor";
import { Plus, Trash2 } from "lucide-react";

interface PrescriptionItem {
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface FormData {
    chief_complaint: string;
    diagnosis_code: string;
    diagnosis_free_text: string;
    notes: string;
    follow_up_date: string;
    prescription: {
        instructions: string;
        items: PrescriptionItem[];
    } | null;
    [key: string]: unknown;
}

interface Props {
    form: InertiaFormProps<FormData>;
    submitLabel: string;
    patientName: string;
    doctorName: string;
    onCancel: () => void;
}

const COMMON_FREQUENCIES = [
    "مرة يومياً",
    "مرتان يومياً",
    "3 مرات يومياً",
    "عند الحاجة",
    "كل 8 ساعات",
    "كل 12 ساعة",
];
const COMMON_DURATIONS = [
    "3 أيام",
    "5 أيام",
    "7 أيام",
    "10 أيام",
    "14 يوماً",
    "شهر",
    "مستمر",
];

export default function VisitForm({
    form,
    submitLabel,
    patientName,
    doctorName,
    onCancel,
}: Props) {
    const { data, setData, errors, processing } = form;

    const hasPrescription = data.prescription !== null;

    const addPrescription = () => {
        setData("prescription", { instructions: "", items: [emptyItem()] });
    };

    const removePrescription = () => {
        setData("prescription", null);
    };

    const addItem = () => {
        if (!data.prescription) return;
        setData("prescription", {
            ...data.prescription,
            items: [...data.prescription.items, emptyItem()],
        });
    };

    const removeItem = (index: number) => {
        if (!data.prescription) return;
        setData("prescription", {
            ...data.prescription,
            items: data.prescription.items.filter((_, i) => i !== index),
        });
    };

    const updateItem = (
        index: number,
        field: keyof PrescriptionItem,
        value: string,
    ) => {
        if (!data.prescription) return;
        const items = [...data.prescription.items];
        items[index] = { ...items[index], [field]: value };
        setData("prescription", { ...data.prescription, items });
    };

    return (
        <div className="space-y-5">
            {/* Patient + Doctor header */}
            <div className="card p-4 grid sm:grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 mb-1">المريض</p>
                    <p className="font-semibold text-gray-900">{patientName}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">الطبيب</p>
                    <p className="font-semibold text-gray-900">
                        د. {doctorName}
                    </p>
                </div>
            </div>

            {/* Clinical notes */}
            <div className="card p-6 space-y-5">
                <h3 className="font-semibold text-gray-900">ملاحظات الزيارة</h3>

                <Field label="الشكوى الرئيسية" error={errors.chief_complaint}>
                    <textarea
                        className={cx(errors.chief_complaint)}
                        rows={2}
                        placeholder="ما الذي يشتكي منه المريض؟"
                        value={data.chief_complaint}
                        onChange={(e) =>
                            setData("chief_complaint", e.target.value)
                        }
                        autoFocus
                    />
                </Field>

                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                        <Field label="ICD-10" error={errors.diagnosis_code}>
                            <input
                                type="text"
                                className={cx(errors.diagnosis_code)}
                                placeholder="J06.9"
                                value={data.diagnosis_code}
                                onChange={(e) =>
                                    setData(
                                        "diagnosis_code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                dir="ltr"
                            />
                        </Field>
                    </div>
                    <div className="col-span-3">
                        <Field
                            label="التشخيص"
                            error={errors.diagnosis_free_text}
                        >
                            <input
                                type="text"
                                className={cx(errors.diagnosis_free_text)}
                                placeholder="وصف التشخيص..."
                                value={data.diagnosis_free_text}
                                onChange={(e) =>
                                    setData(
                                        "diagnosis_free_text",
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                </div>

                {/* TipTap rich text editor */}
                <Field label="ملاحظات الطبيب" error={errors.notes}>
                    <RichTextEditor
                        value={data.notes}
                        onChange={(v) => setData("notes", v)}
                        placeholder="فحوصات، خطة العلاج، توجيهات..."
                        minHeight="180px"
                    />
                </Field>

                <Field label="موعد المتابعة" error={errors.follow_up_date}>
                    <input
                        type="date"
                        className={cx(errors.follow_up_date)}
                        value={data.follow_up_date}
                        onChange={(e) =>
                            setData("follow_up_date", e.target.value)
                        }
                        min={
                            new Date(Date.now() + 86400000)
                                .toISOString()
                                .split("T")[0]
                        }
                        dir="ltr"
                    />
                </Field>
            </div>

            {/* Prescription */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                        الوصفة الطبية
                    </h3>
                    {!hasPrescription ? (
                        <button
                            type="button"
                            onClick={addPrescription}
                            className="btn-secondary text-sm"
                        >
                            <Plus size={14} />
                            إضافة وصفة
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={removePrescription}
                            className="text-xs text-red-500 hover:text-red-700"
                        >
                            حذف الوصفة
                        </button>
                    )}
                </div>

                {hasPrescription && data.prescription && (
                    <div className="space-y-4">
                        <Field label="تعليمات عامة" error={undefined}>
                            <textarea
                                className="form-input"
                                rows={2}
                                placeholder="تعليمات للمريض..."
                                value={data.prescription.instructions}
                                onChange={(e) =>
                                    setData("prescription", {
                                        ...data.prescription!,
                                        instructions: e.target.value,
                                    })
                                }
                            />
                        </Field>

                        {/* Medicine items */}
                        <div className="space-y-3">
                            {data.prescription.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">
                                            دواء {i + 1}
                                        </span>
                                        {data.prescription!.items.length >
                                            1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(i)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        placeholder="اسم الدواء..."
                                        value={item.medicine}
                                        onChange={(e) =>
                                            updateItem(
                                                i,
                                                "medicine",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">
                                                الجرعة
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input text-sm"
                                                placeholder="500mg"
                                                value={item.dosage}
                                                onChange={(e) =>
                                                    updateItem(
                                                        i,
                                                        "dosage",
                                                        e.target.value,
                                                    )
                                                }
                                                dir="ltr"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">
                                                التكرار
                                            </label>
                                            <select
                                                className="form-input text-sm"
                                                value={item.frequency}
                                                onChange={(e) =>
                                                    updateItem(
                                                        i,
                                                        "frequency",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    اختر...
                                                </option>
                                                {COMMON_FREQUENCIES.map((f) => (
                                                    <option key={f} value={f}>
                                                        {f}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">
                                                المدة
                                            </label>
                                            <select
                                                className="form-input text-sm"
                                                value={item.duration}
                                                onChange={(e) =>
                                                    updateItem(
                                                        i,
                                                        "duration",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    اختر...
                                                </option>
                                                {COMMON_DURATIONS.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="btn-secondary text-sm w-full justify-center"
                        >
                            <Plus size={14} />
                            إضافة دواء آخر
                        </button>
                    </div>
                )}

                {!hasPrescription && (
                    <p className="text-sm text-gray-400 text-center py-4">
                        لا توجد وصفة طبية لهذه الزيارة
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary"
                >
                    {processing ? "جارٍ الحفظ..." : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    إلغاء
                </button>
            </div>
        </div>
    );
}

const emptyItem = (): PrescriptionItem => ({
    medicine: "",
    dosage: "",
    frequency: "",
    duration: "",
});

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
