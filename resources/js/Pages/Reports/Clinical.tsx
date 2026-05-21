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
    PieChart,
    Pie,
    Cell,
} from "recharts";
import ChartCard from "@/Components/Reports/ChartCard";
import StatCard from "@/Components/Reports/StatCard";
import { ChevronLeft } from "lucide-react";

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
];

interface Props {
    data: {
        diagnoses: any[];
        visit_frequency: any[];
        workload: any[];
        follow_up: any;
    };
}

export default function Clinical({ data }: Props) {
    const { diagnoses, visit_frequency, workload, follow_up } = data;

    return (
        <AppLayout title="التقارير السريرية">
            <Head title="التقارير السريرية" />
            <div className="p-6 space-y-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/reports" className="hover:text-gray-700">
                        التقارير
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        التقارير السريرية
                    </span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatCard
                        title="معدل الالتزام بالمتابعة"
                        value={`${follow_up?.compliance_rate ?? 0}%`}
                        sub={`${follow_up?.actually_booked ?? 0} من ${follow_up?.total_followups_scheduled ?? 0}`}
                        color={
                            Number(follow_up?.compliance_rate) >= 60
                                ? "green"
                                : "amber"
                        }
                    />
                    <StatCard
                        title="مواعيد متابعة مجدولة"
                        value={follow_up?.total_followups_scheduled ?? 0}
                        color="blue"
                    />
                    <StatCard
                        title="أكثر تشخيص شيوعاً"
                        value={diagnoses[0]?.label ?? "—"}
                        sub={
                            diagnoses[0]
                                ? `${diagnoses[0].frequency} حالة`
                                : undefined
                        }
                        color="blue"
                    />
                </div>

                <div className="grid xl:grid-cols-2 gap-6">
                    {/* Top diagnoses */}
                    <ChartCard title="أكثر التشخيصات شيوعاً (آخر 6 أشهر)">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={diagnoses.slice(0, 10)}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 20,
                                    left: 90,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="frequency"
                                    name="frequency"
                                    fill="#3b82f6"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Visit frequency distribution */}
                    <ChartCard title="توزيع تكرار الزيارات">
                        <div className="flex items-center justify-center gap-6">
                            <PieChart width={200} height={200}>
                                <Pie
                                    data={visit_frequency}
                                    dataKey="patients"
                                    nameKey="bucket"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                >
                                    {visit_frequency.map(
                                        (_: any, i: number) => (
                                            <Cell
                                                key={i}
                                                fill={COLORS[i % COLORS.length]}
                                            />
                                        ),
                                    )}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div className="space-y-2">
                                {visit_frequency.map((row: any, i: number) => (
                                    <div
                                        key={row.bucket}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{
                                                background:
                                                    COLORS[i % COLORS.length],
                                            }}
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {row.bucket}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white mr-auto">
                                            {row.patients}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* Doctor workload table */}
                <ChartCard title="عبء العمل بحسب الطبيب (آخر 3 أشهر)">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="text-right text-gray-500 font-medium pb-2 px-2">
                                    الطبيب
                                </th>
                                <th className="text-center text-gray-500 font-medium pb-2 px-2">
                                    الزيارات
                                </th>
                                <th className="text-center text-gray-500 font-medium pb-2 px-2">
                                    مرضى فريدون
                                </th>
                                <th className="text-center text-gray-500 font-medium pb-2 px-2">
                                    متوسط وقت الزيارة
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {workload.map((row: any) => (
                                <tr key={row.doctor}>
                                    <td className="py-2.5 px-2 font-medium text-gray-800 dark:text-gray-200">
                                        د. {row.doctor}
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-gray-400">
                                        {row.visits}
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-gray-400">
                                        {row.unique_patients}
                                    </td>
                                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-gray-400">
                                        {row.avg_visit_minutes
                                            ? `${row.avg_visit_minutes} د`
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ChartCard>
            </div>
        </AppLayout>
    );
}
