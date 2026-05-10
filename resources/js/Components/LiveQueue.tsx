// resources/js/Components/LiveQueue.tsx
// Real-time appointment queue for today.
// Updates via Reverb when any appointment status changes.

import { useState, useCallback } from "react";
import { Link } from "@inertiajs/react";

import { CalendarDays, Wifi, WifiOff } from "lucide-react";
import { useClinicChannel } from "../hooks/useClinicChannel";

interface QueueItem {
    id: number;
    patient: string;
    doctor: string;
    starts_at: string;
    status: string;
    type: string;
}

interface Props {
    initialQueue: QueueItem[];
    clinicId: number;
}

const STATUS_LABELS: Record<string, string> = {
    scheduled: "مجدول",
    confirmed: "مؤكد",
    in_progress: "جارٍ",
    completed: "مكتمل",
    cancelled: "ملغى",
    no_show: "لم يحضر",
};

const STATUS_STYLES: Record<string, string> = {
    scheduled: "status-scheduled",
    confirmed: "status-confirmed",
    in_progress: "status-in_progress",
    completed: "status-completed",
    cancelled: "status-cancelled",
    no_show: "status-no_show",
};

export default function LiveQueue({ initialQueue, clinicId }: Props) {
    const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
    const [connected, setConnected] = useState(!!window.Echo);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const handleStatusChanged = useCallback(
        (data: {
            appointment_id: number;
            new_status: string;
            patient_name: string;
            doctor_name: string;
            starts_at: string;
            type: string;
        }) => {
            setQueue((prev) => {
                // If appointment exists in queue — update its status
                const exists = prev.find(
                    (item) => item.id === data.appointment_id,
                );

                if (exists) {
                    // Remove from queue if terminal status
                    if (
                        ["completed", "cancelled", "no_show"].includes(
                            data.new_status,
                        )
                    ) {
                        return prev.filter(
                            (item) => item.id !== data.appointment_id,
                        );
                    }

                    // Otherwise update status
                    return prev.map((item) =>
                        item.id === data.appointment_id
                            ? { ...item, status: data.new_status }
                            : item,
                    );
                }

                // New appointment appeared (walk-in or newly confirmed)
                if (
                    !["completed", "cancelled", "no_show"].includes(
                        data.new_status,
                    )
                ) {
                    const newItem: QueueItem = {
                        id: data.appointment_id,
                        patient: data.patient_name,
                        doctor: data.doctor_name,
                        starts_at: data.starts_at,
                        status: data.new_status,
                        type: data.type,
                    };

                    // Insert in time order
                    return [...prev, newItem].sort((a, b) =>
                        a.starts_at.localeCompare(b.starts_at),
                    );
                }

                return prev;
            });

            setLastUpdate(new Date().toLocaleTimeString("ar"));
        },
        [],
    );

    useClinicChannel(clinicId, {
        onStatusChanged: handleStatusChanged,
    });

    return (
        <div>
            {/* Header with live indicator */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-display font-semibold text-gray-900">
                    مواعيد اليوم
                </h3>
                <div className="flex items-center gap-3">
                    {lastUpdate && (
                        <span className="text-xs text-gray-400">
                            آخر تحديث: {lastUpdate}
                        </span>
                    )}
                    {/* Live / offline indicator */}
                    <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                            connected ? "text-emerald-600" : "text-gray-400"
                        }`}
                    >
                        {connected ? (
                            <>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <Wifi size={12} />
                                مباشر
                            </>
                        ) : (
                            <>
                                <WifiOff size={12} />
                                غير متصل
                            </>
                        )}
                    </div>
                    <Link
                        href="/appointments"
                        className="text-xs text-primary-600 hover:text-primary-700"
                    >
                        عرض الكل
                    </Link>
                </div>
            </div>

            {/* Queue */}
            {queue.length === 0 ? (
                <div className="px-5 py-12 text-center">
                    <CalendarDays
                        size={36}
                        className="mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-sm text-gray-500">
                        لا توجد مواعيد اليوم
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {queue.map((item) => (
                        <Link
                            key={item.id}
                            href={`/appointments/${item.id}`}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                            {/* Time */}
                            <span className="font-mono text-sm font-semibold text-gray-900 w-12 text-center shrink-0">
                                {item.starts_at}
                            </span>

                            {/* Patient + Doctor */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.patient}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    د. {item.doctor}
                                </p>
                            </div>

                            {/* Walk-in badge */}
                            {item.type === "walk_in" && (
                                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full shrink-0">
                                    حضور مباشر
                                </span>
                            )}

                            {/* Status */}
                            <span
                                className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[item.status] ?? ""}`}
                            >
                                {STATUS_LABELS[item.status] ?? item.status}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
