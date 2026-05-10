import { Head } from "@inertiajs/react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface AppointmentPoint {
    month: string;
    label: string;
    total: number;
    completed: number;
    cancelled: number;
}

interface RevenuePoint {
    month: string;
    label: string;
    revenue: number;
}

interface Stats {
    appointments_today: number;
    appointments_month: number;
    revenue_month: number;
    pending_invoices: number;
}

interface Props {
    appointmentsChart: AppointmentPoint[];
    revenueChart: RevenuePoint[];
    stats: Stats;
}

const STAT_CARDS = [
    { labelKey: "appointments_today", title: "مواعيد اليوم", color: "blue" },
    { labelKey: "appointments_month", title: "مواعيد الشهر", color: "indigo" },
    {
        labelKey: "revenue_month",
        title: "إيرادات الشهر (SAR)",
        color: "green",
        currency: true,
    },
    { labelKey: "pending_invoices", title: "فواتير معلّقة", color: "amber" },
] as const;

const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
};

function StatCard({
    title,
    value,
    color,
    currency,
}: {
    title: string;
    value: number;
    color: keyof typeof colorMap;
    currency?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {title}
            </p>
            <p className={`text-3xl font-bold ${colorMap[color]}`}>
                {currency
                    ? value.toLocaleString("ar-SA", {
                          minimumFractionDigits: 0,
                      })
                    : value.toLocaleString("ar-SA")}
            </p>
        </div>
    );
}

// RTL-aware custom tooltip
function ArabicTooltip({ active, payload, label, currency }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 p-3 shadow-lg text-sm"
            dir="rtl"
        >
            <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                {label}
            </p>
            {payload.map((entry: any) => (
                <p key={entry.dataKey} style={{ color: entry.color }}>
                    {entry.name}:{" "}
                    {currency
                        ? entry.value.toLocaleString("ar-SA") + " SAR"
                        : entry.value.toLocaleString("ar-SA")}
                </p>
            ))}
        </div>
    );
}

export default function Dashboard({
    appointmentsChart,
    revenueChart,
    stats,
}: Props) {
    return (
        <>
            <Head title="لوحة التحكم" />
            <div className="p-6 space-y-8" dir="rtl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    لوحة التحكم
                </h1>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {STAT_CARDS.map((card) => (
                        <StatCard
                            key={card.labelKey}
                            title={card.title}
                            value={stats[card.labelKey]}
                            color={card.color}
                            currency={"currency" in card}
                        />
                    ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Appointments bar chart */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                            المواعيد الشهرية
                        </h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                data={appointmentsChart}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    left: -10,
                                    bottom: 0,
                                }}
                                reverseStackOrder
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    reversed // RTL: newest on right
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    orientation="right" // RTL: axis on right
                                />
                                <Tooltip content={<ArabicTooltip />} />
                                <Legend
                                    formatter={(value) =>
                                        ({
                                            completed: "مكتمل",
                                            cancelled: "ملغى",
                                            total: "الكل",
                                        })[value] ?? value
                                    }
                                />
                                <Bar
                                    dataKey="completed"
                                    name="completed"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="cancelled"
                                    name="cancelled"
                                    fill="#fca5a5"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue area chart */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                            الإيرادات الشهرية
                        </h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart
                                data={revenueChart}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="revenueGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#3b82f6"
                                            stopOpacity={0.15}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#3b82f6"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    reversed
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    orientation="right"
                                    tickFormatter={(v) =>
                                        v >= 1000
                                            ? `${(v / 1000).toFixed(0)}k`
                                            : v
                                    }
                                />
                                <Tooltip content={<ArabicTooltip currency />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#revenueGrad)"
                                    dot={{ r: 3, fill: "#3b82f6" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
