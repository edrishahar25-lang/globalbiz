import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { Avatar, GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { currentUser } from '@/data/mockData';
import { useAuth } from '@/providers/AuthProvider';
import { computeInitials, displayName } from '@/lib/identity';

export function UserCard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const name = displayName({ fullName: profile?.full_name, email: user?.email });
  const initials = computeInitials(name);
  const businessName = profile?.business_name?.trim() || currentUser.businessName;
  // taxId + kyc are demo-only; not yet stored per-user in the database.
  const taxId = currentUser.taxId;
  const kycLabel = t(`profile.kyc.${currentUser.kycLevel}`);

  return (
    <GlassCard variant="primary">
      <View className="p-6 items-center">
        <Avatar initials={initials} seed={name} size="xl" flag="🇮🇱" />
        <Text className="text-white font-heebo-black text-2xl mt-4">{name}</Text>
        <Text className="text-white/70 font-heebo-medium text-base mt-0.5">{businessName}</Text>
        <View className="flex-row items-center gap-3 mt-3">
          <Text className="text-white/55 font-heebo text-xs">{taxId}</Text>
          {currentUser.kycLevel === 'verified' && (
            <View className="flex-row items-center gap-1 bg-mint/20 rounded-full px-2.5 py-1">
              <BadgeCheck color={colors.mint} size={12} strokeWidth={2.5} />
              <Text className="text-mint font-heebo-medium text-[11px]">{kycLabel}</Text>
            </View>
          )}
        </View>
        {user?.email ? (
          <Text className="text-white/40 font-heebo text-xs mt-2">{user.email}</Text>
        ) : null}
      </View>
    </GlassCard>
  );
}
