import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuth } from '@/providers/AuthProvider';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updatePassword, configured } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const handleSubmit = async () => {
    const e: typeof errors = {};
    if (password.length < 8) e.password = t('auth.passwordTooShort');
    if (password !== confirm) e.confirm = t('auth.passwordTooShort');
    setErrors(e);
    if (Object.keys(e).length) return;

    if (!configured) {
      Alert.alert(t('auth.notConfiguredTitle'), t('auth.notConfiguredBody'));
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.updateFailedTitle'), error);
      return;
    }
    Alert.alert(t('auth.passwordUpdated'), t('auth.passwordUpdatedBody'), [
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
                {t('auth.newPasswordTitle')}
              </Text>
              <Text className="text-ink-soft font-heebo text-base">
                {t('auth.newPasswordSubtitle')}
              </Text>
            </View>

            <View className="gap-4">
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
              <AuthInput
                label={t('auth.password')}
                value={confirm}
                onChangeText={setConfirm}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
                editable={!loading}
                error={errors.confirm}
              />
            </View>

            <View className="mt-7">
              <PrimaryButton
                label={loading ? t('auth.sending') : t('auth.newPasswordCta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
