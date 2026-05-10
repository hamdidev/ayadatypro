import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import VisitForm from "../../Components/VisitForm";

interface PrescriptionItem {
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface Props {
    visit: {
        id: number;
        patient: string;
        patient_id: number;
        doctor_id: number;
        chief_complaint: string | null;
        diagnosis_code: string | null;
        diagnosis_free_text: string | null;
        notes: string | null;
        follow_up_date: string | null;
        prescription: {
            instructions: string;
            items: PrescriptionItem[];
        } | null;
    };
}

export default function VisitEdit({ visit }: Props) {
    const form = useForm({
        chief_complaint: visit.chief_complaint ?? "",
        diagnosis_code: visit.diagnosis_code ?? "",
        diagnosis_free_text: visit.diagnosis_free_text ?? "",
        notes: visit.notes ?? "",
        follow_up_date: visit.follow_up_date ?? "",
        prescription: visit.prescription ?? null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/visits/${visit.id}`);
    };

    return (
        <AppLayout title="تعديل سجل الزيارة">
            <Head title={`تعديل زيارة — ${visit.patient}`} />
            <div className="max-w-2xl">
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    ⚠️ لا يمكن تعديل هذا السجل بعد توقيعه. تأكد من صحة البيانات.
                </div>
                <form onSubmit={submit}>
                    <VisitForm
                        form={form}
                        submitLabel="حفظ التغييرات"
                        patientName={visit.patient}
                        doctorName=""
                        onCancel={() => router.visit(`/visits/${visit.id}`)}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
