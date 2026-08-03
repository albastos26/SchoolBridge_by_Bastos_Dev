import { BarChart3, LineChart, Trophy, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import { useDisciplineRecords } from '@/lib/module-hooks';
import type { StatCardData } from '@/lib/types';

export function DisciplineReportsPage() {
  const { data, isLoading } = useDisciplineRecords();
  const records = data ?? [];

  const byType: Record<string, number> = {};
  for (const r of records) {
    byType[r.type] = (byType[r.type] ?? 0) + 1;
  }

  const byMonth: Record<string, number> = {};
  for (const r of records) {
    const month = r.incident_date?.slice(0, 7);
    if (month) byMonth[month] = (byMonth[month] ?? 0) + 1;
  }

  const byStudent: Record<string, { name: string; count: number }> = {};
  for (const r of records) {
    const name = r.student?.full_name ?? 'Unknown';
    if (!byStudent[r.student_id]) byStudent[r.student_id] = { name, count: 0 };
    byStudent[r.student_id].count += 1;
  }
  const topStudents = Object.values(byStudent).sort((a, b) => b.count - a.count).slice(0, 5);

  const total = records.length;
  const open = records.filter((r) => r.status === 'open').length;
  const resolved = records.filter((r) => r.status === 'resolved').length;
  const escalated = records.filter((r) => r.status === 'escalated').length;

  const stats: StatCardData[] = [
    { label: 'Total Incidents', value: total, icon: ClipboardList, accent: 'primary' },
    { label: 'Open Cases', value: open, icon: AlertTriangle, accent: 'warning' },
    { label: 'Resolved', value: resolved, icon: TrendingUp, accent: 'success' },
    { label: 'Escalated', value: escalated, icon: AlertTriangle, accent: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Discipline Reports"
        description="Analytics and trends across student discipline incidents."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Discipline' }, { label: 'Reports' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Incidents by Type" description="Breakdown by incident category">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : Object.keys(byType).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{type}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Incidents by Month" description="Trend over time">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <LineChart className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Line chart placeholder</p>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Top Students with Incidents" description="Students with the most discipline records">
          {topStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <Badge variant="destructive">{s.count} incidents</Badge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <ChartCard title="Monthly Breakdown" description="Incident counts per month">
          {Object.keys(byMonth).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="space-y-2 pt-2">
              {Object.entries(byMonth).sort().map(([month, count]) => (
                <div key={month} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{month}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
