// resources/js/Pages/Patients/Index.tsx

import { Head, Link, router } from "@inertiajs/react";
import {
    Plus,
    Search,
    User,
    Phone,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import AppLayout from "../../Layouts/AppLayout";

interface Patient {
    id: number;
    name: string;
    phone: string | null;
    gender: "male" | "female" | null;
    age: number | null;
    blood_type: string | null;
    created_at: string;
}

interface Pagination {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    patients: Pagination;
    filters: { search?: string; gender?: string };
}

const GENDER_LABELS = { male: "ذكر", female: "أنثى" };
const GENDER_COLORS = {
    male: "bg-blue-50 text-blue-700",
    female: "bg-pink-50 text-pink-700",
};

export default function PatientsIndex({ patients, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [gender, setGender] = useState(filters.gender ?? "");

    const applyFilters = useCallback((params: Record<string, string>) => {
        router.get("/patients", params, {
            preserveState: true,
            replace: true,
        });
    }, []);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        applyFilters({ search: value, gender });
    }, 350);

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleGender = (value: string) => {
        setGender(value);
        applyFilters({ search, gender: value });
    };

    return (
        <AppLayout title="المرضى">
            <Head title="المرضى" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-xl text-gray-900">
                        المرضى
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {patients.total} مريض مسجّل
                    </p>
                </div>
                <Link href="/patients/create" className="btn-primary">
                    <Plus size={16} />
                    مريض جديد
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        className="form-input pr-9"
                        placeholder="ابحث بالاسم أو رقم الجوال..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {/* Gender filter */}
                <div className="flex gap-2">
                    {[
                        { value: "", label: "الكل" },
                        { value: "male", label: "ذكور" },
                        { value: "female", label: "إناث" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleGender(opt.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                gender === opt.value
                                    ? "bg-primary-50 border-primary-500 text-primary-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {patients.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <User
                            size={40}
                            className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">
                            {search
                                ? "لا توجد نتائج للبحث"
                                : "لا يوجد مرضى مسجّلون بعد"}
                        </p>
                        {!search && (
                            <Link
                                href="/patients/create"
                                className="btn-primary mt-4 inline-flex"
                            >
                                <Plus size={16} />
                                أضف أول مريض
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-right font-medium text-gray-600 px-5 py-3">
                                        المريض
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden sm:table-cell">
                                        الجوال
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        العمر
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden md:table-cell">
                                        فصيلة الدم
                                    </th>
                                    <th className="text-right font-medium text-gray-600 px-4 py-3 hidden lg:table-cell">
                                        تاريخ التسجيل
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {patients.data.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {patient.name}
                                                    </p>
                                                    {patient.gender && (
                                                        <span
                                                            className={`text-xs px-1.5 py-0.5 rounded-full ${GENDER_COLORS[patient.gender]}`}
                                                        >
                                                            {
                                                                GENDER_LABELS[
                                                                    patient
                                                                        .gender
                                                                ]
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            {patient.phone ? (
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    <Phone size={12} />
                                                    {patient.phone}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                                            {patient.age
                                                ? `${patient.age} سنة`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {patient.blood_type ? (
                                                <span className="font-mono text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                                                    {patient.blood_type}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                                            {patient.created_at}
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <Link
                                                href={`/patients/${patient.id}`}
                                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {patients.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    صفحة {patients.current_page} من{" "}
                                    {patients.last_page}
                                </p>
                                <div className="flex gap-1">
                                    <PaginationButton
                                        url={patients.links[0]?.url}
                                        label={<ChevronRight size={14} />}
                                    />
                                    {patients.links
                                        .slice(1, -1)
                                        .map((link, i) => (
                                            <PaginationButton
                                                key={i}
                                                url={link.url}
                                                label={link.label}
                                                active={link.active}
                                            />
                                        ))}
                                    <PaginationButton
                                        url={
                                            patients.links[
                                                patients.links.length - 1
                                            ]?.url
                                        }
                                        label={<ChevronLeft size={14} />}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function PaginationButton({
    url,
    label,
    active = false,
}: {
    url: string | null;
    label: React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            onClick={() => url && router.visit(url, { preserveState: true })}
            disabled={!url}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                active
                    ? "bg-primary-600 text-white"
                    : url
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-gray-300 cursor-not-allowed"
            }`}
        >
            {label}
        </button>
    );
}
