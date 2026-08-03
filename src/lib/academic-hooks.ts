import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as api from './academic-api';
import { createStudentAccount, createStaffAccount } from './user-creation';
import type { ImportResult } from './academic-types';
import type { UserRole } from './types';

const KEYS = {
  departments: ['departments'] as const,
  streams: ['streams'] as const,
  academicYears: ['academicYears'] as const,
  terms: ['terms'] as const,
  subjects: ['subjects'] as const,
  classes: ['classes'] as const,
  teacherAssignments: ['teacherAssignments'] as const,
  enrollments: ['enrollments'] as const,
  parentLinks: ['parentLinks'] as const,
  staff: ['staff'] as const,
  students: ['students'] as const,
  parents: ['parents'] as const,
};

// ── Departments ──
export function useDepartments() {
  return useQuery({ queryKey: KEYS.departments, queryFn: api.fetchDepartments });
}
export function useCreateDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createDepartment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.departments }); toast({ title: 'Department created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateDepartment>[1] }) =>
      api.updateDepartment(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.departments }); toast({ title: 'Department updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteDepartment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteDepartment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.departments }); toast({ title: 'Department deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Streams ──
export function useStreams() {
  return useQuery({ queryKey: KEYS.streams, queryFn: api.fetchStreams });
}
export function useCreateStream() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createStream,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.streams }); toast({ title: 'Stream created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateStream() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateStream>[1] }) =>
      api.updateStream(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.streams }); toast({ title: 'Stream updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteStream() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteStream,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.streams }); toast({ title: 'Stream deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Academic Years ──
export function useAcademicYears() {
  return useQuery({ queryKey: KEYS.academicYears, queryFn: api.fetchAcademicYears });
}
export function useCreateAcademicYear() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createAcademicYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.academicYears }); toast({ title: 'Academic year created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateAcademicYear() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateAcademicYear>[1] }) =>
      api.updateAcademicYear(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.academicYears }); toast({ title: 'Academic year updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteAcademicYear() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteAcademicYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.academicYears }); toast({ title: 'Academic year deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Terms ──
export function useTerms(academicYearId?: string) {
  return useQuery({ queryKey: [KEYS.terms, academicYearId], queryFn: () => api.fetchTerms(academicYearId) });
}
export function useCreateTerm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createTerm,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.terms }); toast({ title: 'Term created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateTerm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateTerm>[1] }) =>
      api.updateTerm(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.terms }); toast({ title: 'Term updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteTerm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteTerm,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.terms }); toast({ title: 'Term deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Subjects ──
export function useSubjects() {
  return useQuery({ queryKey: KEYS.subjects, queryFn: api.fetchSubjects });
}
export function useCreateSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.subjects }); toast({ title: 'Subject created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateSubject>[1] }) =>
      api.updateSubject(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.subjects }); toast({ title: 'Subject updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteSubject() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.subjects }); toast({ title: 'Subject deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Classes ──
export function useClasses(academicYearId?: string) {
  return useQuery({ queryKey: [KEYS.classes, academicYearId], queryFn: () => api.fetchClasses(academicYearId) });
}
export function useCreateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.classes }); toast({ title: 'Class created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateClass>[1] }) =>
      api.updateClass(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.classes }); toast({ title: 'Class updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.classes }); toast({ title: 'Class deleted' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Teacher Assignments ──
export function useTeacherAssignments(academicYearId?: string) {
  return useQuery({ queryKey: [KEYS.teacherAssignments, academicYearId], queryFn: () => api.fetchTeacherAssignments(academicYearId) });
}
export function useCreateTeacherAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createTeacherAssignment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.teacherAssignments }); toast({ title: 'Assignment created' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteTeacherAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteTeacherAssignment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.teacherAssignments }); toast({ title: 'Assignment removed' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Enrollments ──
export function useEnrollments(academicYearId?: string, classId?: string) {
  return useQuery({ queryKey: [KEYS.enrollments, academicYearId, classId], queryFn: () => api.fetchEnrollments(academicYearId, classId) });
}
export function useCreateEnrollment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createEnrollment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.enrollments }); toast({ title: 'Student enrolled' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useUpdateEnrollment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateEnrollment>[1] }) =>
      api.updateEnrollment(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.enrollments }); toast({ title: 'Enrollment updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteEnrollment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteEnrollment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.enrollments }); toast({ title: 'Enrollment removed' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Parent Links ──
export function useParentLinks() {
  return useQuery({ queryKey: KEYS.parentLinks, queryFn: api.fetchParentLinks });
}
export function useCreateParentLink() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.createParentLink,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.parentLinks }); toast({ title: 'Parent linked' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteParentLink() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: api.deleteParentLink,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.parentLinks }); toast({ title: 'Link removed' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Staff / Students / Parents ──
export function useStaff() {
  return useQuery({ queryKey: KEYS.staff, queryFn: api.fetchAllStaff });
}
export function useStudents() {
  return useQuery({ queryKey: KEYS.students, queryFn: api.fetchStudents });
}
export function useParents() {
  return useQuery({ queryKey: KEYS.parents, queryFn: api.fetchParents });
}
export function useTeachers() {
  return useQuery({ queryKey: ['teachers'], queryFn: () => api.fetchStaffByRoles(['teacher', 'head_of_studies', 'head_of_discipline']) });
}

// ── Promotion ──
export function usePromoteStudents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ fromYearId, toYearId }: { fromYearId: string; toYearId: string }) =>
      api.promoteStudents(fromYearId, toYearId),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: KEYS.enrollments });
      toast({ title: 'Promotion complete', description: `${count} students promoted successfully.` });
    },
    onError: (e: Error) => toast({ title: 'Promotion failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Bulk import helpers ──
export async function bulkImportStudents(
  rows: Record<string, string>[]
): Promise<ImportResult> {
  let success = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fullName = row.full_name?.trim();
    const email = row.email?.trim();
    if (!fullName || !email) {
      errors.push({ row: i + 2, message: 'Missing full_name or email' });
      continue;
    }
    try {
      const { error } = await createStudentAccount(email, fullName, row.role as UserRole ?? 'student');
      if (error) {
        errors.push({ row: i + 2, message: error });
        continue;
      }
      success++;
    } catch (e) {
      errors.push({ row: i + 2, message: (e as Error).message });
    }
  }

  return { success, errors };
}

export async function bulkImportTeachers(
  rows: Record<string, string>[]
): Promise<ImportResult> {
  let success = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fullName = row.full_name?.trim();
    const email = row.email?.trim();
    const role = row.role?.trim() as UserRole || 'teacher';
    if (!fullName || !email) {
      errors.push({ row: i + 2, message: 'Missing full_name or email' });
      continue;
    }
    try {
      const { error } = await createStaffAccount(email, fullName, role);
      if (error) {
        errors.push({ row: i + 2, message: error });
        continue;
      }
      success++;
    } catch (e) {
      errors.push({ row: i + 2, message: (e as Error).message });
    }
  }

  return { success, errors };
}
