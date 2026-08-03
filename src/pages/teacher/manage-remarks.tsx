import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRemarks, useCreateRemark, useDeleteRemark } from '@/lib/module-hooks';
import { useStudents, useClasses, useAcademicYears } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { StudentRemark } from '@/lib/module-types';

const CATEGORY_BADGE: Record<string, string> = { general: 'secondary', academic: 'default', behavior: 'destructive', improvement: 'outline' };

const COLUMNS = [
  { key: 'student', header: 'Student', cell: (r: StudentRemark) => r.student?.full_name ?? '—' },
  { key: 'remark', header: 'Remark', cell: (r: StudentRemark) => r.remark.length > 60 ? r.remark.slice(0, 60) + '…' : r.remark },
  { key: 'category', header: 'Category', cell: (r: StudentRemark) => <Badge variant={CATEGORY_BADGE[r.category] as 'secondary' ?? 'outline'}>{r.category}</Badge> },
  { key: 'date', header: 'Date', cell: (r: StudentRemark) => new Date(r.created_at).toLocaleDateString() },
];

export function ManageRemarksPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useRemarks();
  const { data: students } = useStudents();
  const { data: classes } = useClasses();
  const { data: years } = useAcademicYears();
  const createMut = useCreateRemark();
  const deleteMut = useDeleteRemark();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentRemark | null>(null);

  const studentOpts = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));
  const classOpts = (classes ?? []).map((c) => ({ label: c.name, value: c.id }));
  const yearOpts = (years ?? []).map((y) => ({ label: y.name, value: y.id }));

  const fields: FormFieldDef[] = [
    { name: 'student_id', label: 'Student', type: 'select', required: true, options: studentOpts, placeholder: 'Select student' },
    { name: 'class_id', label: 'Class', type: 'select', required: true, options: classOpts, placeholder: 'Select class' },
    { name: 'academic_year_id', label: 'Academic Year', type: 'select', required: true, options: yearOpts, placeholder: 'Select year' },
    { name: 'remark', label: 'Remark', type: 'textarea', required: true, placeholder: 'Enter remark…' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { label: 'General', value: 'general' }, { label: 'Academic', value: 'academic' },
      { label: 'Behavior', value: 'behavior' }, { label: 'Improvement', value: 'improvement' },
    ], placeholder: 'Select category' },
  ];

  const handleCreate = async (v: Record<string, unknown>) => {
    if (!profile) return;
    await createMut.mutateAsync({
      student_id: v.student_id as string,
      class_id: v.class_id as string,
      academic_year_id: v.academic_year_id as string,
      teacher_id: profile.id,
      remark: v.remark as string,
      category: (v.category as string) || 'general',
    });
  };

  const rowActions: RowAction<StudentRemark>[] = [
    { icon: Trash2, label: 'Delete', onClick: (r) => setDeleteTarget(r), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Student Remarks"
        description="Record remarks for students."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher' }, { label: 'Remarks' }]}
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Remark</Button>}
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search remarks..."
        emptyTitle="No remarks yet"
        emptyDescription="Add a remark to track student progress and behavior."
        emptyAction={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Remark</Button>}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="New Remark" description="Record a remark for a student." fields={fields} onSubmit={handleCreate} submitLabel="Add Remark" />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Remark" description="Delete this remark? This cannot be undone." confirmLabel="Delete" destructive onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id); }} />
    </div>
  );
}
