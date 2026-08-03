import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeeStructures, useCreateFeeStructure, useDeleteFeeStructure } from '@/lib/module-hooks';
import { useAcademicYears, useTerms } from '@/lib/academic-hooks';
import type { FeeStructure } from '@/lib/module-types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const FEE_TYPES = ['tuition', 'registration', 'lab', 'library', 'sports', 'other'];

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'fee_type',
    header: 'Type',
    cell: (row: FeeStructure) => <Badge variant="secondary">{row.fee_type}</Badge>,
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row: FeeStructure) => currency.format(Number(row.amount)),
    sortable: true,
  },
  { key: 'grade_level', header: 'Grade Level', cell: (row: FeeStructure) => row.grade_level ?? '—' },
  {
    key: 'academic_year',
    header: 'Academic Year',
    cell: (row: FeeStructure) => row.academic_year?.name ?? '—',
  },
];

export function FeeStructuresPage() {
  const { data, isLoading } = useFeeStructures();
  const { data: academicYears } = useAcademicYears();
  const { data: terms } = useTerms();
  const createMut = useCreateFeeStructure();
  const deleteMut = useDeleteFeeStructure();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null);

  const yearOptions = (academicYears ?? []).map((y) => ({ label: y.name, value: y.id }));
  const termOptions = (terms ?? []).map((t) => ({ label: t.name, value: t.id }));

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Term 1 Tuition' },
    { name: 'academic_year_id', label: 'Academic Year', type: 'select', required: true, options: yearOptions, placeholder: 'Select academic year' },
    { name: 'term_id', label: 'Term', type: 'select', options: termOptions, placeholder: 'Select term (optional)' },
    { name: 'grade_level', label: 'Grade Level', type: 'number', placeholder: 'e.g. 10' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, placeholder: 'e.g. 1500' },
    {
      name: 'fee_type',
      label: 'Fee Type',
      type: 'select',
      required: true,
      options: FEE_TYPES.map((t) => ({ label: t, value: t })),
      placeholder: 'Select fee type',
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      academic_year_id: values.academic_year_id as string,
      term_id: (values.term_id as string) || null,
      grade_level: values.grade_level != null ? Number(values.grade_level) : null,
      amount: Number(values.amount),
      fee_type: values.fee_type as string,
      description: (values.description as string) || null,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<FeeStructure>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fee Structures"
        description="Define fees for academic years and terms."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Fee Structures' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Fee Structure
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search fee structures..."
        emptyTitle="No fee structures yet"
        emptyDescription="Create your first fee structure to start billing students."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Fee Structure
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Fee Structure"
        description="Define a new fee for billing."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Fee Structure"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
