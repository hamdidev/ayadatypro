import { Head, Link } from "@inertiajs/react";
import {
    Stethoscope,
    Calendar,
    Users,
    FileText,
    ArrowLeft,
    Check,
} from "lucide-react";

const FEATURES = [
    {
        icon: <Calendar size={20} />,
        title: "إدارة المواعيد",
        desc: "جدولة المواعيد وتتبعها بسهولة مع تنبيهات فورية",
    },
    {
        icon: <Users size={20} />,
        title: "سجلات المرضى",
        desc: "ملفات طبية كاملة مشفّرة وآمنة لكل مريض",
    },
    {
        icon: <FileText size={20} />,
        title: "الفواتير",
        desc: "إنشاء الفواتير وتتبع المدفوعات بضغطة زر",
    },
    {
        icon: <Stethoscope size={20} />,
        title: "متعدد الأطباء",
        desc: "أضف فريقك الطبي وأدر صلاحياتهم بمرونة",
    },
];

const PLANS = [
    {
        name: "مجاني",
        price: "0",
        period: "دائماً",
        color: "border-gray-200",
        features: [
            "طبيب واحد",
            "50 موعد شهرياً",
            "سجلات المرضى",
            "الفواتير الأساسية",
        ],
        cta: "ابدأ مجاناً",
        href: "/register",
        highlight: false,
    },
    {
        name: "عيادة",
        price: "99",
        period: "شهرياً",
        color: "border-primary-500 ring-2 ring-primary-500",
        features: [
            "حتى 3 أطباء",
            "مواعيد غير محدودة",
            "حجز إلكتروني",
            "تقارير متقدمة",
        ],
        cta: "جرّب 14 يوماً مجاناً",
        href: "/register",
        highlight: true,
    },
    {
        name: "سلسلة",
        price: "299",
        period: "شهرياً",
        color: "border-gray-200",
        features: [
            "أطباء غير محدودين",
            "فروع متعددة",
            "لوحة تحكم مركزية",
            "دعم مخصص",
        ],
        cta: "تواصل معنا",
        href: "/register",
        highlight: false,
    },
];

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Head title="AyadatyPro — نظام إدارة العيادات" />

            {/* Nav */}
            <nav className="border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={16} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-gray-900 text-lg">
                            AyadatyPro
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            تسجيل الدخول
                        </Link>
                        <Link href="/register" className="btn-primary text-sm">
                            ابدأ مجاناً
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-4 py-20 text-center">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    14 يوماً تجريبية مجانية · لا حاجة لبطاقة ائتمان
                </div>

                <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-900 leading-tight mb-5">
                    نظام إدارة عيادتك
                    <br />
                    <span className="text-primary-600">بالعربية</span>
                </h1>

                <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
                    AyadatyPro يساعد العيادات في الخليج على إدارة المواعيد
                    والمرضى والفواتير من مكان واحد — بسهولة وأمان.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/register"
                        className="btn-primary px-8 py-3 text-base"
                    >
                        ابدأ مجاناً الآن
                        <ArrowLeft size={18} className="rtl:rotate-180" />
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="font-display font-bold text-2xl text-center text-gray-900 mb-10">
                        كل ما تحتاجه في مكان واحد
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="card p-5">
                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-3">
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="font-display font-bold text-2xl text-center text-gray-900 mb-2">
                        باقات بسيطة وشفافة
                    </h2>
                    <p className="text-center text-gray-500 mb-10 text-sm">
                        ابدأ مجاناً وارقِّ باقتك عندما تنمو عيادتك
                    </p>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {PLANS.map((plan, i) => (
                            <div
                                key={i}
                                className={`card p-6 border-2 relative ${plan.color}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 right-1/2 translate-x-1/2">
                                        <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            الأكثر شيوعاً
                                        </span>
                                    </div>
                                )}
                                <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${plan.price}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        / {plan.period}
                                    </span>
                                </div>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((f, j) => (
                                        <li
                                            key={j}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                            <Check
                                                size={14}
                                                className="text-primary-600 shrink-0"
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={plan.href}
                                    className={
                                        plan.highlight
                                            ? "btn-primary w-full justify-center"
                                            : "btn-secondary w-full justify-center"
                                    }
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <Stethoscope size={14} />
                        <span>AyadatyPro © {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/terms" className="hover:text-gray-600">
                            شروط الاستخدام
                        </Link>
                        <Link href="/privacy" className="hover:text-gray-600">
                            الخصوصية
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
