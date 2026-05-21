import { Head } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import { ClipboardList } from "lucide-react";

interface Prescription {
    id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface Visit {
    id: number;
    visited_at: string;
    chief_complaint: string;
    notes: string | null;
    diagnosis_code: string | null;
    diagnosis_free_text: string | null;
    doctor: { name: string } | null;
    prescriptions: Prescription[];
}

interface Props {
    visits: Visit[];
}

export default function PortalVisits({ visits }: Props) {
    return (
        <PortalLayout title="سجل زياراتي">
            <Head title="الزيارات" />

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ClipboardList size={20} className="text-blue-600" />
                سجل زياراتي
            </h1>

            {visits.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
                    لا توجد زيارات مسجلة بعد
                </div>
            ) : (
                <div className="space-y-4">
                    {visits.map((visit) => (
                        <div
                            key={visit.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {visit.chief_complaint}
                                    </p>
                                    {visit.doctor && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            د. {visit.doctor.name}
                                        </p>
                                    )}
                                </div>
                                <p
                                    className="text-xs text-gray-400 shrink-0"
                                    dir="ltr"
                                >
                                    {visit.visited_at}
                                </p>
                            </div>

                            {/* Diagnosis */}
                            {(visit.diagnosis_code ||
                                visit.diagnosis_free_text) && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2 mb-3">
                                    <p className="text-xs text-blue-400 mb-0.5">
                                        التشخيص
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        {visit.diagnosis_code && (
                                            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded me-1">
                                                {visit.diagnosis_code}
                                            </span>
                                        )}
                                        {visit.diagnosis_free_text}
                                    </p>
                                </div>
                            )}

                            {/* Notes */}
                            {visit.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                                    {visit.notes}
                                </p>
                            )}

                            {/* Prescriptions */}
                            {visit.prescriptions.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        الوصفة الطبية
                                    </p>
                                    <div className="space-y-1.5">
                                        {visit.prescriptions.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 text-xs"
                                            >
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {p.medication_name}
                                                </span>
                                                <span className="text-gray-400">
                                                    {p.dosage} · {p.frequency} ·{" "}
                                                    {p.duration}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </PortalLayout>
    );
}
