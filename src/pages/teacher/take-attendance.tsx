import { useState } from 'react';
import { Save, CalendarCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses, useEnrollments } from '@/lib/academic-hooks';
import { useBulkUpsertAttendance } from '@/lib/module-hooks';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

type Status = 'present' | 'absent' | 'late' | 'excused';
const STATUSES: { value: Status; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
];

export function TakeAttendancePage() {
  const { profile } = useAuth();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(undefined, undefined);
  const bulkUpsert = useBulkUpsertAttendance();
  const { toast } = useToast();

  const [classId, setClassId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const filteredEnrollments = (enrollments ?? []).filter((e) => e.class_id === classId && e.status === 'active');

  const handleSave = async () => {
    if (!profile) return;
    if (!classId) { toast({ title: 'Select a class', variant: 'destructive' }); return; }
    if (filteredEnrollments.length === 0) { toast({ title: 'No students enrolled', variant: 'destructive' }); return; }
    const records = filteredEnrollments.map((e) => ({
      class_id: classId,
      student_id: e.student_id,
      date,
      status: marks[e.student_id] ?? 'present',
      subject_id: null,
      recorded_by: profile.id,
    }));
    await bulkUpsert.mutateAsync(records);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Take Attendance"
        description="Mark attendance for a class and date."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher' }, { label: 'Take Attendance' }]}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId} disabled={classesLoading}>
            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
            <SelectContent>
              {(classes ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="att-date">Date</Label>
          <input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {!classId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Select a class to take attendance</p>
          <p className="text-xs text-muted-foreground">Choose a class above to see enrolled students.</p>
        </div>
      ) : enrollmentsLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading students…</div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No active students enrolled</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-3">{e.student?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <RadioGroup
                        value={marks[e.student_id] ?? 'present'}
                        onValueChange={(v) => setMarks((m) => ({ ...m, [e.student_id]: v as Status }))}
                        className="flex gap-4"
                      >
                        {STATUSES.map((s) => (
                          <div key={s.value} className="flex items-center gap-1.5">
                            <RadioGroupItem id={`${e.student_id}-${s.value}`} value={s.value} />
                            <Label htmlFor={`${e.student_id}-${s.value}`} className="text-xs font-normal">{s.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} disabled={bulkUpsert.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
