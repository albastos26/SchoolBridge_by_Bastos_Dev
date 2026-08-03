import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from '@/lib/module-hooks';
import type { Supplier } from '@/lib/module-types';

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'contact_person', header: 'Contact Person', cell: (row: Supplier) => row.contact_person ?? '—' },
  { key: 'phone', header: 'Phone', cell: (row: Supplier) => row.phone ?? '—' },
  { key: 'email', header: 'Email', cell: (row: Supplier) => row.email ?? '—' },
];

export function SuppliersPage() {
  const { data, isLoading } = useSuppliers();
  const createMut = useCreateSupplier();
  const deleteMut = useDeleteSupplier();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. ABC Supplies Ltd.' },
    { name: 'contact_person', label: 'Contact Person', type: 'text', placeholder: 'e.g. John Doe' },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: 'e.g. +1 234 567 890' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'e.g. contact@abc.com' },
    { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Optional address' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      contact_person: (values.contact_person as string) || null,
      phone: (values.phone as string) || null,
      email: (values.email as string) || null,
      address: (values.address as string) || null,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Supplier>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Suppliers"
        description="Manage suppliers and vendors."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Suppliers' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search suppliers..."
        emptyTitle="No suppliers yet"
        emptyDescription="Add your first supplier to track vendors."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Supplier"
        description="Add a new supplier or vendor."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
