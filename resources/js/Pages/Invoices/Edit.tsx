import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";
import InvoiceForm from "../../Components/InvoiceForm";

interface Item {
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
}

interface Props {
    invoice: {
        id: number;
        invoice_number: string;
        patient: string;
        patient_id: number;
        visit_id: number | null;
        discount: number;
        notes: string;
        status: string;
        payment_method: string | null;
        amount_paid: number;
        items: Item[];
    };
    currency: string;
}

export default function InvoiceEdit({ invoice, currency }: Props) {
    const form = useForm({
        patient_id: invoice.patient_id.toString(),
        visit_id: invoice.visit_id?.toString() ?? "",
        discount: invoice.discount,
        notes: invoice.notes ?? "",
        status: invoice.status,
        payment_method: invoice.payment_method ?? "",
        amount_paid: invoice.amount_paid,
        items: invoice.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
        })),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/invoices/${invoice.id}`);
    };

    return (
        <AppLayout title={`تعديل — ${invoice.invoice_number}`}>
            <Head title={`تعديل ${invoice.invoice_number}`} />
            <form onSubmit={submit}>
                <InvoiceForm
                    form={form}
                    submitLabel="حفظ التغييرات"
                    currency={currency}
                    patientName={invoice.patient}
                    onCancel={() => router.visit(`/invoices/${invoice.id}`)}
                />
            </form>
        </AppLayout>
    );
}
