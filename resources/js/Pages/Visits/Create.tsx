import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import VisitForm from "../../Components/VisitForm";

interface Appointment {
    id: number;
    patient: { id: number; name: string };
    doctor: { id: number; name: string };
}

interface Props {
    appointment: Appointment | null;
}

export default function VisitCreate({ appointment }: Props) {
    const form = useForm({
        appointment_id: appointment?.id?.toString() ?? "",
        patient_id: appointment?.patient.id?.toString() ?? "",
        doctor_id: appointment?.doctor.id?.toString() ?? "",
        chief_complaint: "",
        diagnosis_code: "",
        diagnosis_free_text: "",
        notes: "",
        follow_up_date: "",
        prescription: null as null | {
            instructions: string;
            items: {
                medicine: string;
                dosage: string;
                frequency: string;
                duration: string;
            }[];
        },
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/visits");
    };

    return (
        <AppLayout title="سجل زيارة جديد">
            <Head title="سجل زيارة جديد" />
            <div className="max-w-2xl">
                <form onSubmit={submit}>
                    <VisitForm
                        form={form}
                        submitLabel="حفظ سجل الزيارة"
                        patientName={appointment?.patient.name ?? ""}
                        doctorName={appointment?.doctor.name ?? ""}
                        onCancel={() => router.history.back()}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
