import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/lib/academic-hooks';
import type { AcademicYear } from '@/lib/academic-types';

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'start_date',
    header: 'Start Date',
    cell: (row: AcademicYear) =>
      new Date(row.start_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
  },
  {
    key: 'end_date',
    header: 'End Date',
    cell: (row: AcademicYear) =>
      new Date(row.end_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
  },
  {
    key: 'is_active',
    header: 'Status',
    cell: (row: AcademicYear) => (
      <Badge variant={row.is_active ? 'success' : 'secondary'}>
        {row.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

export function AcademicYearsPage() {
  const { data, isLoading } = useAcademicYears();
  const createMut = useCreateAcademicYear();
  const updateMut = useUpdateAcademicYear();
  const deleteMut = useDeleteAcademicYear();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AcademicYear | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Year Name', type: 'text', required: true, placeholder: '2025/2026' },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    { name: 'is_active', label: 'Active', type: 'switch' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
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

  const rowActions: RowAction<AcademicYear>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Academic Years"
        description="Manage school years and their active status."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Academic Years' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Academic Year
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search academic years..."
        emptyTitle="No academic years yet"
        emptyDescription="Create your first academic year to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Academic Year
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Academic Year"
        description="Create a new academic year."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Academic Year"
        description="Update academic year information."
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
        title="Delete Academic Year"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
