import { useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAttendance } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { StatCardData } from '@/lib/types';

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  excused: 'secondary',
};

export function StudentAttendancePage() {
  const { profile } = useAuth();
  const { data: attendance = [], isLoading } = useAttendance();

  const studentId = profile?.id ?? '';
  const records = useMemo(
    () => attendance.filter((r) => r.student_id === studentId),
    [attendance, studentId],
  );

  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const rate = records.length ? Math.round((present / records.length) * 100) : 0;

  const stats: StatCardData[] = [
    { label: 'Total Days', value: records.length, icon: CalendarCheck, accent: 'primary' },
    { label: 'Present', value: present, icon: CalendarCheck, accent: 'success' },
    { label: 'Absent', value: absent, icon: CalendarCheck, accent: 'destructive' },
    { label: 'Attendance Rate', value: `${rate}%`, icon: CalendarCheck, accent: 'info' },
  ];

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Attendance"
        description="View your attendance records."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Student Portal' }, { label: 'Attendance' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6">
        <DashboardCard title="Attendance Records" description="All your attendance entries">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No attendance records found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {r.class?.name ?? 'Class'}
                      {r.subject ? ` · ${r.subject.name}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'} className="capitalize">
                    {r.status}
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
