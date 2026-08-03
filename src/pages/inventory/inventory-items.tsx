import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '@/lib/module-hooks';
import type { InventoryItem } from '@/lib/module-types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const COLUMNS = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'sku', header: 'SKU', cell: (row: InventoryItem) => row.sku ?? '—' },
  {
    key: 'category',
    header: 'Category',
    cell: (row: InventoryItem) => <Badge variant="secondary">{row.category}</Badge>,
  },
  {
    key: 'quantity',
    header: 'Quantity',
    cell: (row: InventoryItem) => (
      <span className="flex items-center gap-2">
        {row.quantity} {row.unit}
        {Number(row.quantity) <= Number(row.reorder_level) && (
          <Badge variant="warning">Low</Badge>
        )}
      </span>
    ),
  },
  { key: 'reorder_level', header: 'Reorder Level', cell: (row: InventoryItem) => row.reorder_level },
  {
    key: 'unit_cost',
    header: 'Unit Cost',
    cell: (row: InventoryItem) => currency.format(Number(row.unit_cost)),
    sortable: true,
  },
  { key: 'location', header: 'Location', cell: (row: InventoryItem) => row.location ?? '—' },
];

export function InventoryItemsPage() {
  const { data, isLoading } = useInventory();
  const createMut = useCreateInventoryItem();
  const updateMut = useUpdateInventoryItem();
  const deleteMut = useDeleteInventoryItem();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Notebook' },
    { name: 'sku', label: 'SKU', type: 'text', placeholder: 'e.g. NB-001' },
    { name: 'category', label: 'Category', type: 'text', defaultValue: 'general', placeholder: 'e.g. stationery' },
    { name: 'unit', label: 'Unit', type: 'text', defaultValue: 'pcs', placeholder: 'e.g. pcs, box' },
    { name: 'quantity', label: 'Quantity', type: 'number', defaultValue: 0, min: 0 },
    { name: 'reorder_level', label: 'Reorder Level', type: 'number', defaultValue: 10, min: 0 },
    { name: 'unit_cost', label: 'Unit Cost', type: 'number', defaultValue: 0, min: 0 },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Shelf A-1' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      name: values.name as string,
      sku: (values.sku as string) || null,
      category: (values.category as string) || 'general',
      unit: (values.unit as string) || 'pcs',
      quantity: Number(values.quantity) || 0,
      reorder_level: Number(values.reorder_level) || 10,
      unit_cost: Number(values.unit_cost) || 0,
      location: (values.location as string) || null,
    });
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      input: {
        name: values.name as string,
        sku: (values.sku as string) || null,
        category: (values.category as string) || 'general',
        unit: (values.unit as string) || 'pcs',
        quantity: Number(values.quantity) || 0,
        reorder_level: Number(values.reorder_level) || 10,
        unit_cost: Number(values.unit_cost) || 0,
        location: (values.location as string) || null,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<InventoryItem>[] = [
    { icon: Pencil, label: 'Edit', onClick: (row) => setEditTarget(row) },
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inventory Items"
        description="Manage stock items and levels."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Items' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search inventory..."
        emptyTitle="No items yet"
        emptyDescription="Add your first inventory item to start tracking stock."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Inventory Item"
        description="Add a new item to inventory."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit Item"
        description="Update inventory item information."
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
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
