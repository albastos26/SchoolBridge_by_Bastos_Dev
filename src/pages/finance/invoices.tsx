import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvoices, useCreateInvoice, useDeleteInvoice, useFeeStructures } from '@/lib/module-hooks';
import { useStudents, useAcademicYears } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { Invoice } from '@/lib/module-types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const statusVariant: Record<string, 'destructive' | 'warning' | 'success' | 'secondary'> = {
  unpaid: 'destructive',
  partial: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
};

const COLUMNS = [
  { key: 'invoice_number', header: 'Invoice #', sortable: true },
  { key: 'student', header: 'Student', cell: (row: Invoice) => row.student?.full_name ?? '—' },
  { key: 'amount', header: 'Amount', cell: (row: Invoice) => currency.format(Number(row.amount)), sortable: true },
  { key: 'paid_amount', header: 'Paid', cell: (row: Invoice) => currency.format(Number(row.paid_amount)) },
  {
    key: 'status',
    header: 'Status',
    cell: (row: Invoice) => <Badge variant={statusVariant[row.status] ?? 'secondary'}>{row.status}</Badge>,
  },
  { key: 'due_date', header: 'Due Date', cell: (row: Invoice) => row.due_date ?? '—' },
];

export function InvoicesPage() {
  const { data, isLoading } = useInvoices();
  const { data: students } = useStudents();
  const { data: academicYears } = useAcademicYears();
  const { data: feeStructures } = useFeeStructures();
  const createMut = useCreateInvoice();
  const deleteMut = useDeleteInvoice();
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const studentOptions = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));
  const yearOptions = (academicYears ?? []).map((y) => ({ label: y.name, value: y.id }));
  const feeOptions = (feeStructures ?? []).map((f) => ({ label: f.name, value: f.id }));

  const fields: FormFieldDef[] = [
    { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true, defaultValue: `INV-${Date.now()}` },
    { name: 'student_id', label: 'Student', type: 'select', required: true, options: studentOptions, placeholder: 'Select student' },
    { name: 'academic_year_id', label: 'Academic Year', type: 'select', required: true, options: yearOptions, placeholder: 'Select academic year' },
    { name: 'fee_structure_id', label: 'Fee Structure', type: 'select', options: feeOptions, placeholder: 'Select fee structure (optional)' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, placeholder: 'e.g. 1500' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      invoice_number: values.invoice_number as string,
      student_id: values.student_id as string,
      academic_year_id: values.academic_year_id as string,
      fee_structure_id: (values.fee_structure_id as string) || null,
      amount: Number(values.amount),
      due_date: (values.due_date as string) || null,
      notes: (values.notes as string) || null,
      created_by: user?.id ?? null,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Invoice>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices"
        description="Create and manage student invoices."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Invoices' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search invoices..."
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to bill a student."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Invoice"
        description="Create a new invoice for a student."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Invoice"
        description={`Are you sure you want to delete "${deleteTarget?.invoice_number}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
