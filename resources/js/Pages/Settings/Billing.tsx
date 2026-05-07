// resources/js/Pages/Settings/Billing.tsx

import { Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import { Check, Zap } from "lucide-react";

interface Plan {
    key: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

interface Props {
    plan: string;
    trialEndsAt: string | null;
    isOnTrial: boolean;
    subscription: { status: string; ends_at: string | null } | null;
    plans: Plan[];
}

const PLAN_COLORS: Record<string, string> = {
    free: "border-gray-200",
    clinic: "border-primary-500 ring-2 ring-primary-500",
    chain: "border-amber-400",
};

export default function SettingsBilling({
    plan,
    trialEndsAt,
    isOnTrial,
    subscription,
    plans,
}: Props) {
    return (
        <AppLayout title="الباقة والفواتير">
            <Head title="الباقة والفواتير" />

            <div className="max-w-3xl space-y-6">
                {/* Current plan status */}
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        باقتك الحالية
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-display font-bold text-gray-900">
                                {plans.find((p) => p.key === plan)?.name ??
                                    plan}
                            </p>
                            {isOnTrial && trialEndsAt && (
                                <p className="text-sm text-amber-600 mt-1">
                                    الفترة التجريبية تنتهي {trialEndsAt}
                                </p>
                            )}
                            {subscription?.status === "canceled" && (
                                <p className="text-sm text-red-600 mt-1">
                                    الباقة ستنتهي {subscription.ends_at}
                                </p>
                            )}
                        </div>
                        {plan !== "free" && (
                            <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-full font-medium">
                                نشطة
                            </span>
                        )}
                    </div>
                </div>

                {/* Plans */}
                <div className="grid sm:grid-cols-3 gap-4">
                    {plans.map((p) => (
                        <div
                            key={p.key}
                            className={`card p-5 border-2 relative ${PLAN_COLORS[p.key] ?? "border-gray-200"}`}
                        >
                            {p.key === plan && (
                                <div className="absolute -top-3 right-4">
                                    <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        خطتك الحالية
                                    </span>
                                </div>
                            )}

                            <h4 className="font-display font-bold text-gray-900">
                                {p.name}
                            </h4>

                            <div className="flex items-baseline gap-1 my-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    ${p.price}
                                </span>
                                {p.price > 0 && (
                                    <span className="text-xs text-gray-500">
                                        /شهر
                                    </span>
                                )}
                                {p.price === 0 && (
                                    <span className="text-xs text-gray-500">
                                        مجاناً
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-2 mb-4">
                                {p.features.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-gray-600"
                                    >
                                        <Check
                                            size={12}
                                            className="text-primary-600 shrink-0"
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {p.key !== plan ? (
                                <button
                                    onClick={() =>
                                        alert(
                                            "Stripe integration coming in Phase 4",
                                        )
                                    }
                                    className={
                                        p.key === "clinic"
                                            ? "btn-primary w-full justify-center text-sm"
                                            : "btn-secondary w-full justify-center text-sm"
                                    }
                                >
                                    <Zap size={14} />
                                    {p.price > 0 ? "ترقية" : "تخفيض"}
                                </button>
                            ) : (
                                <div className="w-full py-2 text-center text-xs text-gray-400">
                                    باقتك الحالية
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Phase 4 note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                    💳 ستتوفر إدارة الاشتراكات والفوترة قريباً. للترقية الآن
                    تواصل معنا على support@ayadatypro.com
                </div>
            </div>
        </AppLayout>
    );
}
