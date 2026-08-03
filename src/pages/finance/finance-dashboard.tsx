import { CreditCard, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useInvoices, usePayments } from '@/lib/module-hooks';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export function FinanceDashboardPage() {
  const { data: invoices } = useInvoices();
  const { data: payments } = usePayments();

  const paidInvoices = (invoices ?? []).filter((i) => i.status === 'paid').length;
  const pendingInvoices = (invoices ?? []).filter((i) => i.status === 'unpaid' || i.status === 'partial').length;
  const outstanding = (invoices ?? [])
    .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);
  const monthlyRevenue = (payments ?? [])
    .filter((p) => new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const stats = [
    { label: 'Monthly Revenue', value: currency.format(monthlyRevenue), change: 8, changeLabel: 'vs last month', icon: CreditCard, accent: 'success' as const },
    { label: 'Outstanding Fees', value: currency.format(outstanding), change: -15, changeLabel: 'vs last month', icon: ClipboardList, accent: 'warning' as const },
    { label: 'Paid Invoices', value: paidInvoices, change: 12, changeLabel: 'this month', icon: CheckCircle, accent: 'primary' as const },
    { label: 'Pending Invoices', value: pendingInvoices, icon: Clock, accent: 'info' as const },
  ];

  const recentPayments = (payments ?? []).slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Finance Dashboard"
        description="Track revenue, invoices, and expenses."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Payments" description="Latest recorded payments">
          <div className="space-y-3">
            {recentPayments.length === 0 && (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{p.receipt_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.student?.full_name ?? '—'} · {p.invoice?.invoice_number ?? '—'}
                  </p>
                </div>
                <span className="text-sm font-semibold">{currency.format(Number(p.amount))}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <ChartCard title="Revenue vs Expenses" description="Monthly comparison">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Revenue vs Expenses chart</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
