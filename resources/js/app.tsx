/// <reference types="vite/client" />

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

import "./bootstrap";
import "../css/app.css";

// import { ErrorBoundary } from "@/Components/ErrorBoundary";
import { PageProps } from "./types";
import { ErrorBoundary } from "./Components/ErrorBoundary";
// import type { PageProps } from "@/types";

// Ambient type for Plausible — avoids "Property does not exist on window" TS error
declare global {
    interface Window {
        plausible?: (event: string, options?: Record<string, unknown>) => void;
    }
}

const appName = import.meta.env.VITE_APP_NAME ?? "AyadatyPro";

// ─────────────────────────────────────────────────────────────
// Global navigation hooks — production only
// ─────────────────────────────────────────────────────────────
if (import.meta.env.PROD) {
    router.on("start", () => {
        document.body.classList.add("page-loading");
    });

    router.on("finish", () => {
        document.body.classList.remove("page-loading");
        window.plausible?.("pageview");
    });

    router.on("error", (event) => {
        console.error("Inertia navigation error", event.detail);
    });
}

// ─────────────────────────────────────────────────────────────
// App bootstrap
// ─────────────────────────────────────────────────────────────
createInertiaApp<PageProps>({
    title: (title) => (title ? `${title} — ${appName}` : appName),

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            // Correct generic: Vite glob resolves to module objects, not components directly
            import.meta.glob<{ default: React.ComponentType<PageProps> }>(
                "./Pages/**/*.tsx",
            ),
        ),

    setup({ el, App, props }) {
        // ── RTL + i18n ────────────────────────────────────────────────
        // `props` here is InertiaAppProps — shared page data is one level deeper.
        const locale = (props.initialPage.props as PageProps).locale ?? "ar";
        const isRTL = locale === "ar";

        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = locale;
        document.documentElement.classList.toggle("rtl", isRTL);

        // ── Dev-only: RTL outline debugger (?debug-rtl in URL) ────────
        if (import.meta.env.DEV) {
            if (new URLSearchParams(window.location.search).has("debug-rtl")) {
                document.body.classList.add("debug-rtl-outline");
            }
        }

        // ── Error boundary fallback UI ─────────────────────────────────
        const errorFallback = (
            <div
                className="min-h-screen flex items-center justify-center bg-red-50"
                dir={isRTL ? "rtl" : "ltr"}
            >
                <div className="text-center p-6 max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">
                        {isRTL ? "حدث خطأ غير متوقع" : "Unexpected Error"}
                    </h2>
                    <p className="text-red-600 mb-4">
                        {isRTL
                            ? "يرجى تحديث الصفحة أو المحاولة لاحقاً"
                            : "Please refresh the page or try again later"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        {isRTL ? "إعادة التحميل" : "Reload Page"}
                    </button>
                </div>
            </div>
        );

        createRoot(el).render(
            <StrictMode>
                <ErrorBoundary fallback={errorFallback}>
                    <App {...props} />
                </ErrorBoundary>
            </StrictMode>,
        );
    },

    progress: {
        color: "#14b8a6", // Teal-500
        showSpinner: false, // Avoids RTL layout shift
        includeCSS: true,
    },
});
