import { Head, Link } from "@inertiajs/react";
import { CheckCircle, Calendar, Clock, User, Stethoscope } from "lucide-react";

interface Props {
    clinic: { name: string; slug: string };
    appointment: {
        patient: string;
        doctor: string;
        starts_at: string;
        ends_at: string;
    };
}

export default function BookingConfirmation({ clinic, appointment }: Props) {
    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            dir="rtl"
        >
            <Head title="تم تأكيد الحجز" />

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-emerald-600" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
                        تم تأكيد حجزك! 🎉
                    </h1>
                    <p className="text-gray-500 text-sm">
                        سيتواصل معك فريق {clinic.name} للتأكيد
                    </p>
                </div>

                {/* Appointment summary */}
                <div className="card p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">
                        تفاصيل الموعد
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                <Stethoscope
                                    size={15}
                                    className="text-primary-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">الطبيب</p>
                                <p className="font-medium text-gray-900">
                                    د. {appointment.doctor}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                <User size={15} className="text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">المريض</p>
                                <p className="font-medium text-gray-900">
                                    {appointment.patient}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                <Calendar
                                    size={15}
                                    className="text-primary-600"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">التاريخ</p>
                                <p
                                    className="font-medium text-gray-900"
                                    dir="ltr"
                                >
                                    {appointment.starts_at.split(" ")[0]}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                <Clock size={15} className="text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">الوقت</p>
                                <p
                                    className="font-medium text-gray-900"
                                    dir="ltr"
                                >
                                    {appointment.starts_at.split(" ")[1]} —{" "}
                                    {appointment.ends_at}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                    <a
                        href={`/book/${clinic.slug}`}
                        className="btn-secondary w-full justify-center"
                    >
                        حجز موعد آخر
                    </a>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    مدعوم بـ AyadatyPro
                </p>
            </div>
        </div>
    );
}
