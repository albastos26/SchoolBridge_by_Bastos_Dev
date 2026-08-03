import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedicalVisits, useCreateMedicalVisit, useDeleteMedicalVisit } from '@/lib/module-hooks';
import { useStudents } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import type { MedicalVisit } from '@/lib/module-types';

const severityVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  minor: 'success',
  moderate: 'secondary',
  serious: 'warning',
  emergency: 'destructive',
};

const COLUMNS = [
  { key: 'student_name', header: 'Student', sortable: true, cell: (r: MedicalVisit) => r.student?.full_name ?? '—' },
  { key: 'visit_date', header: 'Visit Date', sortable: true },
  { key: 'diagnosis', header: 'Diagnosis', cell: (r: MedicalVisit) => r.diagnosis ?? '—' },
  { key: 'severity', header: 'Severity', cell: (r: MedicalVisit) => <Badge variant={severityVariant[r.severity] ?? 'secondary'}>{r.severity}</Badge> },
  { key: 'treatment', header: 'Treatment', cell: (r: MedicalVisit) => <span className="line-clamp-1 max-w-xs">{r.treatment ?? '—'}</span> },
];

export function MedicalVisitsPage() {
  const { data, isLoading } = useMedicalVisits();
  const { data: students } = useStudents();
  const { user } = useAuth();
  const createMut = useCreateMedicalVisit();
  const deleteMut = useDeleteMedicalVisit();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MedicalVisit | null>(null);

  const studentOptions = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));

  const fields: FormFieldDef[] = [
    { name: 'student_id', label: 'Student', type: 'select', options: studentOptions, required: true, placeholder: 'Select student' },
    { name: 'visit_date', label: 'Visit Date', type: 'date', required: true },
    { name: 'diagnosis', label: 'Diagnosis', type: 'text', placeholder: 'e.g. Headache' },
    { name: 'treatment', label: 'Treatment', type: 'textarea', placeholder: 'Treatment provided' },
    { name: 'medication', label: 'Medication', type: 'text', placeholder: 'Medication given (if any)' },
    {
      name: 'severity',
      label: 'Severity',
      type: 'select',
      placeholder: 'Select severity',
      options: [
        { label: 'Minor', value: 'minor' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Serious', value: 'serious' },
        { label: 'Emergency', value: 'emergency' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      student_id: values.student_id as string,
      visit_date: values.visit_date as string,
      diagnosis: (values.diagnosis as string) || null,
      treatment: (values.treatment as string) || null,
      medication: (values.medication as string) || null,
      severity: (values.severity as string) || 'minor',
      notes: (values.notes as string) || null,
      recorded_by: user?.id ?? null,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<MedicalVisit>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Medical Visits"
        description="Log and track student clinic visits and treatments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Nurse' }, { label: 'Medical Visits' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Visit
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search visits..."
        emptyTitle="No medical visits"
        emptyDescription="Log your first student clinic visit to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Visit
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Medical Visit"
        description="Record a student clinic visit."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Visit"
        description="Are you sure you want to delete this medical visit record? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
