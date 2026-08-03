import {
  Gavel,
  CheckCircle,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import { useDisciplineRecords } from '@/lib/module-hooks';
import type { StatCardData } from '@/lib/types';

const typeBadge = (type: string) => {
  const map: Record<string, 'warning' | 'secondary' | 'destructive'> = {
    warning: 'warning',
    minor: 'secondary',
    major: 'destructive',
    suspension: 'destructive',
    expulsion: 'destructive',
  };
  return <Badge variant={map[type] ?? 'secondary'}>{type}</Badge>;
};

export function DisciplineDashboardPage() {
  const { data, isLoading } = useDisciplineRecords();
  const records = data ?? [];

  const openCases = records.filter((r) => r.status === 'open').length;
  const resolvedThisWeek = records.filter((r) => r.status === 'resolved').length;
  const total = records.length;

  const stats: StatCardData[] = [
    { label: 'Open Cases', value: openCases, icon: Gavel, accent: 'warning' },
    { label: 'Resolved This Week', value: resolvedThisWeek, change: 20, changeLabel: 'vs last week', icon: CheckCircle, accent: 'success' },
    { label: 'Total Incidents', value: total, icon: ClipboardList, accent: 'info' },
    { label: 'Attendance Rate', value: '94.2%', change: 1.4, changeLabel: 'this week', icon: CalendarCheck, accent: 'primary' },
  ];

  const recent = records.slice(0, 6);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Discipline Dashboard"
        description="Monitor incidents, track cases, and oversee student behavior."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Discipline' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Incidents" description="Latest discipline records across the school">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.student?.full_name ?? 'Unknown'}</p>
                      {typeBadge(r.type)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                    <p className="text-xs text-muted-foreground">{r.incident_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <ChartCard title="Discipline by Type" description="Distribution of incidents by category">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Bar chart placeholder</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
