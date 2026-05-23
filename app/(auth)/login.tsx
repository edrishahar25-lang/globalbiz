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
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { StatusBanner, type Status } from '@/components/auth/StatusBanner';
import { useAuth } from '@/providers/AuthProvider';
import { translateAuthError } from '@/lib/authErrors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const handleSubmit = async () => {
    console.log('[login] handleSubmit START', { email: email.trim(), configured });
    setStatus(null);

    if (!configured) {
      console.warn('[login] Supabase not configured');
      setStatus({ kind: 'error', message: t('auth.notConfiguredBody') });
      return;
    }
    if (!email.trim() || !password) {
      setStatus({ kind: 'error', message: t('auth.fillAllFields') });
      return;
    }

    setLoading(true);
    setStatus({ kind: 'loading', message: t('auth.loggingIn') });

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        console.warn('[login] supabase returned error:', error);
        setLoading(false);
        setStatus({ kind: 'error', message: translateAuthError(error, t) });
        return;
      }
      console.log('[login] success — root navigator will redirect to /');
      // Leave loading=true; the protected route navigator will swap us out.
      setStatus({ kind: 'success', message: t('auth.signupSuccessHasSession') });
    } catch (err) {
      console.error('[login] handleSubmit threw', err);
      setLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message: translateAuthError(msg, t) });
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
            contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-8">
              <Text className="text-ink font-heebo-black text-4xl mb-2">
                {t('auth.welcomeBack')}
              </Text>
              <Text className="text-ink-soft font-heebo text-base">
                {t('auth.subtitleLogin')}
              </Text>
            </View>

            <StatusBanner status={status} />

            <View className="gap-4">
              <AuthInput
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
              />
              <AuthInput
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable className="self-start" hitSlop={8} disabled={loading}>
                  <Text className="text-violet-glow font-heebo-medium text-sm">
                    {t('auth.forgotPassword')}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View className="mt-8">
              <PrimaryButton
                label={loading ? t('auth.loggingIn') : t('auth.loginCta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
            </View>

            <View className="flex-row items-center justify-center gap-1.5 mt-6">
              <Text className="text-ink-soft font-heebo text-sm">{t('auth.noAccount')}</Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable hitSlop={8} disabled={loading}>
                  <Text className="text-violet-glow font-heebo-bold text-sm">
                    {t('auth.signUpHere')}
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
