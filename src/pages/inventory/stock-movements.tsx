import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, type FormFieldDef } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStockMovements, useCreateStockMovement, useInventory, useSuppliers } from '@/lib/module-hooks';
import { useAuth } from '@/lib/auth';
import type { StockMovement } from '@/lib/module-types';

const typeVariant: Record<string, 'success' | 'warning' | 'secondary'> = {
  in: 'success',
  out: 'warning',
  adjustment: 'secondary',
};

const MOVEMENT_TYPES = ['in', 'out', 'adjustment'];

const COLUMNS = [
  { key: 'item', header: 'Item', cell: (row: StockMovement) => row.item?.name ?? '—' },
  {
    key: 'type',
    header: 'Type',
    cell: (row: StockMovement) => <Badge variant={typeVariant[row.type] ?? 'secondary'}>{row.type}</Badge>,
  },
  { key: 'quantity', header: 'Quantity', cell: (row: StockMovement) => `${row.quantity} ${row.item?.unit ?? ''}` },
  { key: 'reason', header: 'Reason', cell: (row: StockMovement) => row.reason ?? '—' },
  { key: 'created_at', header: 'Date', cell: (row: StockMovement) => new Date(row.created_at).toLocaleDateString() },
];

export function StockMovementsPage() {
  const { data, isLoading } = useStockMovements();
  const { data: inventory } = useInventory();
  const { data: suppliers } = useSuppliers();
  const createMut = useCreateStockMovement();
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const itemOptions = (inventory ?? []).map((i) => ({ label: i.name, value: i.id }));
  const supplierOptions = (suppliers ?? []).map((s) => ({ label: s.name, value: s.id }));

  const fields: FormFieldDef[] = [
    { name: 'item_id', label: 'Item', type: 'select', required: true, options: itemOptions, placeholder: 'Select item' },
    { name: 'supplier_id', label: 'Supplier (for stock-in)', type: 'select', options: supplierOptions, placeholder: 'Select supplier (optional)' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: MOVEMENT_TYPES.map((t) => ({ label: t, value: t })),
      placeholder: 'Select type',
    },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 0, placeholder: 'e.g. 50' },
    { name: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Optional reason / notes' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      item_id: values.item_id as string,
      supplier_id: (values.supplier_id as string) || null,
      type: values.type as string,
      quantity: Number(values.quantity),
      reason: (values.reason as string) || null,
      recorded_by: user?.id ?? null,
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Stock Movements"
        description="Record stock in, out, and adjustments."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Stock Movements' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Movement
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search movements..."
        emptyTitle="No stock movements yet"
        emptyDescription="Record your first stock movement to track inventory changes."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Movement
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Stock Movement"
        description="Record a stock in, out, or adjustment."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Record"
      />
    </div>
  );
}
