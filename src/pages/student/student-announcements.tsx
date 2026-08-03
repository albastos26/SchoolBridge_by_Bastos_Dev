import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { PageHeader, DashboardCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { useAnnouncements } from '@/lib/module-hooks';
import { Badge } from '@/components/ui/badge';

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'secondary' | 'default'> = {
  urgent: 'destructive',
  high: 'warning',
  normal: 'secondary',
  low: 'default',
};

export function StudentAnnouncementsPage() {
  const { profile } = useAuth();
  const { data: announcements = [], isLoading } = useAnnouncements();

  const studentAnnouncements = useMemo(
    () => announcements.filter((a) => a.audience === 'all' || a.audience === 'students'),
    [announcements],
  );

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Announcements"
        description="School notices and announcements for students."
        breadcrumbs={[
          { label: 'Dashboard' },
          { label: 'Student Portal' },
          { label: 'Announcements' },
        ]}
      />

      <DashboardCard title="Announcements" description={`${studentAnnouncements.length} notices`}>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : studentAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No announcements found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentAnnouncements.map((a) => (
              <div key={a.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{a.title}</h3>
                  <Badge variant={PRIORITY_VARIANT[a.priority] ?? 'secondary'} className="capitalize">
                    {a.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.content}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(a.published_at).toLocaleDateString()}</span>
                  {a.author?.full_name && <span>· {a.author.full_name}</span>}
                  {a.class?.name && <span>· {a.class.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
