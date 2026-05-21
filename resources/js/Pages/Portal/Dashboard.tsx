import { Head, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import { Calendar, ChevronLeft, ClipboardList } from "lucide-react";

interface Appointment {
    id: number;
    scheduled_at: string;
    status: string;
    type: string;
    doctor: { name: string; specialty: string | null } | null;
}

interface Visit {
    id: number;
    visited_at: string;
    chief_complaint: string;
    diagnosis_free_text: string | null;
    doctor: { name: string } | null;
}

interface Patient {
    name: string;
    phone: string | null;
    blood_type: string | null;
    dob: string | null;
}

interface Props {
    patient: Patient;
    upcomingAppointments: Appointment[];
    recentVisits: Visit[];
}

const STATUS_LABELS: Record<string, string> = {
    scheduled: "مجدول",
    confirmed: "مؤكد",
    in_progress: "جارٍ",
    completed: "مكتمل",
    cancelled: "ملغى",
};

export default function PortalDashboard({
    patient,
    upcomingAppointments,
    recentVisits,
}: Props) {
    return (
        <PortalLayout title="بوابة المريض" patientName={patient.name}>
            <Head title="الرئيسية" />

            {/* Welcome */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    أهلاً، {patient.name}
                </h1>
                {patient.blood_type && (
                    <p className="text-sm text-gray-500 mt-0.5">
                        فصيلة الدم:{" "}
                        <span className="font-medium text-red-600">
                            {patient.blood_type}
                        </span>
                    </p>
                )}
            </div>

            {/* Upcoming appointments */}
            <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        المواعيد القادمة
                    </h2>
                    <a
                        href="/portal/appointments"
                        className="text-xs text-blue-600 hover:text-blue-700"
                    >
                        عرض الكل
                    </a>
                </div>

                {upcomingAppointments.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center text-sm text-gray-400">
                        لا توجد مواعيد قادمة
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingAppointments.map((appt) => (
                            <div
                                key={appt.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p
                                            className="font-medium text-gray-900 dark:text-white text-sm"
                                            dir="ltr"
                                        >
                                            {appt.scheduled_at}
                                        </p>
                                        {appt.doctor && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                د. {appt.doctor.name}
                                                {appt.doctor.specialty
                                                    ? ` — ${appt.doctor.specialty}`
                                                    : ""}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                                        {STATUS_LABELS[appt.status] ??
                                            appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent visits */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <ClipboardList size={16} className="text-blue-600" />
                        آخر الزيارات
                    </h2>
                    <a
                        href="/portal/visits"
                        className="text-xs text-blue-600 hover:text-blue-700"
                    >
                        عرض الكل
                    </a>
                </div>

                {recentVisits.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center text-sm text-gray-400">
                        لا توجد زيارات مسجلة
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentVisits.map((visit) => (
                            <div
                                key={visit.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {visit.chief_complaint}
                                        </p>
                                        {visit.diagnosis_free_text && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {visit.diagnosis_free_text}
                                            </p>
                                        )}
                                        {visit.doctor && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                د. {visit.doctor.name}
                                            </p>
                                        )}
                                    </div>
                                    <p
                                        className="text-xs text-gray-400 shrink-0 mr-3"
                                        dir="ltr"
                                    >
                                        {visit.visited_at}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </PortalLayout>
    );
}
