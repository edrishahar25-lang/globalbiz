import { useAuth } from '@/providers/AuthProvider';

// Founder admin allow-list. The DB's is_admin() function enforces the
// same email server-side (RLS), so this client check is UX-only — a
// non-admin who bypasses it still gets 0 rows from Supabase.
const ADMIN_EMAILS = ['edrishahar25@gmail.com'];

/** null = still resolving auth. true/false = known. */
export function useIsAdmin(): boolean | null {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  const email = (user?.email ?? '').trim().toLowerCase();
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
}
