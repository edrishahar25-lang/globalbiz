import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// USER-REQUESTED DIAGNOSTIC — printed BEFORE anything else at module load.
// Look for this in the browser console immediately after page load.
// =========================================================================
// eslint-disable-next-line no-console
console.log('[supabase env]', {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  keyExists: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

// =========================================================================
// Read env vars. Metro inlines these at BUILD time (only EXPO_PUBLIC_*).
// Trim defensively in case of copy-paste whitespace.
// =========================================================================
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// =========================================================================
// Fail loudly but DO NOT crash the bundle. A missing env var is a deploy
// config problem, not a code bug — throwing here at module top-level would
// blow up the very first import (AuthProvider) and blank the entire app
// with no on-screen explanation. Instead we flip isSupabaseConfigured off;
// every call site already guards on it, and _layout renders a visible
// "not configured" screen so the operator sees exactly what to fix.
// =========================================================================
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseConfigError: string | null = isSupabaseConfigured
  ? null
  : '[supabase] missing required env var(s): ' +
    [
      !supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
      !supabaseAnonKey && 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ]
      .filter(Boolean)
      .join(', ') +
    '. Set them in Netlify → Site config → Environment variables ' +
    '(or .env.local for local dev) and redeploy with "Clear cache and deploy site".';

if (supabaseConfigError) {
  // eslint-disable-next-line no-console
  console.error(supabaseConfigError);
}

// =========================================================================
// JWT inspection (decode only — no signature verification). The decoded
// payload tells us the project ref + role + expiry, which catches the
// three most common 401 root causes:
//   * key is service_role (must be anon)
//   * key was issued for a different Supabase project
//   * key was truncated in the env-var input
// =========================================================================
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
  const m = url.match(/^https:\/\/([a-zA-Z0-9-]+)\.supabase\.co\/?$/);
  return m ? (m[1] ?? null) : null;
}

function buildClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Not configured. Return a harmless stub so the bundle still loads —
    // every call site guards on isSupabaseConfigured, so this client is
    // never actually used for a network request.
    return createClient('https://unconfigured.supabase.co', 'unconfigured', {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  }

  const keyPayload = decodeJwtPayload(supabaseAnonKey);
  const urlRef = extractRefFromUrl(supabaseUrl);
  const keyRef = keyPayload?.ref ?? null;
  const keyRole = keyPayload?.role ?? null;
  const refMatch: boolean | null = urlRef && keyRef ? urlRef === keyRef : null;

  // eslint-disable-next-line no-console
  console.log('[supabase] init', {
    urlLength: supabaseUrl.length,
    urlPrefix: supabaseUrl.slice(0, 40),
    urlRef,
    keyLength: supabaseAnonKey.length,
    keyPrefix: supabaseAnonKey.slice(0, 15),
    keyRole, // must be "anon"
    keyRef, // must equal urlRef
    refMatch,
    keyIssuedAt: keyPayload?.iat ? new Date(keyPayload.iat * 1000).toISOString() : null,
    keyExpiresAt: keyPayload?.exp ? new Date(keyPayload.exp * 1000).toISOString() : null,
    runtime: typeof window === 'undefined' ? 'server/native' : 'browser',
    bundler: 'expo/metro',
  });

  if (!keyPayload) {
    console.error(
      '[supabase] Anon key could not be decoded as JWT — almost certainly TRUNCATED in the env var. Length:',
      supabaseAnonKey.length,
      '(a real Supabase anon key is 220-280 chars).',
    );
  }
  if (keyRole && keyRole !== 'anon') {
    console.error(
      '[supabase] WRONG KEY TYPE — role is "' + keyRole + '" but must be "anon". ' +
        (keyRole === 'service_role'
          ? 'You pasted the service_role key. NEVER ship that to the client.'
          : 'Use the "anon public" key from Supabase Settings → API.'),
    );
  }
  if (refMatch === false) {
    console.error(
      '[supabase] PROJECT REF MISMATCH — URL is for project "' +
        urlRef +
        '" but the anon key was issued for project "' +
        keyRef +
        '". Re-copy the anon key from the project whose URL you are using.',
    );
  }

  // Connectivity probe — runs once on browser load to verify the URL is
  // reachable, isolating "URL is down" from "auth call failed".
  if (typeof window !== 'undefined') {
    const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`;
    // eslint-disable-next-line no-console
    console.log('[supabase] connectivity check →', healthUrl);
    fetch(healthUrl, { method: 'GET', headers: { apikey: supabaseAnonKey } })
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
        });
      });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase: SupabaseClient = buildClient();

export type Profile = {
  id: string;
  full_name: string;
  business_name: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
};
