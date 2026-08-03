/*
# Fix promote_students function

1. Issue
   - The original promote_students referenced a non-existent column `se.class_id_grade_level`.
   - Student enrollments only store `class_id`, not the grade level directly.

2. Fix
   - Join student_enrollments to classes (on the FROM year) to get the old grade_level,
     then match the new year's class where grade_level = old_grade_level + 1, same section, same stream.
   - If no matching next-grade class exists, the student is simply not promoted (skipped).
*/

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
    new_c.id,
    p_to_year,
    CURRENT_DATE,
    'active'
  FROM public.student_enrollments se
  JOIN public.classes old_c ON old_c.id = se.class_id AND old_c.academic_year_id = p_from_year
  JOIN public.classes new_c ON new_c.academic_year_id = p_to_year
    AND new_c.grade_level = old_c.grade_level + 1
    AND new_c.section = old_c.section
    AND COALESCE(new_c.stream_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(old_c.stream_id, '00000000-0000-0000-0000-000000000000'::uuid)
  WHERE se.academic_year_id = p_from_year
    AND se.status = 'active'
  ON CONFLICT (student_id, academic_year_id) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  UPDATE public.student_enrollments
  SET status = 'promoted'
  WHERE academic_year_id = p_from_year AND status = 'active';

  RETURN inserted_count;
END;
$$;