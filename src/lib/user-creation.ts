import { supabase } from './supabase';
import type { UserRole } from './types';

// These functions call the create-user edge function which uses the service role key
// to create auth users and profile records server-side.

export async function createStudentAccount(
  email: string,
  fullName: string,
  role: UserRole = 'student'
): Promise<{ data: string | null; error: string | null }> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, fullName, role }),
    }
  );

  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error ?? 'Failed to create user' };
  return { data: json.id, error: null };
}

export async function createStaffAccount(
  email: string,
  fullName: string,
  role: UserRole
): Promise<{ error: string | null }> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, fullName, role }),
    }
  );

  const json = await res.json();
  if (!res.ok) return { error: json.error ?? 'Failed to create user' };
  return { error: null };
}
