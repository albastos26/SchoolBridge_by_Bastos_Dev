import { useState, useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useParentLinks } from '@/lib/academic-hooks';
import { useInvoices, usePayments } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { StatCardData } from '@/lib/types';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'secondary',
  overdue: 'destructive',
  cancelled: 'secondary',
};

export function ParentFeesPage() {
  const { profile } = useAuth();
  const { data: links = [] } = useParentLinks();
  const { data: invoices = [], isLoading: invLoading } = useInvoices();
  const { data: payments = [], isLoading: payLoading } = usePayments();

  const myLinks = useMemo(
    () => links.filter((l) => l.parent_id === profile?.id),
    [links, profile?.id],
  );
  const [selected, setSelected] = useState<string>(myLinks[0]?.student_id ?? '');
  const childId = selected || myLinks[0]?.student_id || '';
  const child = myLinks.find((l) => l.student_id === childId)?.student;

  const childInvoices = useMemo(
    () => invoices.filter((i) => i.student_id === childId),
    [invoices, childId],
  );
  const childPayments = useMemo(
    () => payments.filter((p) => p.student_id === childId),
    [payments, childId],
  );

  const totalBilled = childInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = childInvoices.reduce((s, i) => s + i.paid_amount, 0);
  const outstanding = totalBilled - totalPaid;

  const stats: StatCardData[] = [
    { label: 'Total Billed', value: `$${totalBilled.toLocaleString()}`, icon: CreditCard, accent: 'info' },
    { label: 'Total Paid', value: `$${totalPaid.toLocaleString()}`, icon: CreditCard, accent: 'success' },
    {
      label: 'Outstanding',
      value: `$${outstanding.toLocaleString()}`,
      icon: CreditCard,
      accent: outstanding > 0 ? 'destructive' : 'success',
    },
    { label: 'Invoices', value: childInvoices.length, icon: CreditCard, accent: 'primary' },
  ];

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fee Status"
        description="View invoices and payments for your child."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Parent Portal' }, { label: 'Fees' }]}
      />

      {myLinks.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Child:</span>
          {myLinks.map((l) => (
            <button
              key={l.student_id}
              onClick={() => setSelected(l.student_id)}
              className={`rounded-md border px-3 py-1 text-sm transition ${
                childId === l.student_id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:bg-accent'
              }`}
            >
              {l.student?.full_name ?? 'Unknown'}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Invoices" description={child?.full_name ?? 'Select a child'}>
          {invLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : childInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="space-y-2">
              {childInvoices.map((inv) => (
                <div key={inv.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{inv.invoice_number}</span>
                    <Badge variant={STATUS_VARIANT[inv.status] ?? 'secondary'} className="capitalize">
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>${inv.amount.toLocaleString()}</span>
                    <span>Paid: ${inv.paid_amount.toLocaleString()}</span>
                  </div>
                  {inv.due_date && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due: {new Date(inv.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Payments" description="Latest payment records">
          {payLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : childPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments found.</p>
          ) : (
            <div className="space-y-2">
              {childPayments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.receipt_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.payment_date).toLocaleDateString()} · {p.payment_method}
                    </p>
                  </div>
                  <span className="font-medium">${p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
