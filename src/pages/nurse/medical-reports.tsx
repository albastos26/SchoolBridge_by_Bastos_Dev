import { HeartPulse, BarChart3, LineChart, Stethoscope, TrendingUp, AlertTriangle } from 'lucide-react';
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

export function MedicalReportsPage() {
  const { data, isLoading } = useMedicalVisits();
  const visits = data ?? [];

  const bySeverity: Record<string, number> = {};
  for (const v of visits) {
    bySeverity[v.severity] = (bySeverity[v.severity] ?? 0) + 1;
  }

  const byMonth: Record<string, number> = {};
  for (const v of visits) {
    const month = v.visit_date?.slice(0, 7);
    if (month) byMonth[month] = (byMonth[month] ?? 0) + 1;
  }

  const byDiagnosis: Record<string, number> = {};
  for (const v of visits) {
    const d = v.diagnosis ?? 'Unknown';
    byDiagnosis[d] = (byDiagnosis[d] ?? 0) + 1;
  }
  const topDiagnoses = Object.entries(byDiagnosis).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const total = visits.length;
  const emergencies = bySeverity['emergency'] ?? 0;
  const medications = visits.filter((v) => v.medication).length;
  const serious = (bySeverity['serious'] ?? 0) + emergencies;

  const stats: StatCardData[] = [
    { label: 'Total Visits', value: total, icon: HeartPulse, accent: 'primary' },
    { label: 'Serious/Emergency', value: serious, icon: AlertTriangle, accent: 'destructive' },
    { label: 'Medications Given', value: medications, icon: TrendingUp, accent: 'info' },
    { label: 'Unique Diagnoses', value: Object.keys(byDiagnosis).length, icon: Stethoscope, accent: 'success' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Medical Reports"
        description="Health analytics: visit severity, trends, and common diagnoses."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Nurse' }, { label: 'Reports' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Visits by Severity" description="Distribution of visit severity levels">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : Object.keys(bySeverity).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(bySeverity).map(([sev, count]) => (
                <div key={sev} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={severityVariant[sev] ?? 'secondary'}>{sev}</Badge>
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

        <ChartCard title="Visits by Month" description="Monthly clinic visit trend">
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <LineChart className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Line chart placeholder</p>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4">
        <DashboardCard title="Common Diagnoses" description="Most frequently recorded diagnoses">
          {topDiagnoses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {topDiagnoses.map(([diagnosis, count], i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{diagnosis}</span>
                  </div>
                  <Badge variant="secondary">{count} visits</Badge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
