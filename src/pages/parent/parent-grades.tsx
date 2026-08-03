import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useParentLinks } from '@/lib/academic-hooks';
import { useGrades } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';
import type { Grade } from '@/lib/module-types';

export function ParentGradesPage() {
  const { profile } = useAuth();
  const { data: links = [] } = useParentLinks();
  const { data: grades = [], isLoading } = useGrades();

  const myLinks = useMemo(
    () => links.filter((l) => l.parent_id === profile?.id),
    [links, profile?.id],
  );
  const [selected, setSelected] = useState<string>(myLinks[0]?.student_id ?? '');
  const childId = selected || myLinks[0]?.student_id || '';
  const child = myLinks.find((l) => l.student_id === childId)?.student;

  const childGrades = useMemo(
    () => grades.filter((g) => g.student_id === childId),
    [grades, childId],
  );

  const bySubject = useMemo(() => {
    const map = new Map<string, { name: string; grades: Grade[] }>();
    for (const g of childGrades) {
      const name = g.assessment?.subject?.name ?? 'Unknown';
      if (!map.has(name)) map.set(name, { name, grades: [] });
      map.get(name)!.grades.push(g);
    }
    return Array.from(map.values());
  }, [childGrades]);

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Grades"
        description="View your child's grades by subject."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Parent Portal' }, { label: 'Grades' }]}
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

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : bySubject.length === 0 ? (
        <DashboardCard title="Grades" description={child?.full_name ?? 'Select a child'}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No grades recorded yet.</p>
          </div>
        </DashboardCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bySubject.map((s) => {
            const avg =
              s.grades.reduce(
                (sum, g) => sum + (g.score / (g.assessment?.max_score || 100)) * 100,
                0,
              ) / s.grades.length;
            return (
              <DashboardCard key={s.name} title={s.name} description={`${s.grades.length} assessments`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <Badge variant={avg >= 80 ? 'success' : avg >= 60 ? 'warning' : 'destructive'}>
                    {Math.round(avg)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  {s.grades.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <span>{g.assessment?.title ?? 'Assessment'}</span>
                      <span className="font-medium">
                        {g.score}/{g.assessment?.max_score ?? 100}
                      </span>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
