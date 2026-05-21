import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
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
    Cell,
} from "recharts";
import StatCard from "@/Components/Reports/StatCard";
import ChartCard from "@/Components/Reports/ChartCard";
import { ChevronLeft, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Props {
    data: {
        monthly: any[];
        by_doctor: any[];
        aging: any[];
        kpis: any;
    };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

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
            {payload.map((e: any) => (
                <p key={e.dataKey} style={{ color: e.color }}>
                    {e.name}: {Number(e.value).toLocaleString("ar-SA")}
                    {currency ? " SAR" : ""}
                </p>
            ))}
        </div>
    );
}

export default function Revenue({ data }: Props) {
    const { monthly, by_doctor, aging, kpis } = data;

    const growth =
        kpis.revenue_last_month > 0
            ? (
                  ((kpis.revenue_this_month - kpis.revenue_last_month) /
                      kpis.revenue_last_month) *
                  100
              ).toFixed(1)
            : null;

    function exportExcel() {
        const wb = XLSX.utils.book_new();

        // Monthly sheet
        const ws1 = XLSX.utils.json_to_sheet(
            monthly.map((r) => ({
                الشهر: r.label,
                الإيرادات: r.revenue,
                المحصّل: r.collected,
                المتأخر: r.outstanding,
                "عدد الفواتير": r.invoice_count,
            })),
        );
        XLSX.utils.book_append_sheet(wb, ws1, "الإيرادات الشهرية");

        // By doctor sheet
        const ws2 = XLSX.utils.json_to_sheet(
            by_doctor.map((r) => ({
                الطبيب: r.doctor,
                الإيرادات: r.revenue,
                الفواتير: r.invoices,
            })),
        );
        XLSX.utils.book_append_sheet(wb, ws2, "إيرادات الأطباء");

        XLSX.writeFile(wb, "تقرير-الإيرادات.xlsx");
    }

    return (
        <AppLayout title="تقارير الإيرادات">
            <Head title="تقارير الإيرادات" />
            <div className="p-6 space-y-6" dir="rtl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/reports" className="hover:text-gray-700">
                        التقارير
                    </Link>
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        الإيرادات
                    </span>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="إيرادات هذا الشهر"
                        value={
                            Number(kpis.revenue_this_month).toLocaleString(
                                "ar-SA",
                            ) + " SAR"
                        }
                        sub={
                            growth
                                ? `${growth}% مقارنة بالشهر الماضي`
                                : undefined
                        }
                        color="green"
                    />
                    <StatCard
                        title="إيرادات الشهر الماضي"
                        value={
                            Number(kpis.revenue_last_month).toLocaleString(
                                "ar-SA",
                            ) + " SAR"
                        }
                        color="blue"
                    />
                    <StatCard
                        title="مبالغ متأخرة"
                        value={
                            Number(kpis.total_outstanding).toLocaleString(
                                "ar-SA",
                            ) + " SAR"
                        }
                        color="amber"
                    />
                    <StatCard
                        title="فواتير مدفوعة هذا الشهر"
                        value={kpis.paid_this_month}
                        color="green"
                    />
                </div>

                {/* Monthly revenue area chart */}
                <ChartCard
                    title="الإيرادات الشهرية (12 شهراً)"
                    action={
                        <button
                            onClick={exportExcel}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 transition-colors"
                        >
                            <Download size={13} />
                            Excel
                        </button>
                    }
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart
                            data={monthly}
                            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="revGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#10b981"
                                        stopOpacity={0.15}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#10b981"
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
                                orientation="right"
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) =>
                                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                                }
                            />
                            <Tooltip content={<ArabicTooltip currency />} />
                            <Area
                                type="monotone"
                                dataKey="collected"
                                name="collected"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#revGrad)"
                                dot={{ r: 3 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="outstanding"
                                name="outstanding"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="none"
                                strokeDasharray="4 2"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Bottom row */}
                <div className="grid xl:grid-cols-2 gap-6">
                    {/* Revenue by doctor */}
                    <ChartCard title="الإيرادات بحسب الطبيب (آخر 3 أشهر)">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={by_doctor}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 20,
                                    left: 60,
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
                                    tickFormatter={(v) =>
                                        v >= 1000
                                            ? `${(v / 1000).toFixed(0)}k`
                                            : v
                                    }
                                />
                                <YAxis
                                    type="category"
                                    dataKey="doctor"
                                    tick={{ fontSize: 11, fill: "#64748b" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={80}
                                />
                                <Tooltip content={<ArabicTooltip currency />} />
                                <Bar
                                    dataKey="revenue"
                                    name="revenue"
                                    radius={[0, 4, 4, 0]}
                                >
                                    {by_doctor.map((_: any, i: number) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Aging table */}
                    <ChartCard title="تقادم الفواتير المعلّقة">
                        {aging.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                                لا توجد فواتير معلّقة
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-right text-gray-500 font-medium pb-2">
                                            الفترة
                                        </th>
                                        <th className="text-center text-gray-500 font-medium pb-2">
                                            عدد الفواتير
                                        </th>
                                        <th className="text-left text-gray-500 font-medium pb-2">
                                            المبلغ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {aging.map((row: any) => (
                                        <tr key={row.bucket}>
                                            <td className="py-2.5 text-gray-700 dark:text-gray-300">
                                                {row.bucket}
                                            </td>
                                            <td className="py-2.5 text-center text-gray-600 dark:text-gray-400">
                                                {row.count}
                                            </td>
                                            <td
                                                className="py-2.5 text-left font-medium text-amber-600"
                                                dir="ltr"
                                            >
                                                {Number(
                                                    row.amount,
                                                ).toLocaleString("ar-SA")}{" "}
                                                SAR
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </ChartCard>
                </div>
            </div>
        </AppLayout>
    );
}
