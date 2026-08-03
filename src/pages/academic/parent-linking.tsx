import { useState } from 'react';
import { Link2, Trash2, Filter } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useParentLinks,
  useCreateParentLink,
  useDeleteParentLink,
  useParents,
  useStudents,
} from '@/lib/academic-hooks';
import type { ParentStudentLink } from '@/lib/academic-types';

const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: 'Parent',
  guardian: 'Guardian',
  mother: 'Mother',
  father: 'Father',
  other: 'Other',
};

export function ParentLinkingPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ParentStudentLink | null>(null);
  const [searchFilter, setSearchFilter] = useState('all');

  const { data, isLoading } = useParentLinks();
  const { data: parents } = useParents();
  const { data: students } = useStudents();

  const createMut = useCreateParentLink();
  const deleteMut = useDeleteParentLink();

  const columns = [
    {
      key: 'parent',
      header: 'Parent',
      sortable: true,
      cell: (row: ParentStudentLink) => (
        <div>
          <p className="text-sm font-medium">{row.parent?.full_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.parent?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      cell: (row: ParentStudentLink) => (
        <div>
          <p className="text-sm font-medium">{row.student?.full_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.student?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'relationship',
      header: 'Relationship',
      cell: (row: ParentStudentLink) => (
        <Badge variant="secondary">{RELATIONSHIP_LABELS[row.relationship] ?? row.relationship}</Badge>
      ),
    },
  ];

  const fields: FormFieldDef[] = [
    {
      name: 'parent_id',
      label: 'Parent',
      type: 'select',
      required: true,
      options: (parents ?? []).map((p) => ({ label: p.full_name ?? p.email, value: p.id })),
    },
    {
      name: 'student_id',
      label: 'Student',
      type: 'select',
      required: true,
      options: (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id })),
    },
    {
      name: 'relationship',
      label: 'Relationship',
      type: 'select',
      defaultValue: 'parent',
      options: Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => ({ label, value })),
    },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      parent_id: values.parent_id as string,
      student_id: values.student_id as string,
      relationship: (values.relationship as string) || 'parent',
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<ParentStudentLink>[] = [
    { icon: Trash2, label: 'Remove', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Parent Linking"
        description="Link parents to their children for attendance and grade visibility."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parent Linking' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            New Link
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search by parent or student name..."
        searchKeys={['parent_id', 'student_id'] as unknown as (keyof ParentStudentLink)[]}
        emptyTitle="No parent-student links"
        emptyDescription="Link parents to their children to enable parent portal access."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            New Link
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Link Parent to Student"
        description="Create a relationship between a parent and a student."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create Link"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Link"
        description={`Remove the link between ${deleteTarget?.parent?.full_name ?? 'this parent'} and ${deleteTarget?.student?.full_name ?? 'this student'}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
