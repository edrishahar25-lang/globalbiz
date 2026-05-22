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
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!configured) {
      Alert.alert(t('auth.notConfiguredTitle'), t('auth.notConfiguredBody'));
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.loginFailedTitle'), error);
    }
    // On success, AuthProvider state change triggers root layout redirect.
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
            <View className="mb-10">
              <Text className="text-white font-heebo-black text-4xl mb-2">
                {t('auth.welcomeBack')}
              </Text>
              <Text className="text-white/55 font-heebo text-base">
                {t('auth.subtitleLogin')}
              </Text>
            </View>

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
                <Pressable className="self-start" hitSlop={8}>
                  <Text className="text-violet-glow font-heebo-medium text-sm">
                    {t('auth.forgotPassword')}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View className="mt-8 gap-3">
              <PrimaryButton
                label={loading ? t('auth.loggingIn') : t('auth.loginCta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
            </View>

            <View className="flex-row items-center justify-center gap-1.5 mt-6">
              <Text className="text-white/55 font-heebo text-sm">{t('auth.noAccount')}</Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable hitSlop={8}>
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
