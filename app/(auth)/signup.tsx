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
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { AuthInput } from '@/components/auth/AuthInput';
import { useAuth } from '@/providers/AuthProvider';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signUp, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
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
    if (!configured) {
      Alert.alert(t('auth.notConfiguredTitle'), t('auth.notConfiguredBody'));
      return;
    }
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      businessName: businessName.trim() || undefined,
      preferredLanguage: i18n.language,
    });
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.signupFailedTitle'), error);
      return;
    }
    Alert.alert(t('auth.checkEmailTitle'), t('auth.checkEmailBody'), [
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
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-8 mt-2">
              <Text className="text-white font-heebo-black text-4xl mb-2">
                {t('auth.createAccount')}
              </Text>
              <Text className="text-white/55 font-heebo text-base">
                {t('auth.subtitleSignup')}
              </Text>
            </View>

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

            <View className="mt-8">
              <PrimaryButton
                label={loading ? t('auth.creatingAccount') : t('auth.signupCta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={loading}
              />
            </View>

            <View className="flex-row items-center justify-center gap-1.5 mt-6">
              <Text className="text-white/55 font-heebo text-sm">{t('auth.haveAccount')}</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8}>
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
