import type { TFunction } from 'i18next';

/** Translate a raw Supabase auth error string to a localized message. */
export function translateAuthError(rawMessage: string, t: TFunction): string {
  const msg = (rawMessage || '').toLowerCase();

  // Sentinel from AuthProvider for missing env vars
  if (rawMessage === 'auth/not-configured') return t('auth.notConfiguredBody');

  // Common Supabase Auth errors (https://supabase.com/docs/guides/auth/auth-errors)
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return t('authErrors.alreadyRegistered');
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return t('authErrors.invalidCredentials');
  }
  if (msg.includes('email not confirmed')) {
    return t('authErrors.emailNotConfirmed');
  }
  if (msg.includes('password') && msg.includes('character')) {
    return t('authErrors.passwordTooShort');
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return t('authErrors.rateLimit');
  }
  if (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('typeerror')
  ) {
    return t('authErrors.networkError');
  }
  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return t('authErrors.signupDisabled');
  }

  // Unknown: show the raw message so user can still debug
  return rawMessage || t('authErrors.unknown');
}
