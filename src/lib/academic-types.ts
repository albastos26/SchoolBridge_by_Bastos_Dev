import type { UserRole } from './types';

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  head?: { id: string; full_name: string | null; email: string } | null;
}

export interface Stream {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  terms?: Term[];
}

export interface Term {
  id: string;
  academic_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string | null;
  stream_id: string | null;
  created_at: string;
  updated_at: string;
  department?: { id: string; name: string } | null;
  stream?: { id: string; name: string } | null;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  academic_year_id: string;
  stream_id: string | null;
  class_teacher_id: string | null;
  capacity: number;
  created_at: string;
  updated_at: string;
  academic_year?: { id: string; name: string } | null;
  stream?: { id: string; name: string } | null;
  class_teacher?: { id: string; full_name: string | null } | null;
  _count?: { enrollments: number };
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
  teacher?: { id: string; full_name: string | null; email: string } | null;
  subject?: { id: string; name: string; code: string } | null;
  class?: { id: string; name: string } | null;
  academic_year?: { id: string; name: string } | null;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  enrollment_date: string;
  status: 'active' | 'promoted' | 'graduated' | 'transferred' | 'inactive';
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
  class?: { id: string; name: string } | null;
  academic_year?: { id: string; name: string } | null;
}

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  relationship: 'parent' | 'guardian' | 'mother' | 'father' | 'other';
  created_at: string;
  parent?: { id: string; full_name: string | null; email: string } | null;
  student?: { id: string; full_name: string | null; email: string } | null;
}

export interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

export interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}
