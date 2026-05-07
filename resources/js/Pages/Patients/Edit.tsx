import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import PatientForm from "../../Components/PatientForm";

interface Patient {
    id: number;
    name: string;
    phone: string | null;
    national_id: string | null;
    dob: string | null;
    gender: string | null;
    blood_type: string | null;
    allergies: string[] | null;
    chronic_conditions: string[] | null;
    notes: string | null;
}

interface Props {
    patient: Patient;
}

export default function PatientEdit({ patient }: Props) {
    const form = useForm({
        name: patient.name,
        phone: patient.phone ?? "",
        national_id: patient.national_id ?? "",
        dob: patient.dob ?? "",
        gender: patient.gender ?? "",
        blood_type: patient.blood_type ?? "",
        allergies: patient.allergies ?? [],
        chronic_conditions: patient.chronic_conditions ?? [],
        notes: patient.notes ?? "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/patients/${patient.id}`);
    };

    return (
        <AppLayout title="تعديل بيانات المريض">
            <Head title={`تعديل — ${patient.name}`} />
            <form onSubmit={submit}>
                <PatientForm
                    form={form}
                    submitLabel="حفظ التغييرات"
                    onCancel={() => router.visit(`/patients/${patient.id}`)}
                />
            </form>
        </AppLayout>
    );
}
