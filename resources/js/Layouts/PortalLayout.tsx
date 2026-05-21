import { Head } from "@inertiajs/react";
import { ReactNode } from "react";
import { Calendar, FileText, ClipboardList, LogOut, User } from "lucide-react";

interface Props {
    title?: string;
    children: ReactNode;
    patientName?: string;
}

const NAV = [
    { href: "/portal/dashboard", label: "الرئيسية", icon: User },
    { href: "/portal/appointments", label: "المواعيد", icon: Calendar },
    { href: "/portal/visits", label: "الزيارات", icon: ClipboardList },
    { href: "/portal/invoices", label: "الفواتير", icon: FileText },
];

export default function PortalLayout({ title, children, patientName }: Props) {
    return (
        <>
            {title && <Head title={title} />}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
                {/* Top bar */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
                    <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                        <span className="font-bold text-blue-600 text-lg">
                            بوابة المريض
                        </span>
                        <div className="flex items-center gap-3">
                            {patientName && (
                                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                                    {patientName}
                                </span>
                            )}
                            <form method="POST" action="/portal/logout">
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={
                                        document
                                            .querySelector(
                                                "meta[name=csrf-token]",
                                            )
                                            ?.getAttribute("content") ?? ""
                                    }
                                />
                                <button
                                    type="submit"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
                    {children}
                </main>

                {/* Bottom nav (mobile-first) */}
                <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-30">
                    <div className="max-w-2xl mx-auto flex">
                        {NAV.map((item) => {
                            const Icon = item.icon;
                            const active =
                                typeof window !== "undefined" &&
                                window.location.pathname === item.href;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors ${
                                        active
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </a>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </>
    );
}
