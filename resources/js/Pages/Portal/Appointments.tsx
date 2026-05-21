import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import { Calendar, X } from "lucide-react";

interface Appointment {
    id: number;
    scheduled_at: string;
    status: string;
    type: string;
    duration_minutes: number;
    notes: string | null;
    doctor: { name: string; specialty: string | null } | null;
}

interface Props {
    upcoming: Appointment[];
    past: Appointment[];
}

const TYPE_LABELS: Record<string, string> = {
    checkup: "كشف",
    follow_up: "متابعة",
    procedure: "إجراء",
    emergency: "طارئ",
};

function AppointmentCard({
    appt,
    allowCancel,
}: {
    appt: Appointment;
    allowCancel?: boolean;
}) {
    function cancel() {
        if (confirm("هل تريد إلغاء هذا الموعد؟")) {
            router.post(`/portal/appointments/${appt.id}/cancel`);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p
                        className="font-medium text-gray-900 dark:text-white"
                        dir="ltr"
                    >
                        {appt.scheduled_at}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {TYPE_LABELS[appt.type] ?? appt.type} ·{" "}
                        {appt.duration_minutes} د
                    </p>
                </div>
                {allowCancel && appt.status !== "cancelled" && (
                    <button
                        onClick={cancel}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                        title="إلغاء الموعد"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {appt.doctor && (
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {appt.doctor.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                            د. {appt.doctor.name}
                        </p>
                        {appt.doctor.specialty && (
                            <p className="text-gray-400 text-xs">
                                {appt.doctor.specialty}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {appt.notes && (
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
                    {appt.notes}
                </p>
            )}
        </div>
    );
}

export default function PortalAppointments({ upcoming, past }: Props) {
    return (
        <PortalLayout title="مواعيدي">
            <Head title="المواعيد" />

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                مواعيدي
            </h1>

            {/* Upcoming */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    القادمة
                </h2>
                {upcoming.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center text-sm text-gray-400">
                        لا توجد مواعيد قادمة
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcoming.map((a) => (
                            <AppointmentCard key={a.id} appt={a} allowCancel />
                        ))}
                    </div>
                )}
            </section>

            {/* Past */}
            {past.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        السابقة
                    </h2>
                    <div className="space-y-3">
                        {past.map((a) => (
                            <AppointmentCard key={a.id} appt={a} />
                        ))}
                    </div>
                </section>
            )}
        </PortalLayout>
    );
}
