import { useState } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
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
  useTeacherAssignments,
  useCreateTeacherAssignment,
  useDeleteTeacherAssignment,
  useAcademicYears,
  useTeachers,
  useSubjects,
  useClasses,
} from '@/lib/academic-hooks';
import type { TeacherAssignment } from '@/lib/academic-types';

export function TeacherAssignmentsPage() {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeacherAssignment | null>(null);

  const { data, isLoading } = useTeacherAssignments(yearFilter !== 'all' ? yearFilter : undefined);
  const { data: years } = useAcademicYears();
  const { data: teachers } = useTeachers();
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses(yearFilter !== 'all' ? yearFilter : undefined);

  const createMut = useCreateTeacherAssignment();
  const deleteMut = useDeleteTeacherAssignment();

  const columns = [
    {
      key: 'teacher',
      header: 'Teacher',
      sortable: true,
      cell: (row: TeacherAssignment) => row.teacher?.full_name ?? row.teacher?.email ?? '—',
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (row: TeacherAssignment) => (
        <Badge variant="secondary" className="font-mono">
          {row.subject?.code ?? '—'}
        </Badge>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      cell: (row: TeacherAssignment) => row.class?.name ?? '—',
    },
    {
      key: 'academic_year',
      header: 'Academic Year',
      cell: (row: TeacherAssignment) => row.academic_year?.name ?? '—',
    },
  ];

  const fields: FormFieldDef[] = [
    {
      name: 'teacher_id',
      label: 'Teacher',
      type: 'select',
      required: true,
      options: (teachers ?? []).map((t) => ({ label: t.full_name ?? t.email, value: t.id })),
    },
    {
      name: 'subject_id',
      label: 'Subject',
      type: 'select',
      required: true,
      options: (subjects ?? []).map((s) => ({ label: `${s.name} (${s.code})`, value: s.id })),
    },
    {
      name: 'class_id',
      label: 'Class',
      type: 'select',
      required: true,
      options: (classes ?? []).map((c) => ({ label: c.name, value: c.id })),
    },
    {
      name: 'academic_year_id',
      label: 'Academic Year',
      type: 'select',
      required: true,
      options: (years ?? []).map((y) => ({ label: y.name, value: y.id })),
      defaultValue: (years ?? []).find((y) => y.is_active)?.id ?? '',
    },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      teacher_id: values.teacher_id as string,
      subject_id: values.subject_id as string,
      class_id: values.class_id as string,
      academic_year_id: values.academic_year_id as string,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<TeacherAssignment>[] = [
    { icon: Trash2, label: 'Remove', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Teacher Assignments"
        description="Assign teachers to subjects and classes."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher Assignments' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search by teacher name..."
        searchKeys={['teacher_id'] as unknown as (keyof TeacherAssignment)[]}
        toolbar={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {(years ?? []).map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle="No assignments yet"
        emptyDescription="Assign teachers to subjects and classes to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Teacher Assignment"
        description="Assign a teacher to a subject and class."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create Assignment"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Assignment"
        description={`Remove ${deleteTarget?.teacher?.full_name ?? 'this teacher'} from ${deleteTarget?.subject?.name ?? 'this subject'} in ${deleteTarget?.class?.name ?? 'this class'}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
