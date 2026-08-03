import { supabase } from './supabase';
import type {
  Department,
  Stream,
  AcademicYear,
  Term,
  Subject,
  SchoolClass,
  TeacherAssignment,
  StudentEnrollment,
  ParentStudentLink,
  StaffMember,
} from './academic-types';

// ── Departments ──
export async function fetchDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*, head:head_id(id, full_name, email)')
    .order('name');
  if (error) throw error;
  return data as Department[];
}

export async function createDepartment(input: { name: string; code: string; head_id?: string | null; description?: string | null }) {
  const { data, error } = await supabase.from('departments').insert(input).select().single();
  if (error) throw error;
  return data as Department;
}

export async function updateDepartment(id: string, input: Partial<{ name: string; code: string; head_id: string | null; description: string | null }>) {
  const { data, error } = await supabase.from('departments').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Department;
}

export async function deleteDepartment(id: string) {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) throw error;
}

// ── Streams ──
export async function fetchStreams() {
  const { data, error } = await supabase.from('streams').select('*').order('name');
  if (error) throw error;
  return data as Stream[];
}

export async function createStream(input: { name: string; code: string; description?: string | null }) {
  const { data, error } = await supabase.from('streams').insert(input).select().single();
  if (error) throw error;
  return data as Stream;
}

export async function updateStream(id: string, input: Partial<{ name: string; code: string; description: string | null }>) {
  const { data, error } = await supabase.from('streams').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Stream;
}

export async function deleteStream(id: string) {
  const { error } = await supabase.from('streams').delete().eq('id', id);
  if (error) throw error;
}

// ── Academic Years ──
export async function fetchAcademicYears() {
  const { data, error } = await supabase.from('academic_years').select('*').order('start_date', { ascending: false });
  if (error) throw error;
  return data as AcademicYear[];
}

export async function createAcademicYear(input: { name: string; start_date: string; end_date: string; is_active?: boolean }) {
  if (input.is_active) {
    await supabase.from('academic_years').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  }
  const { data, error } = await supabase.from('academic_years').insert(input).select().single();
  if (error) throw error;
  return data as AcademicYear;
}

export async function updateAcademicYear(id: string, input: Partial<{ name: string; start_date: string; end_date: string; is_active: boolean }>) {
  if (input.is_active) {
    await supabase.from('academic_years').update({ is_active: false }).neq('id', id);
  }
  const { data, error } = await supabase.from('academic_years').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as AcademicYear;
}

export async function deleteAcademicYear(id: string) {
  const { error } = await supabase.from('academic_years').delete().eq('id', id);
  if (error) throw error;
}

// ── Terms ──
export async function fetchTerms(academicYearId?: string) {
  let q = supabase.from('terms').select('*').order('start_date');
  if (academicYearId) q = q.eq('academic_year_id', academicYearId);
  const { data, error } = await q;
  if (error) throw error;
  return data as Term[];
}

export async function createTerm(input: { academic_year_id: string; name: string; start_date: string; end_date: string; is_active?: boolean }) {
  const { data, error } = await supabase.from('terms').insert(input).select().single();
  if (error) throw error;
  return data as Term;
}

export async function updateTerm(id: string, input: Partial<{ name: string; start_date: string; end_date: string; is_active: boolean }>) {
  const { data, error } = await supabase.from('terms').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Term;
}

export async function deleteTerm(id: string) {
  const { error } = await supabase.from('terms').delete().eq('id', id);
  if (error) throw error;
}

// ── Subjects ──
export async function fetchSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, department:department_id(id, name), stream:stream_id(id, name)')
    .order('name');
  if (error) throw error;
  return data as Subject[];
}

export async function createSubject(input: { name: string; code: string; department_id?: string | null; stream_id?: string | null }) {
  const { data, error } = await supabase.from('subjects').insert(input).select().single();
  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(id: string, input: Partial<{ name: string; code: string; department_id: string | null; stream_id: string | null }>) {
  const { data, error } = await supabase.from('subjects').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

// ── Classes ──
export async function fetchClasses(academicYearId?: string) {
  let q = supabase
    .from('classes')
    .select('*, academic_year:academic_year_id(id, name), stream:stream_id(id, name), class_teacher:class_teacher_id(id, full_name)');
  if (academicYearId) q = q.eq('academic_year_id', academicYearId);
  q = q.order('grade_level').order('section');
  const { data, error } = await q;
  if (error) throw error;
  return data as SchoolClass[];
}

export async function createClass(input: {
  name: string;
  grade_level: number;
  section: string;
  academic_year_id: string;
  stream_id?: string | null;
  class_teacher_id?: string | null;
  capacity?: number;
}) {
  const { data, error } = await supabase.from('classes').insert(input).select().single();
  if (error) throw error;
  return data as SchoolClass;
}

export async function updateClass(id: string, input: Partial<{ name: string; grade_level: number; section: string; stream_id: string | null; class_teacher_id: string | null; capacity: number }>) {
  const { data, error } = await supabase.from('classes').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as SchoolClass;
}

export async function deleteClass(id: string) {
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
}

// ── Teacher Assignments ──
export async function fetchTeacherAssignments(academicYearId?: string) {
  let q = supabase
    .from('teacher_assignments')
    .select('*, teacher:teacher_id(id, full_name, email), subject:subject_id(id, name, code), class:class_id(id, name), academic_year:academic_year_id(id, name)');
  if (academicYearId) q = q.eq('academic_year_id', academicYearId);
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data as TeacherAssignment[];
}

export async function createTeacherAssignment(input: { teacher_id: string; subject_id: string; class_id: string; academic_year_id: string }) {
  const { data, error } = await supabase.from('teacher_assignments').insert(input).select().single();
  if (error) throw error;
  return data as TeacherAssignment;
}

export async function deleteTeacherAssignment(id: string) {
  const { error } = await supabase.from('teacher_assignments').delete().eq('id', id);
  if (error) throw error;
}

// ── Student Enrollments ──
export async function fetchEnrollments(academicYearId?: string, classId?: string) {
  let q = supabase
    .from('student_enrollments')
    .select('*, student:student_id(id, full_name, email, avatar_url), class:class_id(id, name), academic_year:academic_year_id(id, name)');
  if (academicYearId) q = q.eq('academic_year_id', academicYearId);
  if (classId) q = q.eq('class_id', classId);
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data as StudentEnrollment[];
}

export async function createEnrollment(input: { student_id: string; class_id: string; academic_year_id: string; enrollment_date?: string; status?: string }) {
  const { data, error } = await supabase.from('student_enrollments').insert(input).select().single();
  if (error) throw error;
  return data as StudentEnrollment;
}

export async function updateEnrollment(id: string, input: Partial<{ class_id: string; status: string }>) {
  const { data, error } = await supabase.from('student_enrollments').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as StudentEnrollment;
}

export async function deleteEnrollment(id: string) {
  const { error } = await supabase.from('student_enrollments').delete().eq('id', id);
  if (error) throw error;
}

// ── Parent-Student Links ──
export async function fetchParentLinks() {
  const { data, error } = await supabase
    .from('parent_student_links')
    .select('*, parent:parent_id(id, full_name, email), student:student_id(id, full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ParentStudentLink[];
}

export async function createParentLink(input: { parent_id: string; student_id: string; relationship?: string }) {
  const { data, error } = await supabase.from('parent_student_links').insert(input).select().single();
  if (error) throw error;
  return data as ParentStudentLink;
}

export async function deleteParentLink(id: string) {
  const { error } = await supabase.from('parent_student_links').delete().eq('id', id);
  if (error) throw error;
}

// ── Staff (for dropdowns) ──
export async function fetchStaffByRoles(roles: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .in('role', roles)
    .order('full_name');
  if (error) throw error;
  return data as StaffMember[];
}

export async function fetchAllStaff() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .neq('role', 'student')
    .neq('role', 'parent')
    .order('full_name');
  if (error) throw error;
  return data as StaffMember[];
}

export async function fetchStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .eq('role', 'student')
    .order('full_name');
  if (error) throw error;
  return data as StaffMember[];
}

export async function fetchParents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .eq('role', 'parent')
    .order('full_name');
  if (error) throw error;
  return data as StaffMember[];
}

// ── Promotion ──
export async function promoteStudents(fromYearId: string, toYearId: string) {
  const { data, error } = await supabase.rpc('promote_students', {
    p_from_year: fromYearId,
    p_to_year: toYearId,
  });
  if (error) throw error;
  return data as number;
}

// ── Class enrollment count ──
export async function fetchClassEnrollmentCount(classId: string) {
  const { count, error } = await supabase
    .from('student_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('status', 'active');
  if (error) throw error;
  return count ?? 0;
}
