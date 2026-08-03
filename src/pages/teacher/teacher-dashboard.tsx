import { School, GraduationCap, ClipboardList, CalendarCheck } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAssessments } from '@/lib/module-hooks';
import { useTeacherAssignments } from '@/lib/academic-hooks';
import type { StatCardData } from '@/lib/types';

const STATS: StatCardData[] = [
  { label: 'My Classes', value: '6', icon: School, accent: 'primary' },
  { label: 'My Students', value: '184', icon: GraduationCap, accent: 'info' },
  { label: 'Pending Grades', value: '23', icon: ClipboardList, accent: 'warning' },
  { label: "Today's Classes", value: '4', icon: CalendarCheck, accent: 'success' },
];

const TODAY_SCHEDULE = [
  { period: 'Period 1', time: '08:00 – 08:45', class: 'Grade 8-A', subject: 'Mathematics', room: 'Rm 12' },
  { period: 'Period 3', time: '10:00 – 10:45', class: 'Grade 10-B', subject: 'Mathematics', room: 'Rm 14' },
  { period: 'Period 5', time: '12:00 – 12:45', class: 'Grade 9-A', subject: 'Algebra', room: 'Rm 11' },
  { period: 'Period 7', time: '14:00 – 14:45', class: 'Grade 11-C', subject: 'Calculus', room: 'Rm 18' },
];

const RECENT_ACTIVITY = [
  { text: 'Attendance submitted for Grade 8-A', time: '30m ago' },
  { text: 'Grades entered for Math quiz (Grade 10-B)', time: '2h ago' },
  { text: 'Assignment posted: Algebra worksheet', time: '4h ago' },
  { text: 'Parent query received from Mrs. Smith', time: '6h ago' },
  { text: 'Mid-term exam schedule reviewed', time: '1d ago' },
];

export function TeacherDashboardPage() {
  const { profile } = useAuth();
  const { data: assessments } = useAssessments(profile ? { teacherId: profile.id } : undefined);
  const { data: assignments } = useTeacherAssignments();

  const pendingGrades = (assessments ?? []).filter((a) => a.status === 'published').length;
  const myClasses = new Set((assignments ?? []).map((a) => a.class_id)).size;

  const stats: StatCardData[] = [
    STATS[0],
    { ...STATS[1] },
    { ...STATS[2], value: String(pendingGrades) },
    { ...STATS[3] },
  ];
  if (myClasses) stats[0] = { ...stats[0], value: String(myClasses) };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Teacher Dashboard"
        description="Your classes, students, and tasks at a glance."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher Dashboard' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Today's Schedule" description="Your classes for today">
          <div className="space-y-2">
            {TODAY_SCHEDULE.map((item) => (
              <div key={item.period} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.class} · {item.subject}</p>
                  <p className="text-xs text-muted-foreground">{item.period} · {item.time} · {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <ChartCard title="Recent Activity" description="Latest events relevant to you">
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{item.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
