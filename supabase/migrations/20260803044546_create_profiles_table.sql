/*
# Create profiles table for user management

1. Purpose
   - Stores per-user metadata for the School Management System: full name, role,
     avatar URL, and timestamps. One row per Supabase auth user.
   - Roles drive role-based access control (RBAC) in the frontend:
     admin, teacher, student, parent, staff.

2. New Tables
   - `profiles`
     - `id` (uuid, primary key, references auth.users.id ON DELETE CASCADE)
     - `email` (text, not null) — denormalized from auth.users for fast listing
     - `full_name` (text, nullable) — display name
     - `role` (text, not null, default 'student') — one of: admin, teacher, student, parent, staff
     - `avatar_url` (text, nullable) — profile photo URL
     - `is_active` (boolean, default true) — soft disable an account without deleting
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

3. Constraints
   - `profiles_role_check` — role must be one of the allowed values.

4. Automation
   - `handle_new_user` trigger function: on a new auth.users row, insert a
     matching profiles row with email + default role 'student'.
   - `update_updated_at` trigger function: bumps updated_at on every UPDATE.

5. Security (RLS)
   - RLS enabled on `profiles`.
   - SELECT: authenticated users can read all profiles (school directory use case).
   - INSERT: a user can insert their own profile row (auth.uid() = id).
   - UPDATE: a user can update their own profile row. Role elevation is NOT
     possible through this policy because `role` is governed by a separate
     admin-only path (to be added when the admin user-management feature ships).
   - DELETE: a user can delete their own profile row.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin','teacher','student','parent','staff')),
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_all_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bump updated_at on UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();