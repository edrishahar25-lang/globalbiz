import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/ui';
import { LockedFeatureCard } from '@/components/waitlist';

export default function ReceiveScreen() {
  const { t } = useTranslation();
  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-3 pb-5">
            <Text className="text-white font-heebo-black text-3xl">{t('tabs.receive')}</Text>
          </View>

          <View className="px-5">
            <LockedFeatureCard
              titleKey="locked.receiveTitle"
              subtitleKey="locked.receiveSubtitle"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
