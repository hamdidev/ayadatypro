import { Head, Link, usePage } from "@inertiajs/react";
import {
    Building2,
    Users,
    CalendarClock,
    CreditCard,
    UserCircle,
    ChevronLeft,
} from "lucide-react";
import AppLayout from "../../Layouts/AppLayout";
import { PageProps } from "../../types";

interface SettingCard {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    permission?: keyof PageProps["auth"]["user"]["can"];
}

export default function SettingsIndex() {
    const { auth } = usePage<PageProps>().props;
    const can = auth.user?.can;

    const cards: SettingCard[] = [
        {
            href: "/settings/profile",
            icon: <UserCircle size={22} className="text-primary-600" />,
            title: "الملف الشخصي",
            description: "تعديل بياناتك الشخصية وكلمة المرور والصورة",
        },
        {
            href: "/settings/clinic",
            icon: <Building2 size={22} className="text-blue-600" />,
            title: "إعدادات العيادة",
            description: "اسم العيادة والموقع والمنطقة الزمنية وإعدادات المواعيد",
            permission: "manage_clinic",
        },
        {
            href: "/settings/team",
            icon: <Users size={22} className="text-green-600" />,
            title: "الفريق",
            description: "إدارة الأطباء وموظفي الاستقبال وصلاحياتهم",
            permission: "manage_clinic",
        },
        {
            href: "/settings/schedule",
            icon: <CalendarClock size={22} className="text-orange-600" />,
            title: "جدول العمل",
            description: "أوقات الدوام والإجازات وفترات الراحة",
        },
        {
            href: "/settings/billing",
            icon: <CreditCard size={22} className="text-purple-600" />,
            title: "الاشتراك والفواتير",
            description: "خطة الاشتراك الحالية وتفاصيل الدفع",
            permission: "manage_clinic",
        },
    ];

    const visible = cards.filter(
        (c) => !c.permission || can?.[c.permission],
    );

    return (
        <AppLayout title="الإعدادات">
            <Head title="الإعدادات" />

            <div className="max-w-2xl space-y-3">
                {visible.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                                {card.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {card.description}
                            </p>
                        </div>
                        <ChevronLeft
                            size={16}
                            className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
                        />
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
