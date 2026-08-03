import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, type FormFieldDef } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayments, useCreatePayment, useInvoices } from '@/lib/module-hooks';
import { useStudents } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { Payment } from '@/lib/module-types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money', 'card', 'check'];

const COLUMNS = [
  { key: 'receipt_number', header: 'Receipt #', sortable: true },
  { key: 'student', header: 'Student', cell: (row: Payment) => row.student?.full_name ?? '—' },
  { key: 'invoice', header: 'Invoice', cell: (row: Payment) => row.invoice?.invoice_number ?? '—' },
  { key: 'amount', header: 'Amount', cell: (row: Payment) => currency.format(Number(row.amount)), sortable: true },
  {
    key: 'payment_method',
    header: 'Method',
    cell: (row: Payment) => <Badge variant="secondary">{row.payment_method}</Badge>,
  },
  { key: 'payment_date', header: 'Date', cell: (row: Payment) => row.payment_date ?? '—' },
];

export function PaymentsPage() {
  const { data, isLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const { data: students } = useStudents();
  const createMut = useCreatePayment();
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const invoiceOptions = (invoices ?? []).map((i) => ({
    label: `${i.invoice_number} (${currency.format(Number(i.amount) - Number(i.paid_amount))} due)`,
    value: i.id,
  }));
  const studentOptions = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));

  const fields: FormFieldDef[] = [
    { name: 'receipt_number', label: 'Receipt Number', type: 'text', required: true, defaultValue: `RCP-${Date.now()}` },
    { name: 'invoice_id', label: 'Invoice', type: 'select', required: true, options: invoiceOptions, placeholder: 'Select invoice' },
    { name: 'student_id', label: 'Student', type: 'select', required: true, options: studentOptions, placeholder: 'Select student' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, placeholder: 'e.g. 500' },
    {
      name: 'payment_method',
      label: 'Payment Method',
      type: 'select',
      options: PAYMENT_METHODS.map((m) => ({ label: m, value: m })),
      placeholder: 'Select method',
    },
    { name: 'payment_date', label: 'Payment Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      receipt_number: values.receipt_number as string,
      invoice_id: values.invoice_id as string,
      student_id: values.student_id as string,
      amount: Number(values.amount),
      payment_method: (values.payment_method as string) || 'cash',
      payment_date: (values.payment_date as string) || new Date().toISOString().slice(0, 10),
      recorded_by: user?.id ?? null,
      notes: (values.notes as string) || null,
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payments"
        description="Record and track student payments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Payments' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search payments..."
        emptyTitle="No payments yet"
        emptyDescription="Record your first payment to track revenue."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Record Payment"
        description="Record a new payment for an invoice."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Record"
      />
    </div>
  );
}
