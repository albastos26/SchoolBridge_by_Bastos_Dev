/*
# Academic structure: departments, streams, years, terms, subjects, classes, assignments, enrollments, parent links

1. Purpose
   Build the full academic backbone of a secondary school:
   - Departments group teachers and subjects (e.g. Sciences, Languages).
   - Streams are academic tracks (e.g. Sciences, Commercial, Arts).
   - Academic Years contain Terms (e.g. 2025/2026 → Term 1, Term 2, Term 3).
   - Subjects belong to a department and optionally a stream.
   - Classes represent a grade level + section + stream + year (e.g. Grade 10-B Sciences 2025/2026).
   - Teacher Assignments link a teacher to a subject + class.
   - Student Enrollments link a student profile to a class for a specific year.
   - Parent-Student links connect a parent profile to one or more student profiles.
   - A promotion helper function advances students to the next grade.

2. New Tables
   - `departments` (id, name, code, head_id, description, created_at, updated_at)
   - `streams` (id, name, code, description, created_at, updated_at)
   - `academic_years` (id, name, start_date, end_date, is_active, created_at, updated_at)
   - `terms` (id, academic_year_id, name, start_date, end_date, is_active, created_at, updated_at)
   - `subjects` (id, name, code, department_id, stream_id, created_at, updated_at)
   - `classes` (id, name, grade_level, section, academic_year_id, stream_id, class_teacher_id, capacity, created_at, updated_at)
   - `teacher_assignments` (id, teacher_id, subject_id, class_id, academic_year_id, created_at, updated_at)
   - `student_enrollments` (id, student_id, class_id, academic_year_id, enrollment_date, status, created_at, updated_at)
   - `parent_student_links` (id, parent_id, student_id, relationship, created_at)

3. Foreign Keys
   - All tables reference auth.users via profiles.id where applicable.
   - Cascade deletes from parent academic tables.

4. Security (RLS)
   - RLS enabled on every table.
   - Director and Head of Studies have full CRUD (via is_staff_with_manage permission check using auth.jwt role claim).
   - All authenticated staff can SELECT (read) academic structure data.
   - Students and parents can SELECT their own enrollment / link data.
   - Policies use a helper function `is_academic_manager()` that checks the user's profile role.

5. Helper Functions
   - `is_academic_manager()` returns true if the current user's profile role is 'director' or 'head_of_studies'.
   - `promote_students(p_from_year uuid, p_to_year uuid)` advances active enrollments to a new academic year.
*/

-- Helper: is the current user a director or head of studies?
CREATE OR REPLACE FUNCTION public.is_academic_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('director', 'head_of_studies')
  );
$$;

-- ── Departments ──
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  head_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_select" ON public.departments;
CREATE POLICY "departments_select" ON public.departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "departments_manage" ON public.departments;
CREATE POLICY "departments_manage" ON public.departments FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Streams ──
CREATE TABLE IF NOT EXISTS public.streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streams_select" ON public.streams;
CREATE POLICY "streams_select" ON public.streams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "streams_manage" ON public.streams;
CREATE POLICY "streams_manage" ON public.streams FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Academic Years ──
CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "years_select" ON public.academic_years;
CREATE POLICY "years_select" ON public.academic_years FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "years_manage" ON public.academic_years;
CREATE POLICY "years_manage" ON public.academic_years FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Terms ──
CREATE TABLE IF NOT EXISTS public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "terms_select" ON public.terms;
CREATE POLICY "terms_select" ON public.terms FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "terms_manage" ON public.terms;
CREATE POLICY "terms_manage" ON public.terms FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Subjects ──
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  stream_id uuid REFERENCES public.streams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subjects_select" ON public.subjects;
CREATE POLICY "subjects_select" ON public.subjects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "subjects_manage" ON public.subjects;
CREATE POLICY "subjects_manage" ON public.subjects FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Classes ──
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_level integer NOT NULL,
  section text NOT NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  stream_id uuid REFERENCES public.streams(id) ON DELETE SET NULL,
  class_teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  capacity integer NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes_select" ON public.classes;
CREATE POLICY "classes_select" ON public.classes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "classes_manage" ON public.classes;
CREATE POLICY "classes_manage" ON public.classes FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Teacher Assignments ──
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, subject_id, class_id, academic_year_id)
);
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_select" ON public.teacher_assignments;
CREATE POLICY "assignments_select" ON public.teacher_assignments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "assignments_manage" ON public.teacher_assignments;
CREATE POLICY "assignments_manage" ON public.teacher_assignments FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Student Enrollments ──
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','promoted','graduated','transferred','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id)
);
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select" ON public.student_enrollments;
CREATE POLICY "enrollments_select" ON public.student_enrollments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "enrollments_manage" ON public.student_enrollments;
CREATE POLICY "enrollments_manage" ON public.student_enrollments FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── Parent-Student Links ──
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent','guardian','mother','father','other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "links_select" ON public.parent_student_links;
CREATE POLICY "links_select" ON public.parent_student_links FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "links_manage" ON public.parent_student_links;
CREATE POLICY "links_manage" ON public.parent_student_links FOR ALL TO authenticated
  USING (public.is_academic_manager()) WITH CHECK (public.is_academic_manager());

-- ── updated_at triggers ──
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['departments','streams','academic_years','terms','subjects','classes','teacher_assignments','student_enrollments']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I;', t || '_set_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();', t, t);
  END LOOP;
END $$;

-- ── Promotion helper: copy active enrollments to a new academic year ──
CREATE OR REPLACE FUNCTION public.promote_students(p_from_year uuid, p_to_year uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  IF NOT public.is_academic_manager() THEN
    RAISE EXCEPTION 'Permission denied: only directors and heads of studies can promote students';
  END IF;

  INSERT INTO public.student_enrollments (student_id, class_id, academic_year_id, enrollment_date, status)
  SELECT
    se.student_id,
    c.id,
    p_to_year,
    CURRENT_DATE,
    'active'
  FROM public.student_enrollments se
  JOIN public.classes c ON c.academic_year_id = p_to_year
    AND c.grade_level = se.class_id_grade_level + 1
    AND c.section = (SELECT section FROM public.classes WHERE id = se.class_id)
    AND c.stream_id = (SELECT stream_id FROM public.classes WHERE id = se.class_id)
  WHERE se.academic_year_id = p_from_year
    AND se.status = 'active'
  ON CONFLICT (student_id, academic_year_id) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  -- Mark old enrollments as promoted
  UPDATE public.student_enrollments
  SET status = 'promoted'
  WHERE academic_year_id = p_from_year AND status = 'active';

  RETURN inserted_count;
END;
$$;