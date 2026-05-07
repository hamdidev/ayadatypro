import { Head, useForm, router } from "@inertiajs/react";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import AppLayout from "../../Layouts/AppLayout";
import InvoiceForm from "../../Components/InvoiceForm";

interface PatientResult {
    id: number;
    name: string;
}

interface Props {
    preselectedPatient: PatientResult | null;
    visitId: number | null;
    currency: string;
}

export default function InvoiceCreate({
    preselectedPatient,
    visitId,
    currency,
}: Props) {
    const [patientSearch, setPatientSearch] = useState(
        preselectedPatient?.name ?? "",
    );
    const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const form = useForm({
        patient_id: preselectedPatient?.id?.toString() ?? "",
        visit_id: visitId?.toString() ?? "",
        discount: 0,
        notes: "",
        status: "pending",
        payment_method: "",
        amount_paid: 0,
        items: [{ description: "", quantity: 1, unit_price: 0 }],
    });

    const searchPatients = useDebouncedCallback(async (term: string) => {
        if (term.length < 2) {
            setPatientResults([]);
            return;
        }
        const res = await axios.get("/patients/search", {
            params: { q: term },
        });
        setPatientResults(res.data);
        setShowResults(true);
    }, 300);

    const selectPatient = (p: PatientResult) => {
        form.setData("patient_id", p.id.toString());
        setPatientSearch(p.name);
        setShowResults(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/invoices");
    };

    return (
        <AppLayout title="فاتورة جديدة">
            <Head title="فاتورة جديدة" />

            {/* Patient search — only shown if no pre-selected patient */}
            {!preselectedPatient && (
                <div className="mb-6 max-w-sm">
                    <label className="form-label">المريض *</label>
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            className={`form-input pr-9 ${form.errors.patient_id ? "border-red-400" : ""}`}
                            placeholder="ابحث باسم المريض..."
                            value={patientSearch}
                            onChange={(e) => {
                                setPatientSearch(e.target.value);
                                form.setData("patient_id", "");
                                searchPatients(e.target.value);
                            }}
                            onBlur={() =>
                                setTimeout(() => setShowResults(false), 200)
                            }
                            autoFocus
                        />
                        {showResults && patientResults.length > 0 && (
                            <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                {patientResults.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => selectPatient(p)}
                                        className="w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-900"
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {form.errors.patient_id && (
                        <p className="text-xs text-red-500 mt-1">
                            {form.errors.patient_id}
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={submit}>
                <InvoiceForm
                    form={form}
                    submitLabel="إنشاء الفاتورة"
                    currency={currency}
                    patientName={preselectedPatient?.name}
                    onCancel={() => router.visit("/invoices")}
                />
            </form>
        </AppLayout>
    );
}
