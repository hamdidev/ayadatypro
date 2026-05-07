import { InertiaFormProps } from "@inertiajs/react";
import { Plus, Trash2 } from "lucide-react";

interface Item {
    description: string;
    quantity: number;
    unit_price: number;
}

interface FormData {
    patient_id: string;
    visit_id: string;
    discount: number;
    notes: string;
    status: string;
    payment_method: string;
    amount_paid: number;
    items: Item[];
    [key: string]: unknown;
}

interface Props {
    form: InertiaFormProps<FormData>;
    submitLabel: string;
    currency: string;
    patientName?: string; // pre-filled patient (read-only in edit)
    onCancel: () => void;
}

const PAYMENT_METHODS = [
    { value: "cash", label: "نقداً" },
    { value: "card", label: "بطاقة" },
    { value: "bank_transfer", label: "تحويل بنكي" },
];

const STATUS_OPTIONS = [
    { value: "pending", label: "معلّق" },
    { value: "partial", label: "مدفوع جزئياً" },
    { value: "paid", label: "مدفوع بالكامل" },
];

export default function InvoiceForm({
    form,
    submitLabel,
    currency,
    patientName,
    onCancel,
}: Props) {
    const { data, setData, errors, processing } = form;

    const addItem = () => {
        setData("items", [
            ...data.items,
            { description: "", quantity: 1, unit_price: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return; // must have at least one item
        setData(
            "items",
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateItem = (
        index: number,
        field: keyof Item,
        value: string | number,
    ) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };
        setData("items", updated);
    };

    const subtotal = data.items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
        0,
    );
    const total = Math.max(0, subtotal - Number(data.discount));

    const fmt = (amount: number) => `${Number(amount).toFixed(2)} ${currency}`;

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Line items ────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                            بنود الفاتورة
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="btn-secondary text-sm"
                        >
                            <Plus size={14} />
                            إضافة بند
                        </button>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-gray-500">
                        <div className="col-span-6">الوصف</div>
                        <div className="col-span-2 text-center">الكمية</div>
                        <div className="col-span-2 text-center">السعر</div>
                        <div className="col-span-2 text-center">الإجمالي</div>
                    </div>

                    <div className="space-y-2">
                        {data.items.map((item, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-12 gap-2 items-center"
                            >
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        className="form-input text-sm py-1.5"
                                        placeholder="وصف الخدمة أو المنتج..."
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(
                                                i,
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        className="form-input text-sm py-1.5 text-center"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(
                                                i,
                                                "quantity",
                                                Number(e.target.value),
                                            )
                                        }
                                        dir="ltr"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        className="form-input text-sm py-1.5 text-center"
                                        min={0}
                                        step={0.01}
                                        value={item.unit_price}
                                        onChange={(e) =>
                                            updateItem(
                                                i,
                                                "unit_price",
                                                Number(e.target.value),
                                            )
                                        }
                                        dir="ltr"
                                    />
                                </div>
                                <div
                                    className="col-span-1 text-center text-sm font-medium text-gray-700"
                                    dir="ltr"
                                >
                                    {(item.quantity * item.unit_price).toFixed(
                                        2,
                                    )}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(i)}
                                        disabled={data.items.length === 1}
                                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>المجموع الفرعي</span>
                            <span dir="ltr">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>الخصم</span>
                            <input
                                type="number"
                                className="form-input text-sm py-1 w-28 text-center"
                                min={0}
                                step={0.01}
                                value={data.discount}
                                onChange={(e) =>
                                    setData("discount", Number(e.target.value))
                                }
                                dir="ltr"
                            />
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                            <span>الإجمالي</span>
                            <span dir="ltr">{fmt(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="card p-5">
                    <label className="form-label">ملاحظات</label>
                    <textarea
                        className="form-input"
                        rows={2}
                        placeholder="أي ملاحظات خاصة بهذه الفاتورة..."
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                    />
                </div>
            </div>

            {/* ── Sidebar: payment + actions ────────────── */}
            <div className="space-y-4">
                {/* Patient (read-only if pre-filled) */}
                {patientName && (
                    <div className="card p-4">
                        <p className="text-xs text-gray-500 mb-1">المريض</p>
                        <p className="font-medium text-gray-900">
                            {patientName}
                        </p>
                    </div>
                )}

                {/* Payment info */}
                <div className="card p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 text-sm">
                        معلومات الدفع
                    </h3>

                    <div>
                        <label className="form-label">الحالة</label>
                        <select
                            className={`form-input ${errors.status ? "border-red-400" : ""}`}
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        {errors.status && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="form-label">طريقة الدفع</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {PAYMENT_METHODS.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() =>
                                        setData("payment_method", m.value)
                                    }
                                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                                        data.payment_method === m.value
                                            ? "bg-primary-50 border-primary-500 text-primary-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {data.status === "partial" && (
                        <div>
                            <label className="form-label">المبلغ المدفوع</label>
                            <input
                                type="number"
                                className="form-input"
                                min={0}
                                max={total}
                                step={0.01}
                                value={data.amount_paid}
                                onChange={(e) =>
                                    setData(
                                        "amount_paid",
                                        Number(e.target.value),
                                    )
                                }
                                dir="ltr"
                            />
                        </div>
                    )}

                    {data.status === "paid" && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
                            ✓ ستُسجَّل كمدفوعة بالكامل ({fmt(total)})
                        </div>
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
