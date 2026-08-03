import { Package, AlertTriangle, TrendingUp, ClipboardList } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import { useInventory, useStockMovements } from '@/lib/module-hooks';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export function InventoryReportsPage() {
  const { data: inventory } = useInventory();
  const { data: movements } = useStockMovements();

  const items = inventory ?? [];
  const totalValue = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_cost), 0);
  const lowStockItems = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level));

  // Group by category
  const categoryMap = new Map<string, number>();
  for (const item of items) {
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

  const recentMovements = (movements ?? []).slice(0, 5);

  const stats = [
    { label: 'Total Inventory Value', value: currency.format(totalValue), icon: Package, accent: 'primary' as const },
    { label: 'Categories', value: categories.length, icon: ClipboardList, accent: 'info' as const },
    { label: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, accent: 'warning' as const },
    { label: 'Total Movements', value: (movements ?? []).length, icon: TrendingUp, accent: 'success' as const },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inventory Reports"
        description="Stock value and movement analysis."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory', href: '/inventory' }, { label: 'Reports' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Items by Category" description="Inventory distribution across categories">
          <div className="space-y-3">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No items in inventory.</p>
            )}
            {categories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{category}</span>
                <Badge variant="secondary">{count} items</Badge>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Low Stock Items" description="Items needing reorder">
          <div className="space-y-3">
            {lowStockItems.length === 0 && (
              <p className="text-sm text-muted-foreground">All items are well stocked.</p>
            )}
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} · reorder at {item.reorder_level}
                  </p>
                </div>
                <Badge variant="warning">Low</Badge>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Recent Movements" description="Latest stock in/out/adjustments">
          <div className="space-y-3">
            {recentMovements.length === 0 && (
              <p className="text-sm text-muted-foreground">No stock movements recorded.</p>
            )}
            {recentMovements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={m.type === 'in' ? 'success' : m.type === 'out' ? 'warning' : 'secondary'}>
                    {m.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{m.item?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{m.reason ?? 'No reason provided'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{m.quantity} {m.item?.unit ?? ''}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
