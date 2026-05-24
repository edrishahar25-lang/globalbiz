import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Avatar, GradientBackground } from '@/components/ui';
import {
  OnboardingChecklist,
  WaitlistForm,
  WhyGlobalBiz,
} from '@/components/waitlist';
import { useAuth } from '@/providers/AuthProvider';
import { useWaitlist } from '@/hooks/useWaitlist';
import { computeInitials, displayName } from '@/lib/identity';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { applicants } = useWaitlist();

  const userName = displayName({ fullName: profile?.full_name, email: user?.email });
  const userInitials = computeInitials(userName);
  const hasWaitlist = applicants.length > 0;
  const onboardingStatus = applicants[0]?.onboarding_status ?? null;

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Greeting */}
          <View className="flex-row items-center justify-between px-5 pt-3 pb-6">
            <View className="flex-1">
              <Text className="text-ink-soft font-heebo text-sm">{t('home.greeting')}</Text>
              <Text className="text-ink font-heebo-bold text-xl">{userName}</Text>
              <Text className="text-ink-faint font-heebo text-xs mt-1">
                {t('home.earlyAccessTagline')}
              </Text>
            </View>
            <Avatar initials={userInitials} seed={userName} size="md" flag="🇮🇱" />
          </View>

          {/* Onboarding checklist */}
          <View className="px-5 mb-6">
            <OnboardingChecklist
              hasAccount={!!user}
              hasProfile={!!profile?.full_name}
              hasWaitlist={hasWaitlist}
              status={onboardingStatus}
            />
          </View>

          {/* Waitlist form */}
          <View className="px-5 mb-6">
            <WaitlistForm />
          </View>

          {/* Why GlobalBiz */}
          <View className="px-5 mb-3">
            <Text className="text-ink font-heebo-bold text-lg">{t('why.sectionTitle')}</Text>
          </View>
          <View className="px-5">
            <WhyGlobalBiz />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
