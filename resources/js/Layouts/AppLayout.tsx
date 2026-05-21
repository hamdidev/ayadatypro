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
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 flex items-center justify-center text-sm font-bold shrink-0 select-none">
            {initials}
        </div>
    );
}

function FlashMessages({ flash }: { flash: PageProps["flash"] }) {
    const messages = [
        {
            key: "success" as const,
            cls: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400",
        },
        {
            key: "error" as const,
            cls: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400",
        },
        {
            key: "warning" as const,
            cls: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400",
        },
        {
            key: "info" as const,
            cls: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400",
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 bg-black/50 ${
                    sidebarOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                className={`
                fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900
                border-l border-gray-100 dark:border-gray-700 z-50
                flex flex-col shadow-xl transition-transform duration-200
                ${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0
            `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-gray-900 dark:text-white text-lg leading-none">
                            AyadatyPro
                        </h1>
                        {clinic && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[140px]">
                                {clinic.name}
                            </p>
                        )}
                    </div>
                    <button
                        className="lg:hidden mr-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="إغلاق"
                    >
                        <X size={18} />
                    </button>
                </div>

                {features?.multi_branch && (
                    <div className="px-5 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            خطة السلسلة
                        </span>
                    </div>
                )}

                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {visibleNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`sidebar-link ${isActive(item) ? "active" : ""}`}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <UserAvatar user={user} />
                        {user && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {ROLE_LABELS[user.role]}
                                </p>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="sidebar-link w-full mt-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300"
                    >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </Link>
                </div>
            </aside>

            <div className="lg:pr-64 min-h-screen flex flex-col">
                <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="فتح القائمة"
                    >
                        <Menu size={20} />
                    </button>
                    {title && (
                        <h2 className="font-display font-semibold text-gray-900 dark:text-white text-lg">
                            {title}
                        </h2>
                    )}
                    <div className="mr-auto">
                        <button
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
