import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTerms, useCreateTerm, useUpdateTerm, useDeleteTerm, useAcademicYears } from '@/lib/academic-hooks';
import type { Term } from '@/lib/academic-types';

export function TermsPage() {
  const { data, isLoading } = useTerms();
  const { data: academicYears } = useAcademicYears();
  const createMut = useCreateTerm();
  const updateMut = useUpdateTerm();
  const deleteMut = useDeleteTerm();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Term | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Term | null>(null);

  const academicYearOptions = (academicYears ?? []).map((y) => ({ label: y.name, value: y.id }));

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'start_date',
      header: 'Start Date',
      cell: (row: Term) =>
        new Date(row.start_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
    },
    {
      key: 'end_date',
      header: 'End Date',
      cell: (row: Term) =>
        new Date(row.end_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (row: Term) => (
        <Badge variant={row.is_active ? 'success' : 'secondary'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const fields: FormFieldDef[] = [
    {
      name: 'academic_year_id',
      label: 'Academic Year',
      type: 'select',
      required: true,
      options: academicYearOptions,
      placeholder: 'Select academic year',
    },
    { name: 'name', label: 'Term Name', type: 'text', required: true, placeholder: 'Term 1' },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    { name: 'is_active', label: 'Active', type: 'switch' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      academic_year_id: values.academic_year_id as string,
      name: values.name as string,
      start_date: values.start_date as string,
      end_date: values.end_date as string,
      is_active: (values.is_active as boolean) ?? false,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        name: values.name as string,
        start_date: values.start_date as string,
        end_date: values.end_date as string,
        is_active: (values.is_active as boolean) ?? false,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Term>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Terms"
        description="Manage terms within academic years."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Terms' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Term
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search terms..."
        emptyTitle="No terms yet"
        emptyDescription="Create your first term to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Term
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Term"
        description="Create a new term within an academic year."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Term"
        description="Update term information."
        fields={fields.map((f) => ({
          ...f,
          defaultValue: (editTarget ? (editTarget as unknown as Record<string, unknown>)[f.name] ?? '' : '') as string | number | boolean | null,
        }))}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Term"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
