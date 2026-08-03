import { useState, useMemo } from 'react';
import { Save, ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssessments, useGrades, useBulkUpsertGrades } from '@/lib/module-hooks';
import { useEnrollments } from '@/lib/academic-hooks';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function ManageGradesPage() {
  const { profile } = useAuth();
  const { data: assessments, isLoading: assessmentsLoading } = useAssessments(profile ? { teacherId: profile.id } : undefined);
  const { data: enrollments } = useEnrollments(undefined, undefined);
  const { data: existingGrades, isLoading: gradesLoading } = useGrades(undefined);
  const bulkUpsert = useBulkUpsertGrades();
  const { toast } = useToast();

  const [assessmentId, setAssessmentId] = useState<string>('');
  const [scores, setScores] = useState<Record<string, string>>({});

  const assessment = useMemo(() => (assessments ?? []).find((a) => a.id === assessmentId), [assessments, assessmentId]);
  const maxScore = assessment?.max_score ?? 100;
  const classId = assessment?.class_id;

  const students = useMemo(() => (enrollments ?? []).filter((e) => e.class_id === classId && e.status === 'active'), [enrollments, classId]);

  const gradeMap = useMemo(() => {
    const m: Record<string, number> = {};
    (existingGrades ?? []).forEach((g) => { if (g.assessment_id === assessmentId) m[g.student_id] = g.score; });
    return m;
  }, [existingGrades, assessmentId]);

  const handleSave = async () => {
    if (!profile) return;
    if (!assessmentId) { toast({ title: 'Select an assessment', variant: 'destructive' }); return; }
    if (students.length === 0) { toast({ title: 'No students enrolled', variant: 'destructive' }); return; }
    const records = students.map((s) => {
      const raw = scores[s.student_id] ?? (gradeMap[s.student_id] != null ? String(gradeMap[s.student_id]) : '');
      const score = raw === '' ? 0 : Math.min(Math.max(Number(raw), 0), maxScore);
      return { assessment_id: assessmentId, student_id: s.student_id, score, graded_by: profile.id };
    });
    await bulkUpsert.mutateAsync(records);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manage Grades"
        description="Enter scores for an assessment."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher' }, { label: 'Manage Grades' }]}
      />

      <div className="mb-4 space-y-2">
        <Label>Assessment</Label>
        <Select value={assessmentId} onValueChange={setAssessmentId} disabled={assessmentsLoading}>
          <SelectTrigger><SelectValue placeholder="Select an assessment" /></SelectTrigger>
          <SelectContent>
            {(assessments ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.title} · {a.class?.name ?? '—'} (/{a.max_score})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!assessmentId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Select an assessment to enter grades</p>
        </div>
      ) : gradesLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading grades…</div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No students enrolled in this class</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Score (/{maxScore})</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">{s.student?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={0}
                        max={maxScore}
                        className="w-28"
                        placeholder={gradeMap[s.student_id] != null ? String(gradeMap[s.student_id]) : '0'}
                        value={scores[s.student_id] ?? ''}
                        onChange={(e) => setScores((prev) => ({ ...prev, [s.student_id]: e.target.value }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} disabled={bulkUpsert.isPending}>
              <Save className="mr-2 h-4 w-4" />Save Grades
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
