import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, useDepartments, useStreams } from '@/lib/academic-hooks';
import type { Subject } from '@/lib/academic-types';

export function SubjectsPage() {
  const { data, isLoading } = useSubjects();
  const { data: departments } = useDepartments();
  const { data: streams } = useStreams();
  const createMut = useCreateSubject();
  const updateMut = useUpdateSubject();
  const deleteMut = useDeleteSubject();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const departmentOptions = (departments ?? []).map((d) => ({ label: d.name, value: d.id }));
  const streamOptions = (streams ?? []).map((s) => ({ label: s.name, value: s.id }));

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'department', header: 'Department', cell: (row: Subject) => row.department?.name ?? '—' },
    { key: 'stream', header: 'Stream', cell: (row: Subject) => row.stream?.name ?? '—' },
  ];

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Subject Name', type: 'text', required: true, placeholder: 'e.g. Mathematics' },
    { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. MATH' },
    { name: 'department_id', label: 'Department', type: 'select', options: departmentOptions, placeholder: 'Select department' },
    { name: 'stream_id', label: 'Stream', type: 'select', options: streamOptions, placeholder: 'Select stream' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      code: values.code as string,
      department_id: (values.department_id as string) || null,
      stream_id: (values.stream_id as string) || null,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        name: values.name as string,
        code: values.code as string,
        department_id: (values.department_id as string) || null,
        stream_id: (values.stream_id as string) || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Subject>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Subjects"
        description="Manage subjects offered by the school."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Subjects' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Subject
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search subjects..."
        emptyTitle="No subjects yet"
        emptyDescription="Create your first subject to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Subject
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Subject"
        description="Create a new subject."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Subject"
        description="Update subject information."
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
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
