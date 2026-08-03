import { useState } from 'react';
import { ArrowUpCircle, TrendingUp, Users, GraduationCap, CheckCircle2 } from 'lucide-react';
import { PageHeader, StatCard, DashboardCard } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/dash';
import { useAcademicYears, useEnrollments, usePromoteStudents } from '@/lib/academic-hooks';
import type { StatCardData } from '@/lib/types';

export function StudentPromotionPage() {
  const { data: years } = useAcademicYears();
  const promoteMut = usePromoteStudents();

  const [fromYear, setFromYear] = useState<string>('');
  const [toYear, setToYear] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const { data: fromEnrollments } = useEnrollments(fromYear || undefined);
  const activeCount = (fromEnrollments ?? []).filter((e) => e.status === 'active').length;

  const sortedYears = (years ?? []).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const stats: StatCardData[] = [
    { label: 'Active Students', value: activeCount, icon: Users, accent: 'primary', changeLabel: `in ${sortedYears.find((y) => y.id === fromYear)?.name ?? '—'}` },
    { label: 'Target Year', value: toYear ? sortedYears.find((y) => y.id === toYear)?.name ?? '—' : '—', icon: TrendingUp, accent: 'info' },
    { label: 'Last Promotion', value: result ?? '—', icon: CheckCircle2, accent: 'success', changeLabel: 'students promoted' },
  ];

  const handlePromote = async () => {
    if (!fromYear || !toYear) return;
    const count = await promoteMut.mutateAsync({ fromYearId: fromYear, toYearId: toYear });
    setResult(count);
  };

  const canPromote = fromYear && toYear && fromYear !== toYear;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Student Promotion"
        description="Promote students to the next grade level for a new academic year."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Student Promotion' }]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Promotion Setup</CardTitle>
            <CardDescription>
              Select the source and target academic years. All active students will be promoted
              to the next grade level in matching classes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>From Academic Year</Label>
                <Select value={fromYear} onValueChange={setFromYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source year" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name} {y.is_active && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Academic Year</Label>
                <Select value={toYear} onValueChange={setToYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target year" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name} {y.is_active && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">How promotion works</p>
                <p className="text-muted-foreground">
                  Each active student is moved to a class one grade higher with the same section and stream.
                  Students in the highest grade are not promoted (they graduate). Old enrollments are marked as "promoted".
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canPromote || promoteMut.isPending}
                size="lg"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Promote Students
              </Button>
            </div>
          </CardContent>
        </Card>

        {result !== null && (
          <DashboardCard title="Promotion Result" description="Summary of the last promotion">
            <div className="flex flex-col items-center py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{result}</p>
              <p className="text-sm text-muted-foreground">students promoted successfully</p>
            </div>
          </DashboardCard>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Promotion"
        description={`Promote ${activeCount} active student(s) from ${sortedYears.find((y) => y.id === fromYear)?.name ?? '—'} to ${sortedYears.find((y) => y.id === toYear)?.name ?? '—'}? This will create new enrollment records and mark old ones as promoted.`}
        confirmLabel="Promote Now"
        onConfirm={handlePromote}
      />
    </div>
  );
}
