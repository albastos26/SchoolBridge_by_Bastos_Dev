import { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useGrades, useRemarks } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { Grade } from '@/lib/module-types';

export function StudentTranscriptPage() {
  const { profile } = useAuth();
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const { data: remarks = [], isLoading: remarksLoading } = useRemarks();

  const studentId = profile?.id ?? '';
  const myGrades = useMemo(
    () => grades.filter((g) => g.student_id === studentId),
    [grades, studentId],
  );
  const myRemarks = useMemo(
    () => remarks.filter((r) => r.student_id === studentId),
    [remarks, studentId],
  );

  const bySubject = useMemo(() => {
    const map = new Map<string, { name: string; grades: Grade[] }>();
    for (const g of myGrades) {
      const name = g.assessment?.subject?.name ?? 'Unknown';
      if (!map.has(name)) map.set(name, { name, grades: [] });
      map.get(name)!.grades.push(g);
    }
    return Array.from(map.values());
  }, [myGrades]);

  const overallAvg = myGrades.length
    ? Math.round(
        (myGrades.reduce((s, g) => s + (g.score / (g.assessment?.max_score || 100)) * 100, 0) /
          myGrades.length) *
          10,
      ) / 10
    : 0;

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transcript"
        description="Official academic transcript."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Student Portal' }, { label: 'Transcript' }]}
      />

      <DashboardCard title="Academic Transcript" description="Official record of academic performance">
        <div className="rounded-lg border p-6">
          {/* Student Info */}
          <div className="mb-6 flex items-center gap-4 border-b pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{profile.full_name ?? 'Student'}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">ID: {profile.id}</p>
            </div>
          </div>

          {/* Grades by Subject */}
          {gradesLoading ? (
            <p className="text-sm text-muted-foreground">Loading grades...</p>
          ) : bySubject.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2">Subject</th>
                  <th className="pb-2 text-center">Assessments</th>
                  <th className="pb-2 text-right">Average</th>
                </tr>
              </thead>
              <tbody>
                {bySubject.map((s) => {
                  const avg =
                    s.grades.reduce(
                      (sum, g) => sum + (g.score / (g.assessment?.max_score || 100)) * 100,
                      0,
                    ) / s.grades.length;
                  return (
                    <tr key={s.name} className="border-b">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3 text-center text-muted-foreground">{s.grades.length}</td>
                      <td className="py-3 text-right">
                        <Badge variant={avg >= 80 ? 'success' : avg >= 60 ? 'warning' : 'destructive'}>
                          {Math.round(avg)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="pt-3">Overall Average</td>
                  <td className="pt-3 text-center">{myGrades.length}</td>
                  <td className="pt-3 text-right">
                    <Badge variant={overallAvg >= 80 ? 'success' : overallAvg >= 60 ? 'warning' : 'destructive'}>
                      {overallAvg}%
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* Remarks */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">Teacher Remarks</h3>
            {remarksLoading ? (
              <p className="text-sm text-muted-foreground">Loading remarks...</p>
            ) : myRemarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No remarks recorded.</p>
            ) : (
              <div className="space-y-2">
                {myRemarks.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">{r.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.teacher?.full_name ?? 'Teacher'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{r.remark}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
