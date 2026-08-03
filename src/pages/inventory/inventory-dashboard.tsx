import { Package, AlertTriangle, ClipboardList, ShoppingCart } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/lib/module-hooks';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export function InventoryDashboardPage() {
  const { data: inventory } = useInventory();

  const items = inventory ?? [];
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level));
  const lowStockCount = lowStockItems.length;

  const stats = [
    { label: 'Total Items', value: totalItems, icon: Package, accent: 'primary' as const },
    { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, accent: 'warning' as const },
    { label: 'Items Issued', value: 67, change: 8, changeLabel: 'this week', icon: ClipboardList, accent: 'info' as const },
    { label: 'Pending Orders', value: 5, icon: ShoppingCart, accent: 'destructive' as const },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inventory Dashboard"
        description="Monitor stock levels and movements."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Low Stock Alerts" description="Items at or below reorder level">
          <div className="space-y-3">
            {lowStockItems.length === 0 && (
              <p className="text-sm text-muted-foreground">All items are well stocked.</p>
            )}
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} left · reorder at {item.reorder_level}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">Low Stock</Badge>
              </div>
            ))}
          </div>
        </DashboardCard>

        <ChartCard title="Stock by Category" description="Inventory distribution">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Stock by category chart</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
