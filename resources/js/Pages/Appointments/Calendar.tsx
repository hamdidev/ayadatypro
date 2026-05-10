import { Head, Link, router } from "@inertiajs/react";

import { usePage } from "@inertiajs/react";
import { PageProps } from "../../types";
import { Plus, List } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../Layouts/AppLayout";
import AppointmentCalendar from "../../Components/AppointmentCalendar";

interface CalendarAppointment {
    id: number;
    patient: string;
    doctor: string;
    doctor_id: number;
    starts_at: string;
    ends_at: string;
    status: string;
    type: string;
}

interface Doctor {
    id: number;
    name: string;
}

interface Props {
    appointments: CalendarAppointment[];
    doctors: Doctor[];
    filters: { doctor_id?: string };
}

export default function AppointmentsCalendar({
    appointments,
    doctors,
    filters,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const [doctorFilter, setDoctorFilter] = useState(filters.doctor_id ?? "");

    const handleDoctorFilter = (value: string) => {
        setDoctorFilter(value);
        router.get(
            "/appointments/calendar",
            { doctor_id: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const isOwnerOrReceptionist =
        auth.user?.can.manage_clinic || auth.user?.role === "receptionist";

    return (
        <AppLayout title="تقويم المواعيد">
            <Head title="تقويم المواعيد" />

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    {/* Doctor filter */}
                    {doctors.length > 1 && (
                        <select
                            className="form-input text-sm py-2"
                            value={doctorFilter}
                            onChange={(e) => handleDoctorFilter(e.target.value)}
                        >
                            <option value="">جميع الأطباء</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    د. {d.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Switch to list view */}
                    <Link
                        href="/appointments"
                        className="btn-secondary text-sm"
                    >
                        <List size={15} />
                        قائمة
                    </Link>

                    <Link
                        href="/appointments/create"
                        className="btn-primary text-sm"
                    >
                        <Plus size={15} />
                        موعد جديد
                    </Link>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[
                    { label: "مجدول", color: "bg-blue-200 border-blue-400" },
                    { label: "مؤكد", color: "bg-violet-200 border-violet-400" },
                    { label: "جارٍ", color: "bg-amber-200 border-amber-400" },
                    {
                        label: "مكتمل",
                        color: "bg-emerald-200 border-emerald-400",
                    },
                    {
                        label: "حضور مباشر",
                        color: "bg-gray-100 border-gray-400 border-dashed",
                    },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <div
                            className={`w-3 h-3 rounded border-2 ${item.color}`}
                        />
                        <span className="text-xs text-gray-500">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Calendar */}
            <div className="card p-3">
                <AppointmentCalendar
                    appointments={appointments}
                    doctorId={doctorFilter ? parseInt(doctorFilter) : undefined}
                    editable={isOwnerOrReceptionist}
                />
            </div>
        </AppLayout>
    );
}
