import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useDisciplineRecords,
  useCreateDiscipline,
  useUpdateDiscipline,
  useDeleteDiscipline,
} from '@/lib/module-hooks';
import { useStudents, useClasses } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { DisciplineRecord } from '@/lib/module-types';

const typeVariant: Record<string, 'warning' | 'secondary' | 'destructive'> = {
  warning: 'warning',
  minor: 'secondary',
  major: 'destructive',
  suspension: 'destructive',
  expulsion: 'destructive',
};

const statusVariant: Record<string, 'warning' | 'success' | 'destructive'> = {
  open: 'warning',
  resolved: 'success',
  escalated: 'destructive',
};

const COLUMNS = [
  { key: 'student_name', header: 'Student', sortable: true, cell: (r: DisciplineRecord) => r.student?.full_name ?? '—' },
  { key: 'incident_date', header: 'Date', sortable: true },
  { key: 'type', header: 'Type', cell: (r: DisciplineRecord) => <Badge variant={typeVariant[r.type] ?? 'secondary'}>{r.type}</Badge> },
  { key: 'status', header: 'Status', cell: (r: DisciplineRecord) => <Badge variant={statusVariant[r.status] ?? 'warning'}>{r.status}</Badge> },
  {
    key: 'description',
    header: 'Description',
    cell: (r: DisciplineRecord) => (
      <span className="line-clamp-1 max-w-xs">{r.description}</span>
    ),
  },
];

export function DisciplineRecordsPage() {
  const { data, isLoading } = useDisciplineRecords();
  const { data: students } = useStudents();
  const { data: classes } = useClasses();
  const { user } = useAuth();
  const createMut = useCreateDiscipline();
  const updateMut = useUpdateDiscipline();
  const deleteMut = useDeleteDiscipline();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DisciplineRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisciplineRecord | null>(null);

  const studentOptions = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));
  const classOptions = (classes ?? []).map((c) => ({ label: c.name, value: c.id }));

  const fields: FormFieldDef[] = [
    { name: 'student_id', label: 'Student', type: 'select', options: studentOptions, required: true, placeholder: 'Select student' },
    { name: 'class_id', label: 'Class', type: 'select', options: classOptions, placeholder: 'Select class' },
    { name: 'incident_date', label: 'Incident Date', type: 'date', required: true },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      placeholder: 'Select type',
      options: [
        { label: 'Warning', value: 'warning' },
        { label: 'Minor', value: 'minor' },
        { label: 'Major', value: 'major' },
        { label: 'Suspension', value: 'suspension' },
        { label: 'Expulsion', value: 'expulsion' },
      ],
    },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the incident' },
    { name: 'action_taken', label: 'Action Taken', type: 'textarea', placeholder: 'Action taken (optional)' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Escalated', value: 'escalated' },
      ],
    },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      student_id: values.student_id as string,
      class_id: (values.class_id as string) || null,
      incident_date: values.incident_date as string,
      type: values.type as string,
      description: values.description as string,
      action_taken: (values.action_taken as string) || null,
      status: (values.status as string) || 'open',
      reported_by: user?.id ?? null,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        student_id: values.student_id as string,
        class_id: (values.class_id as string) || null,
        incident_date: values.incident_date as string,
        type: values.type as string,
        description: values.description as string,
        action_taken: (values.action_taken as string) || null,
        status: (values.status as string) || 'open',
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<DisciplineRecord>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Discipline Records"
        description="Log and manage student discipline incidents."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Discipline' }, { label: 'Records' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search records..."
        emptyTitle="No discipline records"
        emptyDescription="Create your first discipline record to track student incidents."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Discipline Record"
        description="Log a new student discipline incident."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Discipline Record"
        description="Update the discipline record details."
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
        title="Delete Record"
        description={`Are you sure you want to delete this discipline record? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
