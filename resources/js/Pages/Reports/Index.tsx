import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    TrendingUp,
    Stethoscope,
    Calendar,
    Users,
    BarChart2,
    RefreshCw,
} from "lucide-react";

const REPORTS = [
    {
        href: "/reports/revenue",
        icon: TrendingUp,
        title: "تقارير الإيرادات",
        desc: "الإيرادات الشهرية، أداء الأطباء، الفواتير المتأخرة",
        color: "text-green-600 bg-green-50 dark:bg-green-900/20",
    },
    {
        href: "/reports/clinical",
        icon: Stethoscope,
        title: "التقارير السريرية",
        desc: "التشخيصات الأكثر شيوعاً، عبء العمل، الالتزام بالمتابعة",
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
        href: "/reports/appointments",
        icon: Calendar,
        title: "تحليل المواعيد",
        desc: "معدل الغياب، ساعات الذروة، أسباب الإلغاء",
        color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    },
    {
        href: "/reports/patients",
        icon: Users,
        title: "تحليل المرضى",
        desc: "مرضى جدد مقابل عائدين، معدل الاحتفاظ، التوزيع الديموغرافي",
        color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
        href: "/reports/operational",
        icon: BarChart2,
        title: "الكفاءة التشغيلية",
        desc: "معدل الإشغال، متوسط وقت الانتظار، أداء العيادة",
        color: "text-red-600 bg-red-50 dark:bg-red-900/20",
    },
];

export default function ReportsIndex() {
    return (
        <AppLayout title="التقارير">
            <Head title="التقارير" />
            <div className="p-6 max-w-4xl" dir="rtl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            التقارير والتحليلات
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            بيانات مُحدَّثة كل 15 دقيقة
                        </p>
                    </div>
                    <form method="POST" action="/reports/flush">
                        <input
                            type="hidden"
                            name="_token"
                            value={
                                document
                                    .querySelector("meta[name=csrf-token]")
                                    ?.getAttribute("content") ?? ""
                            }
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <RefreshCw size={14} />
                            تحديث الآن
                        </button>
                    </form>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REPORTS.map((r) => {
                        const Icon = r.icon;
                        return (
                            <Link
                                key={r.href}
                                href={r.href}
                                className="group rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-md transition-shadow"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${r.color}`}
                                >
                                    <Icon size={20} />
                                </div>
                                <h2 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                    {r.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {r.desc}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
