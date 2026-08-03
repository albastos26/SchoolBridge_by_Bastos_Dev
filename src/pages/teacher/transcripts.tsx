import { useState, useMemo } from 'react';
import { GraduationCap, Printer, FileText } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGrades, useRemarks } from '@/lib/module-hooks';
import { useStudents } from '@/lib/academic-hooks';

export function TranscriptsPage() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: allGrades, isLoading: gradesLoading } = useGrades();
  const { data: remarks, isLoading: remarksLoading } = useRemarks(undefined);

  const [studentId, setStudentId] = useState<string>('');

  const student = useMemo(() => (students ?? []).find((s) => s.id === studentId), [students, studentId]);

  const studentGrades = useMemo(() => {
    return (allGrades ?? []).filter((g) => g.student_id === studentId);
  }, [allGrades, studentId]);

  const bySubject = useMemo(() => {
    const map: Record<string, { subject: string; grades: { title: string; score: number; max: number }[] }> = {};
    studentGrades.forEach((g) => {
      const subj = g.assessment?.subject?.name ?? 'Unknown';
      if (!map[subj]) map[subj] = { subject: subj, grades: [] };
      map[subj].grades.push({ title: g.assessment?.title ?? '—', score: g.score, max: g.assessment?.max_score ?? 100 });
    });
    return Object.values(map);
  }, [studentGrades]);

  const studentRemarks = useMemo(() => (remarks ?? []).filter((r) => r.student_id === studentId), [remarks, studentId]);
  const overallAvg = useMemo(() => {
    if (studentGrades.length === 0) return 0;
    const pct = studentGrades.map((g) => (g.score / (g.assessment?.max_score ?? 100)) * 100);
    return pct.reduce((a, b) => a + b, 0) / pct.length;
  }, [studentGrades]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Student Transcripts"
        description="View and print a student's academic transcript."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher' }, { label: 'Transcripts' }]}
      />

      <div className="mb-4 flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Select value={studentId} onValueChange={setStudentId} disabled={studentsLoading}>
            <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
            <SelectContent>
              {(students ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.full_name ?? s.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {studentId && (
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
        )}
      </div>

      {!studentId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Select a student to view transcript</p>
        </div>
      ) : gradesLoading || remarksLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading transcript…</div>
      ) : (
        <DashboardCard title="Academic Transcript" description={student?.full_name ?? 'Student'}>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-x-8 gap-y-2 border-b pb-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{student?.full_name ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{student?.email ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Overall Average:</span> <span className="font-bold text-primary">{overallAvg.toFixed(1)}%</span></div>
            </div>

            {bySubject.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No grades recorded</p>
              </div>
            ) : (
              bySubject.map((subj) => {
                const avg = subj.grades.length ? (subj.grades.reduce((a, g) => a + (g.score / g.max) * 100, 0) / subj.grades.length) : 0;
                return (
                  <div key={subj.subject} className="rounded-lg border">
                    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
                      <p className="text-sm font-semibold">{subj.subject}</p>
                      <p className="text-sm font-medium text-primary">{avg.toFixed(1)}%</p>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {subj.grades.map((g, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-2">{g.title}</td>
                            <td className="px-4 py-2 text-right">{g.score} / {g.max}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{((g.score / g.max) * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}

            {studentRemarks.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Remarks</p>
                <div className="space-y-2">
                  {studentRemarks.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3 text-sm">
                      <p>{r.remark}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.category} · {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
