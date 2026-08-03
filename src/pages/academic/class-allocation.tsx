import { useState } from 'react';
import { ArrowRightLeft, Trash2, Filter } from 'lucide-react';
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
  useUpdateEnrollment,
  useDeleteEnrollment,
  useAcademicYears,
  useClasses,
  useStudents,
} from '@/lib/academic-hooks';
import type { StudentEnrollment } from '@/lib/academic-types';

const STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  active: 'success',
  promoted: 'secondary',
  graduated: 'secondary',
  transferred: 'warning',
  inactive: 'destructive',
};

export function ClassAllocationPage() {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<StudentEnrollment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentEnrollment | null>(null);

  const { data, isLoading } = useEnrollments(
    yearFilter !== 'all' ? yearFilter : undefined,
    classFilter !== 'all' ? classFilter : undefined
  );
  const { data: years } = useAcademicYears();
  const { data: classes } = useClasses(yearFilter !== 'all' ? yearFilter : undefined);
  const { data: students } = useStudents();

  const createMut = useCreateEnrollment();
  const updateMut = useUpdateEnrollment();
  const deleteMut = useDeleteEnrollment();

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
      key: 'status',
      header: 'Status',
      cell: (row: StudentEnrollment) => (
        <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
  ];

  const allocateFields: FormFieldDef[] = [
    {
      name: 'student_id',
      label: 'Student',
      type: 'select',
      required: true,
      options: (students ?? []).map((s) => ({ label: s.full_name ?? s.email, value: s.id })),
    },
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

  const transferFields: FormFieldDef[] = [
    {
      name: 'class_id',
      label: 'New Class',
      type: 'select',
      required: true,
      options: (classes ?? []).map((c) => ({ label: c.name, value: c.id })),
    },
  ];

  const handleAllocate = async (values: Record<string, unknown>) => {
    await createMut.mutateAsync({
      student_id: values.student_id as string,
      class_id: values.class_id as string,
      academic_year_id: values.academic_year_id as string,
    });
  };

  const handleTransfer = async (values: Record<string, unknown>) => {
    if (!transferTarget) return;
    await updateMut.mutateAsync({
      id: transferTarget.id,
      input: { class_id: values.class_id as string },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
  };

  const rowActions: RowAction<StudentEnrollment>[] = [
    { icon: ArrowRightLeft, label: 'Transfer', onClick: (row) => setTransferTarget(row) },
    { icon: Trash2, label: 'Remove', onClick: (row) => setDeleteTarget(row), variant: 'destructive' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Class Allocation"
        description="Allocate students to classes and manage transfers."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Class Allocation' }]}
        action={
          <Button onClick={() => setAllocateOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Allocate Student
          </Button>
        }
      />

      <EntityTable
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        rowActions={rowActions}
        searchPlaceholder="Search students..."
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
        emptyTitle="No allocations yet"
        emptyDescription="Allocate students to classes to get started."
        emptyAction={
          <Button onClick={() => setAllocateOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Allocate Student
          </Button>
        }
      />

      <FormDialog
        open={allocateOpen}
        onOpenChange={setAllocateOpen}
        title="Allocate Student to Class"
        description="Assign an existing student to a class for the selected year."
        fields={allocateFields}
        onSubmit={handleAllocate}
        submitLabel="Allocate"
      />

      <FormDialog
        open={!!transferTarget}
        onOpenChange={(open) => !open && setTransferTarget(null)}
        title="Transfer Student"
        description={`Transfer ${transferTarget?.student?.full_name ?? 'this student'} to a new class.`}
        fields={transferFields}
        onSubmit={handleTransfer}
        submitLabel="Transfer"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Allocation"
        description={`Remove ${deleteTarget?.student?.full_name ?? 'this student'} from ${deleteTarget?.class?.name ?? 'this class'}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
