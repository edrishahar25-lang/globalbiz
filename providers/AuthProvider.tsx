import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, type Profile, supabase } from '@/lib/supabase';

type SignUpParams = {
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
  preferredLanguage: string;
};

type AuthState = {
  initializing: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (p: SignUpParams) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[auth] fetchProfile error', error);
    return null;
  }
  return data as Profile | null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setInitializing(false);
      return;
    }
    let cancelled = false;

    // Watchdog: never let the splash spin forever. If getSession() stalls
    // (e.g. a hung token refresh), force the app past initialization so the
    // user at least reaches the login screen.
    const watchdog = setTimeout(() => {
      if (!cancelled) {
        console.warn('[auth] init watchdog fired after 6s — proceeding without a resolved session');
        setInitializing(false);
      }
    }, 6000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        // Stop blocking the splash the moment we know the session. The
        // profile is non-critical for routing, so fetch it in the
        // background — a slow/hanging profiles query must never gate init.
        setInitializing(false);
        clearTimeout(watchdog);
        if (data.session?.user) {
          fetchProfile(data.session.user.id)
            .then((p) => {
              if (!cancelled) setProfile(p);
            })
            .catch((e) => console.warn('[auth] background profile fetch failed', e));
        }
      })
      .catch((err) => {
        console.warn('[auth] getSession failed', err);
        if (!cancelled) {
          setInitializing(false);
          clearTimeout(watchdog);
        }
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id)
          .then((p) => setProfile(p))
          .catch((e) => console.warn('[auth] profile fetch failed', e));
      } else {
        setProfile(null);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? error.message : null };
    } catch (err) {
      console.warn('[auth] signIn threw', err);
      return { error: err instanceof Error ? err.message : 'unknown' };
    }
  }, []);

  const signUp = useCallback(async (p: SignUpParams) => {
    if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
    console.log('[auth.signUp] →', { email: p.email, fullName: p.fullName });
    try {
      const result = await supabase.auth.signUp({
        email: p.email,
        password: p.password,
        options: {
          data: {
            full_name: p.fullName,
            business_name: p.businessName ?? null,
            preferred_language: p.preferredLanguage,
          },
        },
      });
      const { data, error } = result;
      console.log('[auth.signUp] ←', {
        userId: data?.user?.id ?? null,
        hasSession: Boolean(data?.session),
        errorName: error?.name ?? null,
        errorStatus: (error as { status?: number } | null)?.status ?? null,
        errorCode: (error as { code?: string } | null)?.code ?? null,
        errorMessage: error?.message ?? null,
      });
      if (error) {
        // Surface full object for the user to inspect in DevTools
        console.error('[auth.signUp] supabase returned error object:', error);
        return { error: error.message };
      }
      if (data.user) {
        const { error: pErr } = await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            full_name: p.fullName,
            business_name: p.businessName ?? null,
            preferred_language: p.preferredLanguage,
          },
          { onConflict: 'id' },
        );
        if (pErr) {
          console.warn('[auth.signUp] profile upsert failed (non-fatal):', pErr);
        }
      }
      return { error: null };
    } catch (err) {
      console.error('[auth.signUp] threw exception:', err);
      if (err instanceof Error) {
        console.error('[auth.signUp] err.name =', err.name);
        console.error('[auth.signUp] err.message =', err.message);
        console.error('[auth.signUp] err.cause =', (err as { cause?: unknown }).cause);
        console.error('[auth.signUp] err.stack =', err.stack);
      }
      // "Failed to fetch" specifically means the browser couldn't reach the URL.
      // Bubble up so the UI can show the network-error i18n message.
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[auth] signOut threw', err);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
    try {
      const redirectTo =
        typeof window !== 'undefined' && window.location?.origin
          ? `${window.location.origin}/reset-password`
          : 'globalbiz://reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error: error ? error.message : null };
    } catch (err) {
      console.warn('[auth] resetPasswordForEmail threw', err);
      return { error: err instanceof Error ? err.message : 'unknown' };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!isSupabaseConfigured) return { error: 'auth/not-configured' };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? error.message : null };
    } catch (err) {
      console.warn('[auth] updateUser threw', err);
      return { error: err instanceof Error ? err.message : 'unknown' };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  }, [session]);

  const value: AuthState = useMemo(
    () => ({
      initializing,
      session,
      user: session?.user ?? null,
      profile,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
    }),
    [
      initializing,
      session,
      profile,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
