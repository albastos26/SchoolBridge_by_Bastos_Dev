import { useState } from 'react';
import { AlertTriangle, ShieldAlert, Ban, User } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDisciplineRecords } from '@/lib/module-hooks';
import { useStudents } from '@/lib/academic-hooks';

const typeVariant: Record<string, 'warning' | 'secondary' | 'destructive'> = {
  warning: 'warning',
  minor: 'secondary',
  major: 'destructive',
  suspension: 'destructive',
  expulsion: 'destructive',
};

export function BehaviorHistoryPage() {
  const { data: students } = useStudents();
  const [studentId, setStudentId] = useState<string>('');
  const { data, isLoading } = useDisciplineRecords(studentId ? { studentId } : undefined);
  const records = data ?? [];

  const selectedStudent = (students ?? []).find((s) => s.id === studentId);

  const total = records.length;
  const warnings = records.filter((r) => r.type === 'warning').length;
  const majors = records.filter((r) => r.type === 'major').length;
  const suspensions = records.filter((r) => r.type === 'suspension').length;

  const summary = [
    { label: 'Total Incidents', value: total, icon: ClipboardListIcon, accent: 'bg-primary/10 text-primary' },
    { label: 'Warnings', value: warnings, icon: AlertTriangle, accent: 'bg-warning/10 text-warning' },
    { label: 'Major Incidents', value: majors, icon: ShieldAlert, accent: 'bg-destructive/10 text-destructive' },
    { label: 'Suspensions', value: suspensions, icon: Ban, accent: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Behavior History"
        description="View a student's full discipline history and incident timeline."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Discipline' }, { label: 'Behavior History' }]}
      />

      <div className="mb-4 max-w-xs">
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {(students ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name ?? s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!studentId ? (
        <DashboardCard title="Select a Student" description="Choose a student above to view their discipline history">
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <User className="mr-2 h-5 w-5" />
            <span className="text-sm">No student selected</span>
          </div>
        </DashboardCard>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DashboardCard
            title={selectedStudent ? `${selectedStudent.full_name ?? selectedStudent.email} — Incident Timeline` : 'Incident Timeline'}
            description="Chronological history of discipline incidents"
          >
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No discipline records for this student.</p>
            ) : (
              <div className="relative space-y-4 pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                {records.map((r) => (
                  <div key={r.id} className="relative">
                    <div className="absolute -left-5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={typeVariant[r.type] ?? 'secondary'}>{r.type}</Badge>
                          <Badge variant={r.status === 'resolved' ? 'success' : 'warning'}>{r.status}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.incident_date}</span>
                      </div>
                      <p className="mt-2 text-sm">{r.description}</p>
                      {r.action_taken && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">Action:</span> {r.action_taken}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
}

function ClipboardListIcon({ className }: { className?: string }) {
  return <AlertTriangle className={className} />;
}
