// resources/js/Pages/Settings/Schedule.tsx

import { Head, useForm } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ScheduleSlot {
    id?: number;
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    is_active: boolean;
}

interface Doctor {
    id: number;
    name: string;
}

interface Props {
    doctors: Doctor[];
    schedules: Record<number, ScheduleSlot[]>;
    days: Record<number, string>;
}

const DEFAULT_SLOT = {
    day_of_week: 0,
    day_name: "",
    start_time: "09:00",
    end_time: "17:00",
    slot_minutes: 20,
    is_active: true,
};

export default function SettingsSchedule({ doctors, schedules, days }: Props) {
    const [selectedDoctor, setSelectedDoctor] = useState<number>(
        doctors[0]?.id ?? 0,
    );

    const currentSlots = schedules[selectedDoctor] ?? [];

    const { data, setData, put, processing, errors } = useForm({
        doctor_id: selectedDoctor,
        slots: currentSlots as ScheduleSlot[],
    });

    const handleDoctorChange = (doctorId: number) => {
        setSelectedDoctor(doctorId);
        setData({
            doctor_id: doctorId,
            slots: schedules[doctorId] ?? [],
        });
    };

    const addSlot = () => {
        setData("slots", [...data.slots, { ...DEFAULT_SLOT }]);
    };

    const removeSlot = (index: number) => {
        setData(
            "slots",
            data.slots.filter((_, i) => i !== index),
        );
    };

    const updateSlot = (
        index: number,
        field: keyof ScheduleSlot,
        value: unknown,
    ) => {
        const updated = [...data.slots];
        updated[index] = { ...updated[index], [field]: value };
        setData("slots", updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put("/settings/schedule");
    };

    return (
        <AppLayout title="جدول العمل">
            <Head title="جدول العمل" />

            <div className="max-w-3xl space-y-6">
                {/* Doctor selector */}
                {doctors.length > 1 && (
                    <div className="card p-4">
                        <label className="form-label">اختر الطبيب</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {doctors.map((d) => (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => handleDoctorChange(d.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        selectedDoctor === d.id
                                            ? "bg-primary-50 border-primary-500 text-primary-700"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    د. {d.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule slots */}
                <form onSubmit={submit}>
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                                أوقات العمل
                            </h3>
                            <button
                                type="button"
                                onClick={addSlot}
                                className="btn-secondary text-sm"
                            >
                                <Plus size={14} />
                                إضافة يوم
                            </button>
                        </div>

                        {data.slots.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                لا توجد أوقات عمل محددة. اضغط "إضافة يوم" للبدء.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.slots.map((slot, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl border transition-colors ${
                                            slot.is_active
                                                ? "border-gray-100 bg-gray-50"
                                                : "border-gray-100 bg-white opacity-60"
                                        }`}
                                    >
                                        {/* Active toggle */}
                                        <div className="col-span-1">
                                            <input
                                                type="checkbox"
                                                checked={slot.is_active}
                                                onChange={(e) =>
                                                    updateSlot(
                                                        i,
                                                        "is_active",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </div>

                                        {/* Day */}
                                        <div className="col-span-3">
                                            <select
                                                className="form-input text-sm py-1.5"
                                                value={slot.day_of_week}
                                                onChange={(e) =>
                                                    updateSlot(
                                                        i,
                                                        "day_of_week",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            >
                                                {Object.entries(days).map(
                                                    ([num, name]) => (
                                                        <option
                                                            key={num}
                                                            value={num}
                                                        >
                                                            {name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        {/* Start time */}
                                        <div className="col-span-2">
                                            <input
                                                type="time"
                                                className="form-input text-sm py-1.5"
                                                value={slot.start_time}
                                                onChange={(e) =>
                                                    updateSlot(
                                                        i,
                                                        "start_time",
                                                        e.target.value,
                                                    )
                                                }
                                                dir="ltr"
                                            />
                                        </div>

                                        <span className="col-span-1 text-center text-gray-400 text-sm">
                                            —
                                        </span>

                                        {/* End time */}
                                        <div className="col-span-2">
                                            <input
                                                type="time"
                                                className="form-input text-sm py-1.5"
                                                value={slot.end_time}
                                                onChange={(e) =>
                                                    updateSlot(
                                                        i,
                                                        "end_time",
                                                        e.target.value,
                                                    )
                                                }
                                                dir="ltr"
                                            />
                                        </div>

                                        {/* Slot duration */}
                                        <div className="col-span-2">
                                            <select
                                                className="form-input text-sm py-1.5"
                                                value={slot.slot_minutes}
                                                onChange={(e) =>
                                                    updateSlot(
                                                        i,
                                                        "slot_minutes",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            >
                                                {[10, 15, 20, 30, 45, 60].map(
                                                    (m) => (
                                                        <option
                                                            key={m}
                                                            value={m}
                                                        >
                                                            {m} د
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        {/* Remove */}
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(i)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Legend */}
                        <p className="text-xs text-gray-400 pt-2">
                            ✓ = يوم نشط · مدة الفترة = مدة كل موعد في هذا اليوم
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing ? "جارٍ الحفظ..." : "حفظ جدول العمل"}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
