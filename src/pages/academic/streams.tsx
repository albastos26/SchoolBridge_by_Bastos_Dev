import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { useStreams, useCreateStream, useUpdateStream, useDeleteStream } from '@/lib/academic-hooks';
import type { Stream } from '@/lib/academic-types';

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'code', header: 'Code', sortable: true },
  { key: 'description', header: 'Description', cell: (row: Stream) => row.description ?? '—' },
];

export function StreamsPage() {
  const { data, isLoading } = useStreams();
  const createMut = useCreateStream();
  const updateMut = useUpdateStream();
  const deleteMut = useDeleteStream();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Stream | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stream | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Stream Name', type: 'text', required: true, placeholder: 'e.g. Sciences' },
    { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. SCI' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      code: values.code as string,
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
        description: (values.description as string) || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Stream>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Streams"
        description="Academic tracks like Sciences, Commercial, Arts."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Streams' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Stream
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search streams..."
        emptyTitle="No streams yet"
        emptyDescription="Create your first stream to organize academic tracks."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Stream
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Stream"
        description="Create a new academic stream."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Stream"
        description="Update stream information."
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
        title="Delete Stream"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
