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
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        setSession(data.session);
        if (data.session?.user) {
          const p = await fetchProfile(data.session.user.id);
          if (!cancelled) setProfile(p);
        }
      })
      .catch((err) => console.warn('[auth] getSession failed', err))
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return () => {
      cancelled = true;
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
    try {
      const { data, error } = await supabase.auth.signUp({
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
      if (error) return { error: error.message };
      // Create profile row if a user was returned (email confirmation may
      // gate session — but the user row exists immediately).
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
          console.warn('[auth] profile upsert failed', pErr);
        }
      }
      return { error: null };
    } catch (err) {
      console.warn('[auth] signUp threw', err);
      return { error: err instanceof Error ? err.message : 'unknown' };
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
