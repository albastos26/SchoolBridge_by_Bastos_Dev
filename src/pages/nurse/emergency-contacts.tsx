import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmergencyContacts, useCreateEmergencyContact, useDeleteEmergencyContact } from '@/lib/module-hooks';
import { useStudents } from '@/lib/academic-hooks';
import type { EmergencyContact } from '@/lib/module-types';

const COLUMNS = [
  { key: 'student_name', header: 'Student', cell: (r: EmergencyContact) => r.student?.full_name ?? '—' },
  { key: 'name', header: 'Contact Name', sortable: true },
  { key: 'relationship', header: 'Relationship' },
  { key: 'phone', header: 'Phone' },
  { key: 'email', header: 'Email', cell: (r: EmergencyContact) => r.email ?? '—' },
  {
    key: 'is_primary',
    header: 'Primary',
    cell: (r: EmergencyContact) =>
      r.is_primary ? <Badge variant="success">Primary</Badge> : <Badge variant="secondary">Secondary</Badge>,
  },
];

export function EmergencyContactsPage() {
  const { data, isLoading } = useEmergencyContacts();
  const { data: students } = useStudents();
  const createMut = useCreateEmergencyContact();
  const deleteMut = useDeleteEmergencyContact();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(null);

  const studentOptions = (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id }));

  const fields: FormFieldDef[] = [
    { name: 'student_id', label: 'Student', type: 'select', options: studentOptions, required: true, placeholder: 'Select student' },
    { name: 'name', label: 'Contact Name', type: 'text', required: true, placeholder: 'e.g. Jane Doe' },
    { name: 'relationship', label: 'Relationship', type: 'text', required: true, placeholder: 'e.g. Mother' },
    { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: 'e.g. +1234567890' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'e.g. jane@example.com' },
    { name: 'is_primary', label: 'Primary Contact', type: 'switch' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      student_id: values.student_id as string,
      name: values.name as string,
      relationship: values.relationship as string,
      phone: values.phone as string,
      email: (values.email as string) || null,
      is_primary: (values.is_primary as boolean) ?? false,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<EmergencyContact>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Emergency Contacts"
        description="Manage emergency contact information for students."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Nurse' }, { label: 'Emergency Contacts' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search contacts..."
        emptyTitle="No emergency contacts"
        emptyDescription="Add your first emergency contact for a student."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Emergency Contact"
        description="Add an emergency contact for a student."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Contact"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
