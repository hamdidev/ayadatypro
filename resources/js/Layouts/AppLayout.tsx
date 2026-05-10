// resources/js/Layouts/AppLayout.tsx

import { ReactNode, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    CalendarDays,
    List,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Stethoscope,
} from "lucide-react";
import type { PageProps, Can } from "../types";

interface Props {
    children: ReactNode;
    title?: string;
}

interface NavItem {
    href: string;
    label: string;
    icon: ReactNode;
    permission?: keyof Can;
    exact?: boolean;
}

const navItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "لوحة التحكم",
        icon: <LayoutDashboard size={18} />,
        exact: true,
    },
    {
        href: "/appointments/calendar",
        label: "التقويم",
        icon: <CalendarDays size={18} />,
    },
    { href: "/appointments", label: "المواعيد", icon: <List size={18} /> },
    {
        href: "/patients",
        label: "المرضى",
        icon: <Users size={18} />,
        permission: "view_patients",
    },
    {
        href: "/invoices",
        label: "الفواتير",
        icon: <FileText size={18} />,
        permission: "see_finances",
    },
    {
        href: "/settings",
        label: "الإعدادات",
        icon: <Settings size={18} />,
        permission: "manage_clinic",
    },
];

const ROLE_LABELS = {
    owner: "صاحب العيادة",
    doctor: "طبيب",
    receptionist: "موظف استقبال",
};

function UserAvatar({ user }: { user: PageProps["auth"]["user"] }) {
    if (!user) return null;
    if (user.avatar)
        return (
            <img
                src={user.avatar}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                alt={user.name}
            />
        );
    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("");
    return (
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0 select-none">
            {initials}
        </div>
    );
}

function FlashMessages({ flash }: { flash: PageProps["flash"] }) {
    const messages = [
        {
            key: "success" as const,
            cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
        },
        { key: "error" as const, cls: "bg-red-50 border-red-200 text-red-700" },
        {
            key: "warning" as const,
            cls: "bg-amber-50 border-amber-200 text-amber-700",
        },
        {
            key: "info" as const,
            cls: "bg-blue-50 border-blue-200 text-blue-700",
        },
    ];
    const active = messages.filter((m) => flash?.[m.key]);
    if (!active.length) return null;
    return (
        <div className="mx-4 lg:mx-6 mt-4 space-y-2">
            {active.map(({ key, cls }) => (
                <div
                    key={key}
                    className={`p-3 border rounded-lg text-sm ${cls}`}
                >
                    {flash[key]}
                </div>
            ))}
        </div>
    );
}

export default function AppLayout({ children, title }: Props) {
    const { auth, clinic, flash, features } = usePage<PageProps>().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;

    const visibleNav = navItems.filter(
        (item) => !item.permission || user?.can[item.permission],
    );

    const isActive = (item: NavItem) =>
        item.exact
            ? currentPath === item.href
            : currentPath.startsWith(item.href);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-100 z-50
                flex flex-col shadow-xl transition-transform duration-200
                ${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0
            `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-gray-900 text-lg leading-none">
                            AyadatyPro
                        </h1>
                        {clinic && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[140px]">
                                {clinic.name}
                            </p>
                        )}
                    </div>
                    <button
                        className="lg:hidden mr-auto text-gray-400"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="إغلاق"
                    >
                        <X size={18} />
                    </button>
                </div>

                {features?.multi_branch && (
                    <div className="px-5 py-2.5 border-b border-gray-100">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            خطة السلسلة
                        </span>
                    </div>
                )}

                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {visibleNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive(item) ? "active" : ""}`}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <UserAvatar user={user} />
                        {user && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {ROLE_LABELS[user.role]}
                                </p>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="sidebar-link w-full mt-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </Link>
                </div>
            </aside>

            <div className="lg:pr-64 min-h-screen flex flex-col">
                <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="فتح القائمة"
                    >
                        <Menu size={20} />
                    </button>
                    {title && (
                        <h2 className="font-display font-semibold text-gray-900 text-lg">
                            {title}
                        </h2>
                    )}
                    <div className="mr-auto">
                        <button
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            aria-label="الإشعارات"
                        >
                            <Bell size={18} />
                        </button>
                    </div>
                </header>

                <FlashMessages flash={flash} />

                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
