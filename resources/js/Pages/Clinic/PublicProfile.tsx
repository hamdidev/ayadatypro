import { Head, Link } from "@inertiajs/react";
import { MapPin, Phone, Calendar, ChevronLeft } from "lucide-react";

interface Doctor {
    id: number;
    name: string;
    specialty: string | null;
    avatar: string | null;
}

interface Branch {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    is_main: boolean;
}

interface Clinic {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    logo: string | null;
    specialty: string | null;
}

interface Props {
    clinic: Clinic;
    doctors: Doctor[];
    branches: Branch[];
}

export default function PublicProfile({ clinic, doctors, branches }: Props) {
    return (
        <>
            <Head title={clinic.name} />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                {/* Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
                        {clinic.logo ? (
                            <img
                                src={clinic.logo}
                                alt={clinic.name}
                                className="w-16 h-16 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {clinic.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {clinic.name}
                            </h1>
                            {clinic.specialty && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {clinic.specialty}
                                </p>
                            )}
                            {clinic.phone && (
                                <p
                                    className="text-sm text-blue-600 mt-0.5"
                                    dir="ltr"
                                >
                                    {clinic.phone}
                                </p>
                            )}
                        </div>
                        <div className="mr-auto">
                            <a
                                href={`/book/${clinic.slug}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition-colors"
                            >
                                <Calendar size={15} />
                                احجز موعداً
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                    {/* Doctors */}
                    {doctors.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                الأطباء
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {doctors.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3"
                                    >
                                        {doc.avatar ? (
                                            <img
                                                src={doc.avatar}
                                                alt={doc.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {doc.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                د. {doc.name}
                                            </p>
                                            {doc.specialty && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {doc.specialty}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Branches */}
                    {branches.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                {branches.length === 1
                                    ? "موقع العيادة"
                                    : "الفروع"}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {branches.map((branch) => (
                                    <div
                                        key={branch.id}
                                        className="bg-white rounded-2xl border border-gray-100 p-5"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">
                                                {branch.name}
                                            </h3>
                                            {branch.is_main && (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                                    الرئيسي
                                                </span>
                                            )}
                                        </div>
                                        {branch.address && (
                                            <div className="flex items-start gap-1.5 text-sm text-gray-500">
                                                <MapPin
                                                    size={13}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                {branch.city
                                                    ? `${branch.city} — `
                                                    : ""}
                                                {branch.address}
                                            </div>
                                        )}
                                        {branch.phone && (
                                            <div
                                                className="flex items-center gap-1.5 text-sm text-gray-500 mt-1"
                                                dir="ltr"
                                            >
                                                <Phone size={13} />
                                                {branch.phone}
                                            </div>
                                        )}
                                        <a
                                            href={`/book/${clinic.slug}?branch=${branch.id}`}
                                            className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            احجز في هذا الفرع
                                            <ChevronLeft
                                                size={13}
                                                className="rtl:rotate-180"
                                            />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 mt-12 py-6 text-center text-xs text-gray-400">
                    مدعوم بـ AyadatyPro
                </div>
            </div>
        </>
    );
}
