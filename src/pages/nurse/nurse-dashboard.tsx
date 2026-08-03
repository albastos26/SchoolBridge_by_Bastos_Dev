import { HeartPulse, Activity, Pill, Users, BarChart3 } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import { useMedicalVisits } from '@/lib/module-hooks';
import type { StatCardData } from '@/lib/types';

const severityVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  minor: 'success',
  moderate: 'secondary',
  serious: 'warning',
  emergency: 'destructive',
};

export function NurseDashboardPage() {
  const { data, isLoading } = useMedicalVisits();
  const visits = data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const visitsToday = visits.filter((v) => v.visit_date?.slice(0, 10) === today).length;
  const activeCases = visits.filter((v) => v.severity === 'serious' || v.severity === 'emergency').length;
  const medicationsGiven = visits.filter((v) => v.medication).length;

  const stats: StatCardData[] = [
    { label: 'Visits Today', value: visitsToday, icon: HeartPulse, accent: 'primary' },
    { label: 'Active Cases', value: activeCases, icon: Activity, accent: 'warning' },
    { label: 'Medications Given', value: medicationsGiven, icon: Pill, accent: 'info' },
    { label: 'Students Tracked', value: '1,248', icon: Users, accent: 'success' },
  ];

  const recent = visits.slice(0, 6);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nurse Dashboard"
        description="Monitor student health visits, medications, and active cases."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Nurse' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Visits" description="Latest student clinic visits">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((v) => (
                <div key={v.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <HeartPulse className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{v.student?.full_name ?? 'Unknown'}</p>
                      <Badge variant={severityVariant[v.severity] ?? 'secondary'}>{v.severity}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {v.diagnosis ?? 'No diagnosis recorded'}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.visit_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <ChartCard title="Visits This Week" description="Daily clinic visit counts">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Bar chart placeholder</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
