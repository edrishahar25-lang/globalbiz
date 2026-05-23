import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  BusinessType,
  EarlyAccessPriority,
  OnboardingStatus,
  WaitlistEntry,
} from '@/types';

export type AdminFilters = {
  search?: string; // matches name or email substring (client-side)
  country?: string | null;
  businessType?: BusinessType | null;
  status?: OnboardingStatus | null;
};

type State = {
  entries: WaitlistEntry[];
  loading: boolean;
  error: string | null;
};

type Hook = State & {
  refresh: () => Promise<void>;
  updateStatus: (
    id: string,
    status: OnboardingStatus,
  ) => Promise<{ error: string | null }>;
  updatePriority: (
    id: string,
    priority: EarlyAccessPriority,
  ) => Promise<{ error: string | null }>;
  archive: (id: string) => Promise<{ error: string | null }>;
};

/** Admin-only — fetches every waitlist row. RLS will return 0 rows
 *  for non-admins regardless of what we ask for, so the UI gate
 *  (useIsAdmin) is the primary defense, RLS is the guarantee. */
export function useWaitlistAdmin(filters: AdminFilters): Hook {
  const [state, setState] = useState<State>({
    entries: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setState({ entries: [], loading: false, error: 'auth/not-configured' });
      return;
    }
    // Only show the spinner on the initial (empty) load — keeps the 10s
    // live-refresh from flickering the list.
    setState((s) => ({ ...s, loading: s.entries.length === 0, error: null }));
    let q = supabase
      .from('waitlist_users')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    if (filters.country) q = q.eq('country', filters.country);
    if (filters.businessType) q = q.eq('business_type', filters.businessType);
    if (filters.status) q = q.eq('onboarding_status', filters.status);
    const { data, error } = await q;
    if (error) {
      console.warn('[admin] fetch error', error);
      setState({ entries: [], loading: false, error: error.message });
      return;
    }
    let rows = (data as WaitlistEntry[]) ?? [];
    // Client-side search across name + email (case-insensitive substring).
    if (filters.search && filters.search.trim()) {
      const needle = filters.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.full_name.toLowerCase().includes(needle) ||
          r.email.toLowerCase().includes(needle),
      );
    }
    setState({ entries: rows, loading: false, error: null });
  }, [filters.country, filters.businessType, filters.status, filters.search]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const updateStatus = useCallback(
    async (id: string, status: OnboardingStatus) => {
      if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
      const { error } = await supabase
        .from('waitlist_users')
        .update({ onboarding_status: status })
        .eq('id', id);
      if (error) {
        console.warn('[admin] updateStatus error', error);
        return { error: error.message };
      }
      // Optimistic local update so the UI moves immediately
      setState((s) => ({
        ...s,
        entries: s.entries.map((e) =>
          e.id === id ? { ...e, onboarding_status: status } : e,
        ),
      }));
      return { error: null };
    },
    [],
  );

  const updatePriority = useCallback(
    async (id: string, priority: EarlyAccessPriority) => {
      if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
      const { error } = await supabase
        .from('waitlist_users')
        .update({ early_access_priority: priority })
        .eq('id', id);
      if (error) {
        console.warn('[admin] updatePriority error', error);
        return { error: error.message };
      }
      setState((s) => ({
        ...s,
        entries: s.entries.map((e) =>
          e.id === id ? { ...e, early_access_priority: priority } : e,
        ),
      }));
      return { error: null };
    },
    [],
  );

  // Soft-delete: hide from the list but keep the row in Supabase.
  const archive = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
    const { error } = await supabase
      .from('waitlist_users')
      .update({ archived: true })
      .eq('id', id);
    if (error) {
      console.warn('[admin] archive error', error);
      return { error: error.message };
    }
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
    return { error: null };
  }, []);

  return { ...state, refresh: fetchAll, updateStatus, updatePriority, archive };
}
