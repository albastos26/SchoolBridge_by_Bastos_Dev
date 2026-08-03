import { useState, useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useParentLinks } from '@/lib/academic-hooks';
import { useAttendance } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { AttendanceRecord } from '@/lib/module-types';

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  excused: 'secondary',
};

export function ParentAttendancePage() {
  const { profile } = useAuth();
  const { data: links = [] } = useParentLinks();
  const { data: attendance = [], isLoading } = useAttendance();

  const myLinks = useMemo(
    () => links.filter((l) => l.parent_id === profile?.id),
    [links, profile?.id],
  );
  const [selected, setSelected] = useState<string>(myLinks[0]?.student_id ?? '');
  const childId = selected || myLinks[0]?.student_id || '';
  const child = myLinks.find((l) => l.student_id === childId)?.student;

  const records = useMemo(
    () => attendance.filter((r) => r.student_id === childId),
    [attendance, childId],
  );

  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const rate = records.length ? Math.round((present / records.length) * 100) : 0;

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance"
        description="View your child's attendance records."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Parent Portal' }, { label: 'Attendance' }]}
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

      <DashboardCard title="Attendance Summary" description={child?.full_name ?? 'Select a child'}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{late}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{rate}%</p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>
      </DashboardCard>

      <div className="mt-6">
        <DashboardCard title="Recent Attendance" description="Latest attendance records">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No attendance records found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 20).map((r: AttendanceRecord) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {r.class?.name ?? 'Class'} {r.subject ? `· ${r.subject.name}` : ''}
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
