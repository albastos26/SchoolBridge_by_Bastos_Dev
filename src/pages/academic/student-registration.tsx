import { useState } from 'react';
import { UserPlus, Trash2, Filter } from 'lucide-react';
import { PageHeader, EntityTable, FormDialog, ConfirmDialog, type FormFieldDef, type RowAction } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEnrollments,
  useCreateEnrollment,
  useDeleteEnrollment,
  useAcademicYears,
  useClasses,
  useStudents,
} from '@/lib/academic-hooks';
import { createStudentAccount } from '@/lib/user-creation';
import { useToast } from '@/hooks/use-toast';
import type { StudentEnrollment } from '@/lib/academic-types';

const STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  active: 'success',
  promoted: 'secondary',
  graduated: 'secondary',
  transferred: 'warning',
  inactive: 'destructive',
};

export function StudentRegistrationPage() {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentEnrollment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useEnrollments(
    yearFilter !== 'all' ? yearFilter : undefined,
    classFilter !== 'all' ? classFilter : undefined
  );
  const { data: years } = useAcademicYears();
  const { data: classes } = useClasses(yearFilter !== 'all' ? yearFilter : undefined);
  const { data: students } = useStudents();

  const createEnrollMut = useCreateEnrollment();
  const deleteEnrollMut = useDeleteEnrollment();

  const columns = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      cell: (row: StudentEnrollment) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.student?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {(row.student?.full_name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.student?.full_name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{row.student?.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      cell: (row: StudentEnrollment) => row.class?.name ?? '—',
    },
    {
      key: 'academic_year',
      header: 'Year',
      cell: (row: StudentEnrollment) => row.academic_year?.name ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: StudentEnrollment) => (
        <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'enrollment_date',
      header: 'Enrolled',
      cell: (row: StudentEnrollment) => new Date(row.enrollment_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  ];

  const registerFields: FormFieldDef[] = [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
    { name: 'email', label: 'Email', type: 'text', required: true, placeholder: 'student@school.edu' },
    {
      name: 'class_id',
      label: 'Class',
      type: 'select',
      required: true,
      options: (classes ?? []).map((c) => ({ label: c.name, value: c.id })),
    },
    {
      name: 'academic_year_id',
      label: 'Academic Year',
      type: 'select',
      required: true,
      options: (years ?? []).map((y) => ({ label: y.name, value: y.id })),
      defaultValue: (years ?? []).find((y) => y.is_active)?.id ?? '',
    },
  ];

  const handleRegister = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const { data: userId, error } = await createStudentAccount(
        values.email as string,
        values.full_name as string,
        'student'
      );
      if (error) {
        toast({ title: 'Registration failed', description: error, variant: 'destructive' });
        return;
      }
      if (userId) {
        await createEnrollMut.mutateAsync({
          student_id: userId,
          class_id: values.class_id as string,
          academic_year_id: values.academic_year_id as string,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteEnrollMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<StudentEnrollment>[] = [
    { icon: Trash2, label: 'Remove', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Student Registration"
        description="Register new students and enroll them in classes."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Student Registration' }]}
        action={
          <Button onClick={() => setRegisterOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Register Student
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search by student name..."
        searchKeys={['student_id'] as unknown as (keyof StudentEnrollment)[]}
        toolbar={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {(years ?? []).map((y) => (
                  <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {(classes ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle="No students enrolled"
        emptyDescription="Register students and enroll them in classes to get started."
        emptyAction={
          <Button onClick={() => setRegisterOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Register Student
          </Button>
        }
      />

      <FormDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="Register New Student"
        description="Create a student account and enroll them in a class."
        fields={registerFields}
        onSubmit={handleRegister}
        submitLabel={submitting ? 'Registering...' : 'Register Student'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Enrollment"
        description={`Remove ${deleteTarget?.student?.full_name ?? 'this student'} from ${deleteTarget?.class?.name ?? 'this class'}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
