import { useState, useMemo } from 'react';
import { CalendarCheck, TrendingUp, Bell, CreditCard, GraduationCap, Users } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useParentLinks } from '@/lib/academic-hooks';
import { useAttendance, useGrades, useAnnouncements, useInvoices } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { StatCardData } from '@/lib/types';

export function ParentDashboardPage() {
  const { profile } = useAuth();
  const { data: links = [] } = useParentLinks();
  const { data: attendance = [] } = useAttendance();
  const { data: grades = [] } = useGrades();
  const { data: announcements = [] } = useAnnouncements();
  const { data: invoices = [] } = useInvoices();

  const myLinks = useMemo(
    () => links.filter((l) => l.parent_id === profile?.id),
    [links, profile?.id],
  );
  const [selected, setSelected] = useState<string>(myLinks[0]?.student_id ?? '');
  const childId = selected || myLinks[0]?.student_id || '';
  const child = myLinks.find((l) => l.student_id === childId)?.student;

  const childAttendance = useMemo(
    () => attendance.filter((r) => r.student_id === childId),
    [attendance, childId],
  );
  const childGrades = useMemo(
    () => grades.filter((g) => g.student_id === childId),
    [grades, childId],
  );
  const childInvoices = useMemo(
    () => invoices.filter((i) => i.student_id === childId),
    [invoices, childId],
  );
  const parentAnnouncements = useMemo(
    () => announcements.filter((a) => a.audience === 'all' || a.audience === 'parents'),
    [announcements],
  );

  const present = childAttendance.filter((r) => r.status === 'present').length;
  const rate = childAttendance.length ? Math.round((present / childAttendance.length) * 100) : 0;
  const avgScore = childGrades.length
    ? Math.round(
        (childGrades.reduce((s, g) => s + (g.score / (g.assessment?.max_score || 100)) * 100, 0) /
          childGrades.length) *
          10,
      ) / 10
    : 0;
  const outstanding = childInvoices.reduce((s, i) => s + (i.amount - i.paid_amount), 0);

  const stats: StatCardData[] = [
    { label: 'Attendance', value: `${rate}%`, icon: CalendarCheck, accent: 'success' },
    { label: 'Avg Grade', value: `${avgScore}%`, icon: TrendingUp, accent: 'info' },
    { label: 'Unread Notices', value: parentAnnouncements.length, icon: Bell, accent: 'warning' },
    {
      label: 'Fee Status',
      value: outstanding > 0 ? 'Owing' : 'Clear',
      icon: CreditCard,
      accent: outstanding > 0 ? 'destructive' : 'success',
    },
  ];

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Parent Portal"
        description="Monitor your child's academic progress and school communications."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Parent Portal' }]}
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
        <DashboardCard
          title="Child Overview"
          description={child?.full_name ?? 'Select a child'}
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Attendance Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2">
                  <p className="text-lg font-bold text-emerald-600">{present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-lg font-bold text-red-600">
                    {childAttendance.filter((r) => r.status === 'absent').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="rounded-lg border p-2">
                  <p className="text-lg font-bold text-amber-600">
                    {childAttendance.filter((r) => r.status === 'late').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Recent Grades</p>
              <div className="space-y-2">
                {childGrades.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span>{g.assessment?.title ?? 'Assessment'}</span>
                    <Badge variant="secondary">
                      {g.score}/{g.assessment?.max_score ?? 100}
                    </Badge>
                  </div>
                ))}
                {childGrades.length === 0 && (
                  <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>

        <ChartCard title="Performance Trend" description="Grade progression over time">
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Performance chart placeholder</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6">
        <DashboardCard title="Recent Announcements" description="School notices for parents">
          <div className="space-y-2">
            {parentAnnouncements.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.published_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={a.priority === 'urgent' ? 'destructive' : a.priority === 'high' ? 'warning' : 'secondary'}
                >
                  {a.priority}
                </Badge>
              </div>
            ))}
            {parentAnnouncements.length === 0 && (
              <p className="text-sm text-muted-foreground">No announcements.</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
