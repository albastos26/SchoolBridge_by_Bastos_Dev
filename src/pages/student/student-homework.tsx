import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAssessments } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';

export function StudentHomeworkPage() {
  const { profile } = useAuth();
  const { data: assessments = [], isLoading } = useAssessments();

  const homework = useMemo(
    () => assessments.filter((a) => a.type === 'assignment' || a.type === 'homework'),
    [assessments],
  );

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Homework & Assignments"
        description="Your upcoming and recent assignments."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Student Portal' }, { label: 'Homework' }]}
      />

      <DashboardCard title="Assignments" description={`${homework.length} items`}>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : homework.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No assignments found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {homework.map((a) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.subject?.name ?? 'Subject'} · {a.class?.name ?? 'Class'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{a.type}</Badge>
                </div>
                {a.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {a.due_date && (
                    <Badge variant="outline">Due: {new Date(a.due_date).toLocaleDateString()}</Badge>
                  )}
                  <Badge
                    variant={
                      a.status === 'published' ? 'success' : a.status === 'closed' ? 'destructive' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
