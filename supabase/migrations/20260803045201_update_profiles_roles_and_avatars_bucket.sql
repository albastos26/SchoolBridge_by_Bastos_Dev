/*
# Update profiles roles + create avatars storage bucket

1. Changes to `profiles` table
   - Replace the old role CHECK constraint (admin/teacher/student/parent/staff)
     with the new school-specific role set:
       director, head_of_studies, head_of_discipline, teacher, economist,
       storekeeper, nurse, parent, student
   - Default role stays 'student'.
   - Add `phone` (text, nullable) for profile contact info.
   - Add `email_verified` (boolean, default false) to track verification status
     independently from Supabase auth's email_confirmed_at for UI display.

2. Storage
   - Create a private storage bucket `avatars` for user profile photos.
   - Policies: authenticated users can upload/read/update/delete only their
     own avatar object (path = <uid>/avatar-<timestamp>.ext).

3. Security
   - RLS already enabled on profiles; policies unchanged.
   - Storage policies are owner-scoped via auth.uid() matching the folder prefix.
*/

-- Drop old constraint and add the new one
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('director','head_of_studies','head_of_discipline','teacher','economist','storekeeper','nurse','parent','student'));

-- Add new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

-- Update the handle_new_user trigger to set email_verified based on confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE((NEW.email_confirmed_at IS NOT NULL), false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email_verified = EXCLUDED.email_verified,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create avatars storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: owner-scoped CRUD on avatars/<uid>/...
DROP POLICY IF EXISTS "avatars_read_own" ON storage.objects;
CREATE POLICY "avatars_read_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);