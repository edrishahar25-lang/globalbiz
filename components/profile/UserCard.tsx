import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { Avatar, GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { currentUser } from '@/data/mockData';

export function UserCard() {
  const { t } = useTranslation();
  const kycLabel = t(`profile.kyc.${currentUser.kycLevel}`);

  return (
    <GlassCard variant="primary">
      <View className="p-6 items-center">
        <Avatar initials={currentUser.initials} seed={currentUser.name} size="xl" flag="🇮🇱" />
        <Text className="text-white font-heebo-black text-2xl mt-4">{currentUser.name}</Text>
        <Text className="text-white/70 font-heebo-medium text-base mt-0.5">
          {currentUser.businessName}
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <Text className="text-white/55 font-heebo text-xs">{currentUser.taxId}</Text>
          {currentUser.kycLevel === 'verified' && (
            <View className="flex-row items-center gap-1 bg-mint/20 rounded-full px-2.5 py-1">
              <BadgeCheck color={colors.mint} size={12} strokeWidth={2.5} />
              <Text className="text-mint font-heebo-medium text-[11px]">{kycLabel}</Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
}
