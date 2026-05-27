import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { StatusBanner, type Status } from '@/components/auth/StatusBanner';
import { useAuth } from '@/providers/AuthProvider';
import { translateAuthError } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REDIRECT_AFTER_EMAIL_CONFIRM_MS = 3000;

/** Network / timeout / silent-failure errors — show the "check your
 *  connection and retry" message rather than a cryptic raw string. */
function isConnectionError(raw: string): boolean {
  const m = (raw || '').toLowerCase();
  return (
    raw === 'auth/timeout' ||
    raw === 'auth/no-user' ||
    m.includes('failed to fetch') ||
    m.includes('network') ||
    m.includes('timeout') ||
    m.includes('econnrefused') ||
    m.includes('err_internet_disconnected') ||
    m.includes('typeerror')
  );
}

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signUp, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = t('auth.nameRequired');
    if (!EMAIL_RE.test(email.trim())) e.email = t('auth.emailInvalid');
    if (password.length < 8) e.password = t('auth.passwordTooShort');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    console.log('[signup] handleSubmit START', {
      email: email.trim(),
      fullName: fullName.trim(),
      hasBusinessName: Boolean(businessName.trim()),
      passwordLength: password.length,
      configured,
    });

    setStatus(null);

    if (!configured) {
      console.warn('[signup] Supabase not configured — env vars missing on this deploy');
      setStatus({ kind: 'error', message: t('auth.notConfiguredBody') });
      return;
    }

    if (!validate()) {
      console.warn('[signup] client-side validation failed');
      return;
    }

    setLoading(true);
    setStatus({ kind: 'loading', message: t('auth.creatingAccount') });

    try {
      console.log('[signup] calling supabase signUp...');
      const { error } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        businessName: businessName.trim() || undefined,
        preferredLanguage: i18n.language,
      });

      if (error) {
        // Full detail to DevTools so we can diagnose future silent failures.
        console.error('[signup] signUp FAILED — no account created. Full error:', {
          error,
          email: email.trim(),
        });
        setLoading(false);
        const message = isConnectionError(error)
          ? t('auth.signupFailedConnection')
          : translateAuthError(error, t);
        // Fields are intentionally NOT cleared — the user can fix/retry.
        setStatus({ kind: 'error', message });
        return;
      }

      console.log('[signup] signUp confirmed a user — checking session');
      const { data: sessionData } = await supabase.auth.getSession();
      const hasSession = Boolean(sessionData.session);
      console.log('[signup] session check:', { hasSession });

      setLoading(false);

      if (hasSession) {
        // Email confirmation is disabled — user has a session now.
        // Root navigator (useSegments effect) will redirect to / automatically.
        setStatus({ kind: 'success', message: t('auth.signupSuccessHasSession') });
        return;
      }

      // Email confirmation required.
      setStatus({ kind: 'success', message: t('auth.checkEmailBody') });
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, REDIRECT_AFTER_EMAIL_CONFIRM_MS);
    } catch (err) {
      console.error('[signup] handleSubmit threw — full error detail:', err);
      setLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      const message = isConnectionError(msg)
        ? t('auth.signupFailedConnection')
        : translateAuthError(msg, t);
      // Fields are intentionally NOT cleared — the user can fix/retry.
      setStatus({ kind: 'error', message });
    }
  };

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6 mt-2">
              <Text className="text-ink font-heebo-black text-4xl mb-2">
                {t('auth.createAccount')}
              </Text>
              <Text className="text-ink-soft font-heebo text-base">
                {t('auth.subtitleSignup')}
              </Text>
            </View>

            <StatusBanner status={status} />

            {status?.kind === 'error' ? (
              <View className="mb-4 -mt-1">
                <PrimaryButton
                  label={t('auth.retry')}
                  onPress={handleSubmit}
                  variant="secondary"
                  size="md"
                  disabled={loading}
                />
              </View>
            ) : null}

            <View className="gap-4">
              <AuthInput
                label={t('auth.fullName')}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('auth.fullNamePlaceholder')}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                editable={!loading}
                error={errors.fullName}
              />
              <AuthInput
                label={t('auth.businessName')}
                hint={t('auth.businessNameOptional')}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder={t('auth.businessNamePlaceholder')}
                autoCapitalize="words"
                autoComplete="organization"
                editable={!loading}
              />
              <AuthInput
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
                error={errors.email}
              />
              <AuthInput
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
                error={errors.password}
              />
            </View>

            <View className="mt-7">
              <PrimaryButton
                label={loading ? t('auth.creatingAccount') : t('auth.signupCta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
            </View>

            <View className="flex-row items-center justify-center gap-1.5 mt-6">
              <Text className="text-ink-soft font-heebo text-sm">{t('auth.haveAccount')}</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8} disabled={loading}>
                  <Text className="text-violet-glow font-heebo-bold text-sm">
                    {t('auth.signInHere')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
