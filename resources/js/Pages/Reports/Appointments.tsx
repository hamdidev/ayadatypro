import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import ChartCard from "@/Components/Reports/ChartCard";
import StatCard from "@/Components/Reports/StatCard";
import { ChevronLeft } from "lucide-react";

interface Props {
    data: {
        no_show_by_doctor: any[];
        no_show_by_day: any[];
        heatmap: any[];
        cancellations: any[];
        duration: any;
    };
}

const ARABIC_DAYS = [
    "",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
    "الأحد",
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am–8pm

export default function AppointmentsReport({ data }: Props) {
    const {
        no_show_by_doctor,
        no_show_by_day,
        heatmap,
        cancellations,
        duration,
    } = data;

    // Build heatmap matrix
    const heatmapMap: Record<string, number> = {};
    heatmap.forEach((row: any) => {
        heatmapMap[`${row.dow}-${row.hour}`] = Number(row.bookings);
    });
    const maxBookings = Math.max(
        ...heatmap.map((r: any) => Number(r.bookings)),
        1,
    );

    const overallNoShow = no_show_by_day.reduce(
        (acc: any, r: any) => ({
            total: (acc.total || 0) + Number(r.total),
            no_shows: (acc.no_shows || 0) + Number(r.no_shows),
        }),
        {},
    );
    const noShowRate = overallNoShow.total
        ? ((overallNoShow.no_shows / overallNoShow.total) * 100).toFixed(1)
        : "0";

    return (
        <AppLayout title="تحليل المواعيد">
            <Head title="تحليل المواعيد" />
            <div className="p-6 space-y-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/reports" className="hover:text-gray-700">
                        التقارير
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        تحليل المواعيد
                    </span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatCard
                        title="معدل الغياب"
                        value={`${noShowRate}%`}
                        sub="آخر 3 أشهر"
                        color={Number(noShowRate) > 15 ? "red" : "green"}
                    />
                    <StatCard
                        title="متوسط مدة الموعد"
                        value={
                            duration?.avg_scheduled
                                ? `${duration.avg_scheduled} د`
                                : "—"
                        }
                        color="blue"
                    />
                    <StatCard
                        title="المواعيد المكتملة"
                        value={duration?.total ?? 0}
                        sub="آخر 3 أشهر"
                        color="green"
                    />
                </div>

                {/* Heatmap */}
                <ChartCard title="خريطة الحرارة — ساعات الذروة (آخر 3 أشهر)">
                    <div className="overflow-x-auto">
                        <table className="text-xs w-full">
                            <thead>
                                <tr>
                                    <th className="text-gray-400 font-normal pb-2 w-16 text-right">
                                        اليوم \ الساعة
                                    </th>
                                    {HOURS.map((h) => (
                                        <th
                                            key={h}
                                            className="text-gray-400 font-normal pb-2 text-center px-1"
                                        >
                                            {h}:00
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
                                    <tr key={dow}>
                                        <td className="text-gray-500 py-1 pe-2 text-right">
                                            {ARABIC_DAYS[dow]}
                                        </td>
                                        {HOURS.map((hour) => {
                                            const val =
                                                heatmapMap[`${dow}-${hour}`] ||
                                                0;
                                            const intensity = val / maxBookings;
                                            return (
                                                <td
                                                    key={hour}
                                                    className="px-1 py-1 text-center"
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-md mx-auto flex items-center justify-center text-xs font-medium transition-colors"
                                                        style={{
                                                            background:
                                                                val === 0
                                                                    ? "#f8fafc"
                                                                    : `rgba(59,130,246,${0.1 + intensity * 0.9})`,
                                                            color:
                                                                intensity > 0.5
                                                                    ? "#fff"
                                                                    : "#64748b",
                                                        }}
                                                        title={`${ARABIC_DAYS[dow]} ${hour}:00 — ${val} موعد`}
                                                    >
                                                        {val || ""}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>

                <div className="grid xl:grid-cols-2 gap-6">
                    {/* No-show by doctor */}
                    <ChartCard title="معدل الغياب بحسب الطبيب">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="text-right text-gray-500 font-medium pb-2">
                                        الطبيب
                                    </th>
                                    <th className="text-center text-gray-500 font-medium pb-2">
                                        المواعيد
                                    </th>
                                    <th className="text-center text-gray-500 font-medium pb-2">
                                        غياب
                                    </th>
                                    <th className="text-center text-gray-500 font-medium pb-2">
                                        النسبة
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {no_show_by_doctor.map((row: any) => (
                                    <tr key={row.doctor}>
                                        <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                            د. {row.doctor}
                                        </td>
                                        <td className="py-2.5 text-center text-gray-500">
                                            {row.total}
                                        </td>
                                        <td className="py-2.5 text-center text-gray-500">
                                            {row.no_shows}
                                        </td>
                                        <td className="py-2.5 text-center">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    Number(row.rate) > 15
                                                        ? "bg-red-50 text-red-600"
                                                        : "bg-green-50 text-green-600"
                                                }`}
                                            >
                                                {row.rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ChartCard>

                    {/* Cancellations trend */}
                    <ChartCard title="الإلغاءات الشهرية">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={cancellations}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    reversed
                                />
                                <YAxis
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="cancelled"
                                    name="cancelled"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </AppLayout>
    );
}
