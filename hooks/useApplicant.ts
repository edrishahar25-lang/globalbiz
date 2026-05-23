import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { EarlyAccessPriority, OnboardingStatus, WaitlistEntry } from '@/types';

type State = {
  applicant: WaitlistEntry | null;
  note: string;
  loading: boolean;
  error: string | null;
};

/** Admin-only single applicant view. Reads the waitlist row plus the
 *  admin-only note (separate table, hidden from users by RLS). */
export function useApplicant(id: string | undefined) {
  const [state, setState] = useState<State>({
    applicant: null,
    note: '',
    loading: true,
    error: null,
  });

  const fetchOne = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setState({ applicant: null, note: '', loading: false, error: 'auth/not-configured' });
      return;
    }
    if (!id) {
      setState({ applicant: null, note: '', loading: false, error: 'not-found' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const [rowRes, metaRes] = await Promise.all([
      supabase.from('waitlist_users').select('*').eq('id', id).maybeSingle(),
      supabase.from('waitlist_admin_meta').select('admin_notes').eq('applicant_id', id).maybeSingle(),
    ]);
    if (rowRes.error) {
      console.warn('[applicant] fetch error', rowRes.error);
      setState({ applicant: null, note: '', loading: false, error: rowRes.error.message });
      return;
    }
    setState({
      applicant: (rowRes.data as WaitlistEntry | null) ?? null,
      note: ((metaRes.data?.admin_notes as string | null) ?? ''),
      loading: false,
      error: rowRes.data ? null : 'not-found',
    });
  }, [id]);

  useEffect(() => {
    void fetchOne();
  }, [fetchOne]);

  const updateStatus = useCallback(
    async (status: OnboardingStatus) => {
      if (!id) return { error: 'not-found' };
      const { error } = await supabase
        .from('waitlist_users')
        .update({ onboarding_status: status })
        .eq('id', id);
      if (error) return { error: error.message };
      setState((s) => ({
        ...s,
        applicant: s.applicant ? { ...s.applicant, onboarding_status: status } : null,
      }));
      return { error: null };
    },
    [id],
  );

  const updatePriority = useCallback(
    async (priority: EarlyAccessPriority) => {
      if (!id) return { error: 'not-found' };
      const { error } = await supabase
        .from('waitlist_users')
        .update({ early_access_priority: priority })
        .eq('id', id);
      if (error) return { error: error.message };
      setState((s) => ({
        ...s,
        applicant: s.applicant ? { ...s.applicant, early_access_priority: priority } : null,
      }));
      return { error: null };
    },
    [id],
  );

  const saveNote = useCallback(
    async (note: string) => {
      if (!id) return { error: 'not-found' };
      const { error } = await supabase
        .from('waitlist_admin_meta')
        .upsert(
          { applicant_id: id, admin_notes: note, updated_at: new Date().toISOString() },
          { onConflict: 'applicant_id' },
        );
      if (error) return { error: error.message };
      setState((s) => ({ ...s, note }));
      return { error: null };
    },
    [id],
  );

  const archive = useCallback(async () => {
    if (!id) return { error: 'not-found' };
    const { error } = await supabase
      .from('waitlist_users')
      .update({ archived: true })
      .eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
  }, [id]);

  return { ...state, refresh: fetchOne, updateStatus, updatePriority, saveNote, archive };
}
