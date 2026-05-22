import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: env vars are inlined by Metro at BUILD time. They are only
// inlined if they have the EXPO_PUBLIC_ prefix. Trimming defensively in
// case the value has accidental whitespace from a copy-paste.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// ---------- JWT inspection (no signature verification — just decode) ----------
type JwtPayload = {
  role?: string;
  ref?: string;
  iss?: string;
  iat?: number;
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]!;
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(b64)
        : typeof Buffer !== 'undefined'
          ? Buffer.from(b64, 'base64').toString('utf-8')
          : null;
    if (!json) return null;
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function extractRefFromUrl(url: string): string | null {
  const m = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co\/?$/);
  return m ? (m[1] ?? null) : null;
}

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
// SECURITY: we print the first 15 chars of the key (always the JWT
// header "eyJhbGciOiJI...") and the JWT *payload* (role/ref/iat/exp
// — no signing material). We never print the full key.
// ============================================================
const keyPayload = supabaseAnonKey ? decodeJwtPayload(supabaseAnonKey) : null;
const urlRef = supabaseUrl ? extractRefFromUrl(supabaseUrl) : null;
const keyRef = keyPayload?.ref ?? null;
const keyRole = keyPayload?.role ?? null;
const keyExp = keyPayload?.exp ?? null;
const keyIat = keyPayload?.iat ?? null;
const refMatch: boolean | null = urlRef && keyRef ? urlRef === keyRef : null;

const initSummary = {
  urlSet: Boolean(supabaseUrl),
  urlLength: supabaseUrl?.length ?? 0,
  urlPrefix: supabaseUrl ? supabaseUrl.slice(0, 40) : null,
  urlRef,
  urlLooksValid,
  keySet: Boolean(supabaseAnonKey),
  keyLength: supabaseAnonKey?.length ?? 0,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.slice(0, 15) : null,
  keyRole, // ⚠ must be "anon" — never "service_role"
  keyRef, // ⚠ must equal urlRef
  refMatch, // true if key was issued for the same project as the URL
  keyIssuedAt: keyIat ? new Date(keyIat * 1000).toISOString() : null,
  keyExpiresAt: keyExp ? new Date(keyExp * 1000).toISOString() : null,
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
if (supabaseAnonKey && !keyPayload) {
  console.error(
    '[supabase] Anon key could not be decoded as JWT — almost certainly TRUNCATED in the env var.',
    'Length:',
    supabaseAnonKey.length,
    '(a real Supabase anon key is ~220-280 chars).',
  );
}
if (keyRole && keyRole !== 'anon') {
  console.error(
    '[supabase] WRONG KEY TYPE — role is "' + keyRole + '" but must be "anon".',
    keyRole === 'service_role'
      ? 'You pasted the service_role key. NEVER ship that to the client. Use the "anon public" key from Settings → API.'
      : 'Use the "anon public" key from Supabase Settings → API.',
  );
}
if (refMatch === false) {
  console.error(
    '[supabase] PROJECT REF MISMATCH — your URL is for project "' +
      urlRef +
      '" but the anon key was issued for project "' +
      keyRef +
      '". The key is from a DIFFERENT Supabase project. Re-copy the anon key from the project whose URL you are using.',
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
