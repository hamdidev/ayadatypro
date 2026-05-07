import { router } from "@inertiajs/react";

// Cancel all pending Inertia requests on page unload to avoid stale responses
window.addEventListener("beforeunload", () => router.cancelAll());
