import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/constants/colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendPasswordReset, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!configured) {
      Alert.alert(t('auth.notConfiguredTitle'), t('auth.notConfiguredBody'));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('auth.emailInvalid'));
      return;
    }
    setLoading(true);
    const { error: err } = await sendPasswordReset(email.trim());
    setLoading(false);
    if (err) {
      Alert.alert(t('auth.resetPasswordFailedTitle'), err);
      return;
    }
    Alert.alert(t('auth.resetLinkSentTitle'), t('auth.resetLinkSentBody'), [
      { text: t('common.ok'), onPress: () => router.replace('/(auth)/login') },
    ]);
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
              <Text className="text-ink font-heebo-black text-3xl mb-2">
                {t('auth.resetPasswordTitle')}
              </Text>
              <Text className="text-ink-soft font-heebo text-base">
                {t('auth.resetPasswordSubtitle')}
              </Text>
            </View>

            <AuthInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
              error={error}
            />

            <View className="mt-7 gap-3">
              <PrimaryButton
                label={loading ? t('auth.sending') : t('auth.sendResetLink')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                className="flex-row items-center justify-center gap-2 py-3"
                hitSlop={8}
              >
                <ArrowRight color={colors.violetGlow} size={14} strokeWidth={2.4} />
                <Text className="text-violet-glow font-heebo-medium text-sm">
                  {t('auth.backToLogin')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
