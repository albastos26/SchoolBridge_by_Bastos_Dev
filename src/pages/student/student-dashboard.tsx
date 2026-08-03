import { useMemo } from 'react';
import { CalendarCheck, TrendingUp, ClipboardList, BookOpen } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAttendance, useGrades, useAssessments } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { StatCardData } from '@/lib/types';

export function StudentDashboardPage() {
  const { profile } = useAuth();
  const { data: attendance = [] } = useAttendance();
  const { data: grades = [] } = useGrades();
  const { data: assessments = [] } = useAssessments();

  const studentId = profile?.id ?? '';

  const myAttendance = useMemo(
    () => attendance.filter((r) => r.student_id === studentId),
    [attendance, studentId],
  );
  const myGrades = useMemo(
    () => grades.filter((g) => g.student_id === studentId),
    [grades, studentId],
  );
  const myHomework = useMemo(
    () => assessments.filter((a) => a.type === 'assignment' || a.type === 'homework'),
    [assessments],
  );

  const present = myAttendance.filter((r) => r.status === 'present').length;
  const rate = myAttendance.length ? Math.round((present / myAttendance.length) * 100) : 0;
  const avgScore = myGrades.length
    ? Math.round(
        (myGrades.reduce((s, g) => s + (g.score / (g.assessment?.max_score || 100)) * 100, 0) /
          myGrades.length) *
          10,
      ) / 10
    : 0;

  const stats: StatCardData[] = [
    { label: 'Attendance', value: `${rate}%`, icon: CalendarCheck, accent: 'success' },
    { label: 'Avg Grade', value: `${avgScore}%`, icon: TrendingUp, accent: 'primary' },
    { label: "Today's Classes", value: 5, icon: BookOpen, accent: 'info' },
    { label: 'Pending Tasks', value: myHomework.length, icon: ClipboardList, accent: 'warning' },
  ];

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome, ${(profile.full_name ?? 'Student').split(' ')[0]}`}
        description="Your academic overview and schedule."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Student Portal' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Today's Schedule" description="Your classes for today">
          <div className="space-y-2">
            {[
              { time: '08:00', subject: 'Mathematics', room: 'R-101' },
              { time: '09:00', subject: 'English', room: 'R-204' },
              { time: '10:30', subject: 'Physics', room: 'Lab-3' },
              { time: '12:00', subject: 'History', room: 'R-112' },
              { time: '14:00', subject: 'Physical Education', room: 'Gym' },
            ].map((c) => (
              <div key={c.time} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.room}</p>
                </div>
                <Badge variant="secondary">{c.time}</Badge>
              </div>
            ))}
          </div>
        </DashboardCard>

        <ChartCard title="My Performance" description="Grade progression over time">
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Performance chart placeholder</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6">
        <DashboardCard title="Pending Assignments" description="Upcoming homework and assignments">
          <div className="space-y-2">
            {myHomework.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.subject?.name ?? 'Subject'}
                    {a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <Badge variant={a.status === 'published' ? 'success' : 'secondary'} className="capitalize">
                  {a.status}
                </Badge>
              </div>
            ))}
            {myHomework.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending assignments.</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
