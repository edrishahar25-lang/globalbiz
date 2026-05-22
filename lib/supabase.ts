import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: env vars are inlined by Metro at BUILD time. They are only
// inlined if they have the EXPO_PUBLIC_ prefix. Trimming defensively in
// case the value has accidental whitespace from a copy-paste.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// URL format check — catches typos and missing scheme
const URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/;
const urlLooksValid = supabaseUrl ? URL_RE.test(supabaseUrl) : false;
const keyLooksValid = supabaseAnonKey
  ? supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 100
  : false;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey && urlLooksValid && keyLooksValid,
);

// ============================================================
// STARTUP DIAGNOSTICS — these print on every bundle load.
// Look for these in the browser console immediately after refresh.
// ============================================================
const initSummary = {
  urlSet: Boolean(supabaseUrl),
  urlLength: supabaseUrl?.length ?? 0,
  urlPrefix: supabaseUrl ? supabaseUrl.slice(0, 40) : null,
  urlHasTrailingSlash: supabaseUrl?.endsWith('/') ?? false,
  urlLooksValid,
  keySet: Boolean(supabaseAnonKey),
  keyLength: supabaseAnonKey?.length ?? 0,
  keyStartsWithEyJ: supabaseAnonKey?.startsWith('eyJ') ?? false,
  keyLast4: supabaseAnonKey?.slice(-4) ?? null,
  keyLooksValid,
  configured: isSupabaseConfigured,
  runtime: typeof window === 'undefined' ? 'server/native' : 'browser',
};
// eslint-disable-next-line no-console
console.log('[supabase] init', initSummary);

if (!supabaseUrl) {
  console.error('[supabase] EXPO_PUBLIC_SUPABASE_URL is empty/undefined. Set it in Netlify env.');
}
if (!supabaseAnonKey) {
  console.error('[supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is empty/undefined. Set it in Netlify env.');
}
if (supabaseUrl && !urlLooksValid) {
  console.error(
    '[supabase] URL malformed. Expected https://<project>.supabase.co — got:',
    supabaseUrl,
  );
}
if (supabaseAnonKey && !keyLooksValid) {
  console.error(
    '[supabase] Anon key malformed. Expected JWT starting with "eyJ" and >100 chars — got length',
    supabaseAnonKey.length,
    'starts with',
    supabaseAnonKey.slice(0, 5),
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// ============================================================
// CONNECTIVITY CHECK — runs once on browser load when configured.
// Hits the public auth health endpoint. If this fails, the user's
// browser cannot reach Supabase at all (CORS, DNS, wrong URL, etc.)
// and signUp/signIn will fail with the same root cause.
// ============================================================
if (isSupabaseConfigured && typeof window !== 'undefined' && supabaseUrl) {
  const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`;
  // eslint-disable-next-line no-console
  console.log('[supabase] connectivity check →', healthUrl);
  fetch(healthUrl, { method: 'GET', headers: { apikey: supabaseAnonKey ?? '' } })
    .then(async (res) => {
      const body = await res.text().catch(() => '<no body>');
      // eslint-disable-next-line no-console
      console.log('[supabase] connectivity check ←', {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        body: body.slice(0, 200),
      });
    })
    .catch((err) => {
      console.error('[supabase] connectivity check FAILED:', {
        name: err?.name,
        message: err?.message,
        cause: err?.cause,
        stack: err?.stack?.slice(0, 400),
        toString: String(err),
      });
      console.error(
        '[supabase] If this says "Failed to fetch" — the URL is unreachable from the browser. ' +
          'Likely causes: typo in env var, project paused, or ad-blocker/extension.',
      );
    });
}

export type Profile = {
  id: string;
  full_name: string;
  business_name: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
};
