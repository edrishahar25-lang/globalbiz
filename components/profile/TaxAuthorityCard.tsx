import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldOff } from 'lucide-react-native';
import { GlassCard, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';

/** Production "not connected" state. Until the user wires up a real
 *  digital certificate with the Israeli Tax Authority, no cert /
 *  monthly stats are shown — those numbers are not mocked anymore. */
export function TaxAuthorityCard() {
  const { t } = useTranslation();

  const handleConnect = () => {
    Alert.alert(
      t('demo.manageConnectionTitle' as never, { defaultValue: t('profile.manageConnectionTitle') }),
      t('profile.manageConnectionBody'),
    );
  };

  return (
    <GlassCard variant="subtle">
      <View className="p-5 items-center">
        <View className="w-12 h-12 rounded-full bg-glass-strong border border-glass-border items-center justify-center mb-3">
          <ShieldOff color={colors.muted} size={22} strokeWidth={2} />
        </View>
        <Text className="text-white font-heebo-bold text-base text-center">
          {t('taxAuthority.notConnectedTitle')}
        </Text>
        <Text className="text-white/55 font-heebo text-xs text-center mt-1.5 leading-5">
          {t('taxAuthority.notConnectedSubtitle')}
        </Text>
        <View className="w-full max-w-xs mt-4">
          <PrimaryButton
            label={t('taxAuthority.connectCta')}
            onPress={handleConnect}
            variant="primary"
            size="sm"
          />
        </View>
      </View>
    </GlassCard>
  );
}
