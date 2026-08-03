import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/lib/module-hooks';
import { useAuth } from '@/lib/auth';
import type { Expense } from '@/lib/module-types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const CATEGORIES = ['salaries', 'supplies', 'maintenance', 'utilities', 'transport', 'other'];

const COLUMNS = [
  { key: 'description', header: 'Description', sortable: true },
  {
    key: 'category',
    header: 'Category',
    cell: (row: Expense) => <Badge variant="secondary">{row.category}</Badge>,
  },
  { key: 'amount', header: 'Amount', cell: (row: Expense) => currency.format(Number(row.amount)), sortable: true },
  { key: 'expense_date', header: 'Date', cell: (row: Expense) => row.expense_date ?? '—' },
];

export function ExpensesPage() {
  const { data, isLoading } = useExpenses();
  const createMut = useCreateExpense();
  const deleteMut = useDeleteExpense();
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const fields: FormFieldDef[] = [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: CATEGORIES.map((c) => ({ label: c, value: c })),
      placeholder: 'Select category',
    },
    { name: 'description', label: 'Description', type: 'text', required: true, placeholder: 'e.g. Lab supplies purchase' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, placeholder: 'e.g. 250' },
    { name: 'expense_date', label: 'Expense Date', type: 'date' },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      category: values.category as string,
      description: values.description as string,
      amount: Number(values.amount),
      expense_date: (values.expense_date as string) || new Date().toISOString().slice(0, 10),
      recorded_by: user?.id ?? null,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<Expense>[] = [
    { icon: Trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Expenses"
        description="Track school expenses by category."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Expenses' }]}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        }
      />

      <EntityTable
        columns={COLUMNS}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search expenses..."
        emptyTitle="No expenses yet"
        emptyDescription="Record your first expense to track spending."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Expense"
        description="Record a new expense."
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Expense"
        description={`Are you sure you want to delete "${deleteTarget?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
