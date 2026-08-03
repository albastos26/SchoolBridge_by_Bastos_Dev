import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useInvoices, usePayments, useExpenses } from '@/lib/module-hooks';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export function FinanceReportsPage() {
  const { data: invoices } = useInvoices();
  const { data: payments } = usePayments();
  const { data: expenses } = useExpenses();

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const outstanding = (invoices ?? []).reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);

  const stats = [
    { label: 'Total Revenue', value: currency.format(totalRevenue), icon: TrendingUp, accent: 'success' as const },
    { label: 'Total Expenses', value: currency.format(totalExpenses), icon: TrendingDown, accent: 'destructive' as const },
    { label: 'Net Profit', value: currency.format(netProfit), icon: Wallet, accent: 'primary' as const },
    { label: 'Outstanding Balances', value: currency.format(outstanding), icon: AlertCircle, accent: 'warning' as const },
  ];

  const recentPayments = (payments ?? []).slice(0, 5);
  const recentExpenses = (expenses ?? []).slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Finance Reports"
        description="Financial overview and analysis."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Reports' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" description="Monthly revenue over time">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <TrendingUp className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Revenue trend chart</p>
          </div>
        </ChartCard>

        <ChartCard title="Expense Breakdown" description="Spending by category">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <TrendingDown className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Expense breakdown chart</p>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Payments" description="Latest incoming payments">
          <div className="space-y-3">
            {recentPayments.length === 0 && (
              <p className="text-sm text-muted-foreground">No payments recorded.</p>
            )}
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{p.receipt_number}</p>
                  <p className="text-xs text-muted-foreground">{p.student?.full_name ?? '—'}</p>
                </div>
                <span className="text-sm font-semibold text-success">{currency.format(Number(p.amount))}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Expenses" description="Latest recorded expenses">
          <div className="space-y-3">
            {recentExpenses.length === 0 && (
              <p className="text-sm text-muted-foreground">No expenses recorded.</p>
            )}
            {recentExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{e.category}</p>
                </div>
                <span className="text-sm font-semibold text-destructive">{currency.format(Number(e.amount))}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
