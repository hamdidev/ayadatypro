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
        occupancy: any[];
        kpis: any;
    };
}

export default function Operational({ data }: Props) {
    const { occupancy, kpis } = data;

    const completionRate =
        kpis?.total_appointments > 0
            ? ((kpis.completed / kpis.total_appointments) * 100).toFixed(1)
            : "0";

    return (
        <AppLayout title="الكفاءة التشغيلية">
            <Head title="الكفاءة التشغيلية" />
            <div className="p-6 space-y-6" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/reports" className="hover:text-gray-700">
                        التقارير
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        الكفاءة التشغيلية
                    </span>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="معدل الإتمام"
                        value={`${completionRate}%`}
                        sub="آخر 30 يوم"
                        color={Number(completionRate) >= 80 ? "green" : "amber"}
                    />
                    <StatCard
                        title="إجمالي المواعيد"
                        value={kpis?.total_appointments ?? 0}
                        color="blue"
                    />
                    <StatCard
                        title="مرضى فريدون"
                        value={kpis?.unique_patients ?? 0}
                        color="blue"
                    />
                    <StatCard
                        title="متوسط مدة الموعد"
                        value={
                            kpis?.avg_duration ? `${kpis.avg_duration} د` : "—"
                        }
                        color="blue"
                    />
                </div>

                {/* Appointment outcomes breakdown */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        {
                            label: "مكتملة",
                            value: kpis?.completed,
                            color: "bg-green-100 text-green-700",
                        },
                        {
                            label: "غياب",
                            value: kpis?.no_shows,
                            color: "bg-red-100 text-red-700",
                        },
                        {
                            label: "ملغاة",
                            value: kpis?.cancelled,
                            color: "bg-gray-100 text-gray-600",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-2xl p-5 ${item.color}`}
                        >
                            <p className="text-xs mb-1 opacity-75">
                                {item.label}
                            </p>
                            <p className="text-3xl font-bold">
                                {item.value ?? 0}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Occupancy chart */}
                <ChartCard title="معدل الإشغال الشهري (آخر 6 أشهر)">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={occupancy}
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
                            <Bar
                                dataKey="booked"
                                name="booked"
                                fill="#e2e8f0"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="completed"
                                name="completed"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </AppLayout>
    );
}
