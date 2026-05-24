import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { WaitlistEntry, WaitlistSubmitInput } from '@/types';

export const MAX_APPLICANTS_PER_USER = 5;

type State = {
  applicants: WaitlistEntry[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

type SubmitResult = { error: string | null; limit?: boolean };

type Hook = State & {
  count: number;
  atLimit: boolean;
  submit: (input: WaitlistSubmitInput) => Promise<SubmitResult>;
  refresh: () => Promise<void>;
};

/** Lead intake for the signed-in device. One user (submitted_by) can register
 *  many applicants. Matching is by email: same email updates that applicant,
 *  a new email creates a new row (up to MAX_APPLICANTS_PER_USER). */
export function useWaitlist(): Hook {
  const { user } = useAuth();
  const [state, setState] = useState<State>({
    applicants: [],
    loading: true,
    submitting: false,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setState((s) => ({ ...s, applicants: [], loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('submitted_by', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[waitlist] fetch error', error);
      setState((s) => ({ ...s, loading: false, error: error.message }));
      return;
    }
    setState((s) => ({
      ...s,
      applicants: (data as WaitlistEntry[]) ?? [],
      loading: false,
    }));
  }, [user]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const submit = useCallback(
    async (input: WaitlistSubmitInput): Promise<SubmitResult> => {
      if (!user) return { error: 'not-authenticated' };
      if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
      setState((s) => ({ ...s, submitting: true, error: null }));
      try {
        const emailLc = input.email.trim().toLowerCase();
        const existing = state.applicants.find(
          (a) => a.email.trim().toLowerCase() === emailLc,
        );
        const row = {
          submitted_by: user.id,
          full_name: input.full_name,
          email: input.email,
          phone: input.phone,
          business_name: input.business_name,
          country: input.country,
          city: input.city,
          business_type: input.business_type,
          works_internationally: input.works_internationally,
          monthly_income_range: input.monthly_income_range,
          current_tools: input.current_tools,
          referral_source: input.referral_source,
        };

        if (existing) {
          // Same email — update that applicant (never the wrong one).
          const { error } = await supabase
            .from('waitlist_users')
            .update(row)
            .eq('id', existing.id);
          if (error) {
            setState((s) => ({ ...s, submitting: false, error: error.message }));
            return { error: error.message };
          }
        } else {
          // New email — new applicant, enforce the per-user cap.
          if (state.applicants.length >= MAX_APPLICANTS_PER_USER) {
            setState((s) => ({ ...s, submitting: false }));
            return { error: 'limit', limit: true };
          }
          const { error } = await supabase.from('waitlist_users').insert(row);
          if (error) {
            setState((s) => ({ ...s, submitting: false, error: error.message }));
            return { error: error.message };
          }
        }
        await fetchAll();
        setState((s) => ({ ...s, submitting: false }));
        return { error: null };
      } catch (err) {
        console.error('[waitlist] submit threw', err);
        const msg = err instanceof Error ? err.message : String(err);
        setState((s) => ({ ...s, submitting: false, error: msg }));
        return { error: msg };
      }
    },
    [user, state.applicants, fetchAll],
  );

  return {
    ...state,
    count: state.applicants.length,
    atLimit: state.applicants.length >= MAX_APPLICANTS_PER_USER,
    submit,
    refresh: fetchAll,
  };
}
