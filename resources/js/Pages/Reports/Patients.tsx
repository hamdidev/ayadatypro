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
    Legend,
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
        new_vs_returning: any[];
        retention: any;
        age_groups: any[];
        gender: any[];
        cities: any[];
    };
}

export default function PatientsReport({ data }: Props) {
    const { new_vs_returning, retention, age_groups, gender, cities } = data;

    return (
        <AppLayout title="تحليل المرضى">
            <Head title="تحليل المرضى" />
            <div className="p-6 space-y-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/reports" className="hover:text-gray-700">
                        التقارير
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        تحليل المرضى
                    </span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatCard
                        title="معدل الاحتفاظ بالمرضى"
                        value={`${retention?.retention_rate ?? 0}%`}
                        sub="عادوا خلال 90 يوماً"
                        color={
                            Number(retention?.retention_rate) >= 50
                                ? "green"
                                : "amber"
                        }
                    />
                    <StatCard
                        title="إجمالي المرضى"
                        value={retention?.total_patients ?? 0}
                        color="blue"
                    />
                    <StatCard
                        title="مرضى عائدون"
                        value={retention?.retained ?? 0}
                        color="green"
                    />
                </div>

                {/* New vs returning */}
                <ChartCard title="مرضى جدد مقابل عائدين (12 شهراً)">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={new_vs_returning}
                            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
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
                                reversed
                            />
                            <YAxis
                                orientation="right"
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip />
                            <Legend
                                formatter={(v) =>
                                    v === "new_patients" ? "جديد" : "عائد"
                                }
                            />
                            <Bar
                                dataKey="new_patients"
                                name="new_patients"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                stackId="a"
                            />
                            <Bar
                                dataKey="returning_patients"
                                name="returning_patients"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                stackId="a"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="grid xl:grid-cols-2 gap-6">
                    {/* Age distribution */}
                    <ChartCard title="التوزيع العمري">
                        <PieChart width={180} height={180} className="mx-auto">
                            <Pie
                                data={age_groups}
                                dataKey="count"
                                nameKey="age_group"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={35}
                            >
                                {age_groups.map((_: any, i: number) => (
                                    <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                        <div className="space-y-1.5 mt-3">
                            {age_groups.map((row: any, i: number) => (
                                <div
                                    key={row.age_group}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                background:
                                                    COLORS[i % COLORS.length],
                                            }}
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {row.age_group}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {row.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>

                    {/* Gender */}
                    <ChartCard title="توزيع الجنس">
                        <PieChart width={180} height={180} className="mx-auto">
                            <Pie
                                data={gender}
                                dataKey="count"
                                nameKey="gender"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={35}
                            >
                                {gender.map((_: any, i: number) => (
                                    <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                        <div className="space-y-1.5 mt-3">
                            {gender.map((row: any, i: number) => (
                                <div
                                    key={row.gender}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                background:
                                                    COLORS[i % COLORS.length],
                                            }}
                                        />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {row.gender}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {row.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>

                    {/* Top cities */}
                    <ChartCard title="المدن الأكثر تمثيلاً">
                        <div className="space-y-2">
                            {cities.slice(0, 8).map((row: any, i: number) => (
                                <div
                                    key={row.city}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-xs text-gray-400 w-4">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {row.city}
                                            </span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {row.count}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div
                                                className="h-1.5 rounded-full bg-blue-500"
                                                style={{
                                                    width: `${(row.count / cities[0].count) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>
            </div>
        </AppLayout>
    );
}
