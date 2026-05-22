import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import {
  Bell,
  Download,
  Fingerprint,
  Globe,
  LogOut,
  Shield,
  ShieldCheck,
} from 'lucide-react-native';
import { GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import {
  AiInsightCard,
  LanguageSelector,
  SettingsRow,
  SettingsToggleRow,
  TaxAuthorityCard,
  TaxReportCard,
  UserCard,
} from '@/components/profile';
import { taxReport } from '@/data/mockData';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [biometricOn, setBiometricOn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOutConfirmTitle'),
      t('profile.signOutConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut();
              // AuthProvider state change triggers root redirect to (auth)/login
            } catch (err) {
              console.warn('[profile.signOut] failed', err);
              Alert.alert(t('auth.signOutFailed'));
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  };

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-3 pb-5">
            <Text className="text-white font-heebo-black text-3xl">{t('profile.title')}</Text>
          </View>

          <View className="px-5 mb-6">
            <UserCard />
          </View>

          <View className="px-5 mb-3 flex-row items-center gap-2">
            <Shield color={colors.mint} size={18} strokeWidth={2.4} />
            <Text className="text-white font-heebo-bold text-lg">
              🇮🇱 {t('profile.taxAuthoritySection')}
            </Text>
          </View>
          <View className="px-5 mb-6">
            <TaxAuthorityCard />
          </View>

          <View className="px-5 mb-6">
            <TaxReportCard />
          </View>

          <View className="px-5 mb-3">
            <Text className="text-white font-heebo-bold text-lg">{t('profile.aiInsights')}</Text>
          </View>
          <View className="px-5 gap-2.5 mb-6">
            {taxReport.aiInsights.map((insight) => (
              <AiInsightCard key={insight.id} insight={insight} />
            ))}
          </View>

          <View className="px-5 mb-3">
            <Text className="text-white font-heebo-bold text-lg">{t('profile.settings')}</Text>
          </View>
          <View className="px-5 mb-6">
            <GlassCard variant="subtle">
              <SettingsToggleRow
                icon={<Bell color={colors.violetGlow} size={18} strokeWidth={2.2} />}
                label={t('profile.notifications')}
                value={notificationsOn}
                onValueChange={setNotificationsOn}
              />
              <View className="h-px bg-glass-border mx-5" />
              <SettingsToggleRow
                icon={<Fingerprint color={colors.cyanBase} size={18} strokeWidth={2.2} />}
                label={t('profile.biometricLogin')}
                value={biometricOn}
                onValueChange={setBiometricOn}
              />
              <View className="h-px bg-glass-border mx-5" />
              <SettingsRow
                icon={<ShieldCheck color={colors.mint} size={18} strokeWidth={2.2} />}
                label={t('profile.security')}
                onPress={() => Alert.alert(t('demo.securityTitle'), t('demo.securityBody'))}
              />
              <View className="h-px bg-glass-border mx-5" />
              <SettingsRow
                icon={<Download color={colors.accent} size={18} strokeWidth={2.2} />}
                label={t('profile.exportData')}
                onPress={() => Alert.alert(t('demo.exportTitle'), t('demo.exportBody'))}
              />
            </GlassCard>
          </View>

          <View className="px-5 mb-3 flex-row items-center gap-2">
            <Globe color={colors.violetGlow} size={18} strokeWidth={2.2} />
            <Text className="text-white font-heebo-bold text-lg">{t('profile.language')}</Text>
          </View>
          <View className="px-5 mb-3">
            <LanguageSelector />
          </View>
          <Text className="text-white/45 font-heebo text-xs px-6 mb-6">
            {t('profile.needsReload')}
          </Text>

          <View className="px-5">
            <PrimaryButton
              label={signingOut ? t('profile.signOut') + '...' : t('profile.signOut')}
              onPress={handleSignOut}
              variant="secondary"
              size="md"
              disabled={signingOut}
              icon={<LogOut color={colors.white} size={18} strokeWidth={2.2} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
