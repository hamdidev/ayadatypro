import { Head } from "@inertiajs/react";
import { Users, Calendar, DollarSign } from "lucide-react";
import AppLayout from "../../Layouts/AppLayout";

interface Stats {
    appointments_today: number;
    patients_total: number;
    revenue_month: number;
    appointments_this_month: number;
}

interface TodayAppointment {
    id: number;
    patient: string;
    doctor: string;
    starts_at: string;
    status: string;
    type: string;
}

interface Props {
    stats: Stats;
    todayAppointments: TodayAppointment[];
    plan: string;
    trialEndsAt: string | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    scheduled:   { label: "مجدول",    className: "bg-blue-100 text-blue-700" },
    confirmed:   { label: "مؤكد",     className: "bg-green-100 text-green-700" },
    in_progress: { label: "جارٍ",     className: "bg-yellow-100 text-yellow-700" },
    completed:   { label: "مكتمل",    className: "bg-gray-100 text-gray-600" },
    cancelled:   { label: "ملغى",     className: "bg-red-100 text-red-600" },
    no_show:     { label: "لم يحضر",  className: "bg-orange-100 text-orange-600" },
};

export default function Dashboard({ stats, todayAppointments, plan, trialEndsAt }: Props) {
    return (
        <AppLayout title="لوحة التحكم">
            <Head title="لوحة التحكم" />

            <div className="space-y-6">
                {/* Trial notice */}
                {trialEndsAt && plan === "free" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                        الفترة التجريبية تنتهي{" "}
                        <strong>{trialEndsAt}</strong>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Calendar size={20} className="text-primary-600" />}
                        label="مواعيد اليوم"
                        value={stats.appointments_today}
                    />
                    <StatCard
                        icon={<Users size={20} className="text-green-600" />}
                        label="إجمالي المرضى"
                        value={stats.patients_total}
                    />
                    <StatCard
                        icon={<Calendar size={20} className="text-blue-600" />}
                        label="مواعيد الشهر"
                        value={stats.appointments_this_month}
                    />
                    <StatCard
                        icon={<DollarSign size={20} className="text-yellow-600" />}
                        label="إيرادات الشهر"
                        value={stats.revenue_month}
                        isCurrency
                    />
                </div>

                {/* Today's appointments */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">
                            مواعيد اليوم
                        </h2>
                    </div>

                    {todayAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar
                                size={32}
                                className="text-gray-300 mx-auto mb-3"
                            />
                            <p className="text-gray-500 text-sm">
                                لا توجد مواعيد اليوم
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-right px-6 py-3 font-medium">
                                            المريض
                                        </th>
                                        <th className="text-right px-6 py-3 font-medium">
                                            الطبيب
                                        </th>
                                        <th className="text-right px-6 py-3 font-medium">
                                            الوقت
                                        </th>
                                        <th className="text-right px-6 py-3 font-medium">
                                            الحالة
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {todayAppointments.map((apt) => {
                                        const s =
                                            STATUS_LABELS[apt.status] ??
                                            STATUS_LABELS.scheduled;
                                        return (
                                            <tr
                                                key={apt.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-3 text-gray-900 font-medium">
                                                    {apt.patient}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    {apt.doctor}
                                                </td>
                                                <td
                                                    className="px-6 py-3 text-gray-600 tabular-nums"
                                                    dir="ltr"
                                                >
                                                    {apt.starts_at}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}
                                                    >
                                                        {s.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({
    icon,
    label,
    value,
    isCurrency = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    isCurrency?: boolean;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">
                    {label}
                </span>
                {icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums" dir="ltr">
                {isCurrency
                    ? value.toLocaleString("ar-SA", {
                          style: "currency",
                          currency: "SAR",
                          maximumFractionDigits: 0,
                      })
                    : value.toLocaleString("ar-SA")}
            </p>
        </div>
    );
}
