import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass, useAcademicYears, useStreams, useTeachers } from '@/lib/academic-hooks';
import type { SchoolClass } from '@/lib/academic-types';

export function ClassesPage() {
  const { data, isLoading } = useClasses();
  const { data: academicYears } = useAcademicYears();
  const { data: streams } = useStreams();
  const { data: teachers } = useTeachers();
  const createMut = useCreateClass();
  const updateMut = useUpdateClass();
  const deleteMut = useDeleteClass();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);

  const academicYearOptions = (academicYears ?? []).map((y) => ({ label: y.name, value: y.id }));
  const streamOptions = (streams ?? []).map((s) => ({ label: s.name, value: s.id }));
  const teacherOptions = (teachers ?? []).map((t) => ({ label: t.full_name ?? t.email, value: t.id }));

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'grade_level', header: 'Grade', sortable: true },
    { key: 'section', header: 'Section', sortable: true },
    { key: 'academic_year', header: 'Academic Year', cell: (row: SchoolClass) => row.academic_year?.name ?? '—' },
    { key: 'stream', header: 'Stream', cell: (row: SchoolClass) => row.stream?.name ?? '—' },
    { key: 'class_teacher', header: 'Class Teacher', cell: (row: SchoolClass) => row.class_teacher?.full_name ?? '—' },
    { key: 'capacity', header: 'Capacity', cell: (row: SchoolClass) => String(row.capacity) },
  ];

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Class Name', type: 'text', required: true, placeholder: 'Grade 10-B' },
    { name: 'grade_level', label: 'Grade Level', type: 'number', required: true, min: 1, max: 12 },
    { name: 'section', label: 'Section', type: 'text', required: true, placeholder: 'B' },
    { name: 'academic_year_id', label: 'Academic Year', type: 'select', required: true, options: academicYearOptions, placeholder: 'Select academic year' },
    { name: 'stream_id', label: 'Stream', type: 'select', options: streamOptions, placeholder: 'Select stream' },
    { name: 'class_teacher_id', label: 'Class Teacher', type: 'select', options: teacherOptions, placeholder: 'Select teacher' },
    { name: 'capacity', label: 'Capacity', type: 'number', defaultValue: 40, min: 1, max: 200 },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      grade_level: Number(values.grade_level),
      section: values.section as string,
      academic_year_id: values.academic_year_id as string,
      stream_id: (values.stream_id as string) || null,
      class_teacher_id: (values.class_teacher_id as string) || null,
      capacity: Number(values.capacity) || 40,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        name: values.name as string,
        grade_level: Number(values.grade_level),
        section: values.section as string,
        stream_id: (values.stream_id as string) || null,
        class_teacher_id: (values.class_teacher_id as string) || null,
        capacity: Number(values.capacity) || 40,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<SchoolClass>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Classes"
        description="Manage classes, sections, and their teachers."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Class
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search classes..."
        emptyTitle="No classes yet"
        emptyDescription="Create your first class to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Class
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Class"
        description="Create a new class."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Class"
        description="Update class information."
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
        title="Delete Class"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
