import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

/** null = still loading. true/false = known. */
export function useIsAdmin(): boolean | null {
  const { user, initializing } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (initializing) return;
    if (!isSupabaseConfigured || !user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (cancelled) return;
      if (error) {
        console.warn('[admin] is_admin RPC failed', error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(data));
    })();
    return () => {
      cancelled = true;
    };
  }, [user, initializing]);

  return isAdmin;
}
