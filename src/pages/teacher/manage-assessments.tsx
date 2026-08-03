import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssessments, useCreateAssessment, useUpdateAssessment, useDeleteAssessment } from '@/lib/module-hooks';
import { useClasses, useSubjects, useAcademicYears } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { Assessment } from '@/lib/module-types';

const TYPE_BADGE: Record<string, string> = { quiz: 'secondary', exam: 'default', assignment: 'outline', homework: 'outline' };
const STATUS_BADGE: Record<string, string> = { draft: 'secondary', published: 'default', closed: 'destructive' };

const COLUMNS = [
  { key: 'title', header: 'Title', sortable: true },
  { key: 'type', header: 'Type', cell: (r: Assessment) => <Badge variant={TYPE_BADGE[r.type] as 'secondary' ?? 'outline'}>{r.type}</Badge> },
  { key: 'subject', header: 'Subject', cell: (r: Assessment) => r.subject?.name ?? '—' },
  { key: 'class', header: 'Class', cell: (r: Assessment) => r.class?.name ?? '—' },
  { key: 'max_score', header: 'Max Score', sortable: true },
  { key: 'due_date', header: 'Due Date', cell: (r: Assessment) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '—' },
  { key: 'status', header: 'Status', cell: (r: Assessment) => <Badge variant={STATUS_BADGE[r.status] as 'secondary' ?? 'outline'}>{r.status}</Badge> },
];

export function ManageAssessmentsPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useAssessments(profile ? { teacherId: profile.id } : undefined);
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { data: years } = useAcademicYears();
  const createMut = useCreateAssessment();
  const updateMut = useUpdateAssessment();
  const deleteMut = useDeleteAssessment();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assessment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);

  const classOpts = (classes ?? []).map((c) => ({ label: c.name, value: c.id }));
  const subjectOpts = (subjects ?? []).map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }));
  const yearOpts = (years ?? []).map((y) => ({ label: y.name, value: y.id }));

  const fields: FormFieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Mid-term Quiz' },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { label: 'Quiz', value: 'quiz' }, { label: 'Exam', value: 'exam' },
      { label: 'Assignment', value: 'assignment' }, { label: 'Homework', value: 'homework' },
    ], placeholder: 'Select type' },
    { name: 'subject_id', label: 'Subject', type: 'select', required: true, options: subjectOpts, placeholder: 'Select subject' },
    { name: 'class_id', label: 'Class', type: 'select', required: true, options: classOpts, placeholder: 'Select class' },
    { name: 'academic_year_id', label: 'Academic Year', type: 'select', required: true, options: yearOpts, placeholder: 'Select year' },
    { name: 'max_score', label: 'Max Score', type: 'number', required: true, placeholder: '100' },
    { name: 'due_date', label: 'Due Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Closed', value: 'closed' },
    ], placeholder: 'Select status' },
  ];

  const handleCreate = async (v: Record<string, unknown>) => {
    if (!profile) return;
    await createMut.mutateAsync({
      title: v.title as string,
      type: v.type as string,
      subject_id: v.subject_id as string,
      class_id: v.class_id as string,
      academic_year_id: v.academic_year_id as string,
      teacher_id: profile.id,
      max_score: Number(v.max_score ?? 100),
      due_date: (v.due_date as string) || null,
      description: (v.description as string) || null,
      status: (v.status as string) || 'draft',
    });
  };

  const handleUpdate = async (v: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        title: v.title, type: v.type, subject_id: v.subject_id, class_id: v.class_id,
        academic_year_id: v.academic_year_id, max_score: Number(v.max_score ?? 100),
        due_date: (v.due_date as string) || null, description: (v.description as string) || null,
        status: (v.status as string) || 'draft',
      },
    });
  };

  const rowActions: RowAction<Assessment>[] = [
    { icon: Pencil, label: 'Edit', onClick: (r) => setEditTarget(r) },
    { icon: Trash2, label: 'Delete', onClick: (r) => setDeleteTarget(r), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manage Assessments"
        description="Create and manage quizzes, exams, and assignments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher' }, { label: 'Assessments' }]}
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Assessment</Button>}
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search assessments..."
        emptyTitle="No assessments yet"
        emptyDescription="Create your first assessment to start grading."
        emptyAction={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Assessment</Button>}
      />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="New Assessment" description="Create a new quiz, exam, or assignment." fields={fields} onSubmit={handleCreate} submitLabel="Create" />
      <FormDialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)} title="Edit Assessment" description="Update assessment details." fields={fields.map((f) => ({ ...f, defaultValue: (editTarget ? (editTarget as unknown as Record<string, unknown>)[f.name] ?? '' : '') as string | number | boolean | null }))} onSubmit={handleUpdate} submitLabel="Save Changes" />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Assessment" description={`Delete "${deleteTarget?.title}"? This cannot be undone.`} confirmLabel="Delete" destructive onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id); }} />
    </div>
  );
}
