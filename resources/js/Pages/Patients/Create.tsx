import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import PatientForm from "../../Components/PatientForm";

export default function PatientCreate() {
    const form = useForm({
        name: "",
        phone: "",
        national_id: "",
        dob: "",
        gender: "",
        blood_type: "",
        allergies: [] as string[],
        chronic_conditions: [] as string[],
        notes: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/patients");
    };

    return (
        <AppLayout title="مريض جديد">
            <Head title="مريض جديد" />
            <form onSubmit={submit}>
                <PatientForm
                    form={form}
                    submitLabel="حفظ المريض"
                    onCancel={() => router.visit("/patients")}
                />
            </form>
        </AppLayout>
    );
}
