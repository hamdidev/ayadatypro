// resources/js/types/index.d.ts
// Global TypeScript types shared across the app.
// Mirrors the shape of data shared by HandleInertiaRequests.php

export interface Can {
    manage_clinic: boolean;
    manage_staff: boolean;
    see_finances: boolean;
    book_appointments: boolean;
    view_patients: boolean;
    write_visit_notes: boolean;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: "owner" | "doctor" | "receptionist";
    can: Can;
}

export interface Clinic {
    id: number;
    name: string;
    slug: string;
}

export interface Features {
    multi_branch: boolean;
    sms_reminders: boolean;
    new_dashboard: boolean;
    ai_features: boolean;
}

export interface Flash {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

// ── The full shape of shared Inertia props ───────────────────
// Must match the return value of HandleInertiaRequests::share()
export interface PageProps {
    auth: {
        user: AuthUser | null;
    };
    clinic: Clinic | null;
    flash: Flash;
    locale: string;
    timezone: string;
    features: Features;

    // Allow page-specific props to be merged in
    [key: string]: unknown;
}
