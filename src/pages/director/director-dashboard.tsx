import {
  GraduationCap,
  Users,
  CreditCard,
  Gavel,
  TrendingUp,
  CalendarCheck,
  Package,
  HeartPulse,
  BookOpen,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAuditLogs, useAnnouncements } from '@/lib/module-hooks';
import { RoleBadge } from '@/components/auth/role-badge';
import { Badge } from '@/components/ui/badge';
import type { StatCardData } from '@/lib/types';

const STATS: StatCardData[] = [
  { label: 'Total Students', value: '1,248', change: 12, changeLabel: 'vs last term', icon: GraduationCap, accent: 'primary' },
  { label: 'Total Staff', value: '86', change: 3, changeLabel: 'vs last term', icon: Users, accent: 'info' },
  { label: 'Monthly Revenue', value: '$48.2k', change: 8, changeLabel: 'vs last month', icon: CreditCard, accent: 'success' },
  { label: 'Active Issues', value: '4', change: -50, changeLabel: 'since last week', icon: Gavel, accent: 'warning' },
];

interface ChartPlaceholder {
  title: string;
  description: string;
  icon: typeof TrendingUp;
}

const CHARTS: ChartPlaceholder[] = [
  { title: 'Enrollment Trend', description: 'Student enrollment over time', icon: TrendingUp },
  { title: 'Attendance Rate', description: 'School-wide attendance', icon: CalendarCheck },
  { title: 'Academic Performance', description: 'Average grades by term', icon: BookOpen },
  { title: 'Finance Summary', description: 'Revenue vs expenses', icon: CreditCard },
  { title: 'Inventory Status', description: 'Stock levels overview', icon: Package },
  { title: 'Discipline Summary', description: 'Incidents and resolutions', icon: Gavel },
  { title: 'Medical Summary', description: 'Clinic visits and health alerts', icon: HeartPulse },
];

export function DirectorDashboardPage() {
  const { profile } = useAuth();
  const { data: auditLogs = [], isLoading: auditLoading } = useAuditLogs();
  const { data: announcements = [], isLoading: annLoading } = useAnnouncements();

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Director Overview"
        description="School-wide operations dashboard."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Director Overview' }]}
        action={<RoleBadge role={profile.role} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CHARTS.map((c) => {
          const Icon = c.icon;
          return (
            <ChartCard key={c.title} title={c.title} description={c.description}>
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Chart placeholder</p>
                </div>
              </div>
            </ChartCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Audit Logs" description="Latest system activity">
          {auditLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No audit logs recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {log.action}
                      {log.entity_type && (
                        <span className="text-muted-foreground"> · {log.entity_type}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {log.user?.full_name ?? log.user?.email ?? 'System'} ·{' '}
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Announcements" description="Latest school-wide notices">
          {annLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No announcements published.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.published_at).toLocaleDateString()} · {a.audience}
                    </p>
                  </div>
                  <Badge
                    variant={
                      a.priority === 'urgent'
                        ? 'destructive'
                        : a.priority === 'high'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="capitalize"
                  >
                    {a.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
