import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { WaitlistEntry, WaitlistSubmitInput } from '@/types';

type State = {
  entry: WaitlistEntry | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

type Hook = State & {
  submit: (input: WaitlistSubmitInput) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
};

export function useWaitlist(): Hook {
  const { user } = useAuth();
  const [state, setState] = useState<State>({
    entry: null,
    loading: true,
    submitting: false,
    error: null,
  });

  const fetchEntry = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setState((s) => ({ ...s, entry: null, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      console.warn('[waitlist] fetch error', error);
      setState((s) => ({
        ...s,
        loading: false,
        error: error.message,
      }));
      return;
    }
    setState((s) => ({
      ...s,
      entry: (data as WaitlistEntry | null) ?? null,
      loading: false,
    }));
  }, [user]);

  useEffect(() => {
    void fetchEntry();
  }, [fetchEntry]);

  const submit = useCallback(
    async (input: WaitlistSubmitInput): Promise<{ error: string | null }> => {
      if (!user) return { error: 'not-authenticated' };
      if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
      setState((s) => ({ ...s, submitting: true, error: null }));
      try {
        const row = {
          id: user.id,
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
        const { data, error } = await supabase
          .from('waitlist_users')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();
        if (error) {
          console.warn('[waitlist] submit error', error);
          setState((s) => ({ ...s, submitting: false, error: error.message }));
          return { error: error.message };
        }
        setState((s) => ({
          ...s,
          entry: data as WaitlistEntry,
          submitting: false,
        }));
        return { error: null };
      } catch (err) {
        console.error('[waitlist] submit threw', err);
        const msg = err instanceof Error ? err.message : String(err);
        setState((s) => ({ ...s, submitting: false, error: msg }));
        return { error: msg };
      }
    },
    [user],
  );

  return { ...state, submit, refresh: fetchEntry };
}
