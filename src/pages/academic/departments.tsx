import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, useStaff } from '@/lib/academic-hooks';
import type { Department } from '@/lib/academic-types';

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'code', header: 'Code', sortable: true },
  { key: 'head', header: 'Head', cell: (row: Department) => row.head?.full_name ?? '—' },
  { key: 'description', header: 'Description', cell: (row: Department) => row.description ?? '—' },
];

export function DepartmentsPage() {
  const { data, isLoading } = useDepartments();
  const { data: staff } = useStaff();
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const deleteMut = useDeleteDepartment();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const staffOptions = (staff ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'e.g. Sciences' },
    { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. SCI' },
    { name: 'head_id', label: 'Department Head', type: 'select', options: staffOptions, placeholder: 'Select staff member' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      code: values.code as string,
      head_id: (values.head_id as string) || null,
      description: (values.description as string) || null,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        name: values.name as string,
        code: values.code as string,
        head_id: (values.head_id as string) || null,
        description: (values.description as string) || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Department>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Departments"
        description="Organize subjects and staff into academic departments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Departments' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Department
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search departments..."
        emptyTitle="No departments yet"
        emptyDescription="Create your first department to organize subjects and staff."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Department
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Department"
        description="Create a new academic department."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Department"
        description="Update department information."
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
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
