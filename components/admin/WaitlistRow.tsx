import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react-native';
import { Avatar, GlassCard } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { colors } from '@/constants/colors';
import { computeInitials } from '@/lib/identity';
import { formatRelativeDate } from '@/lib/format';
import type { OnboardingStatus, WaitlistEntry } from '@/types';

type Props = {
  entry: WaitlistEntry;
  onUpdateStatus: (id: string, status: OnboardingStatus) => void;
  busy?: boolean;
};

function MiniBtn({
  label,
  onPress,
  variant,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant: 'approve' | 'reject';
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  const cls =
    variant === 'approve'
      ? 'bg-mint/20 border-mint/40'
      : 'bg-accent/15 border-accent/40';
  const textCls = variant === 'approve' ? 'text-mint' : 'text-accent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${cls} ${
        disabled ? 'opacity-50' : ''
      }`}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
      hitSlop={6}
    >
      {icon}
      <Text className={`font-heebo-medium text-xs ${textCls}`}>{label}</Text>
    </Pressable>
  );
}

export function WaitlistRow({ entry, onUpdateStatus, busy }: Props) {
  const { t } = useTranslation();
  const initials = computeInitials(entry.full_name);

  return (
    <GlassCard variant="subtle">
      <View className="p-4 gap-3">
        <View className="flex-row items-start gap-3">
          <Avatar initials={initials} seed={entry.full_name} size="md" />
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2">
              <Text
                className="text-white font-heebo-bold text-base flex-1"
                numberOfLines={1}
              >
                {entry.full_name}
              </Text>
              <StatusBadge status={entry.onboarding_status} />
            </View>
            <Text className="text-white/55 font-heebo text-xs mt-0.5" numberOfLines={1}>
              {entry.email}
            </Text>
            <Text className="text-white/45 font-heebo text-xs mt-1">
              {entry.country} · {t(`businessType.${entry.business_type}`)} ·{' '}
              {t(`incomeRange.${entry.monthly_income_range}`)}
            </Text>
            {entry.current_tools.length > 0 ? (
              <Text className="text-white/40 font-heebo text-xs mt-0.5" numberOfLines={1}>
                {entry.current_tools.map((tk) => t(`tools.${tk}`)).join(' · ')}
              </Text>
            ) : null}
            {entry.referral_source ? (
              <Text className="text-white/35 font-heebo text-[11px] mt-1" numberOfLines={1}>
                ↪ {entry.referral_source}
              </Text>
            ) : null}
            <Text className="text-white/35 font-heebo text-[10px] mt-1">
              {formatRelativeDate(entry.created_at)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 flex-wrap">
          <MiniBtn
            label={t('admin.approve')}
            onPress={() => onUpdateStatus(entry.id, 'approved')}
            variant="approve"
            disabled={busy || entry.onboarding_status === 'approved'}
            icon={<Check color={colors.mint} size={12} strokeWidth={2.8} />}
          />
          <MiniBtn
            label={t('admin.reject')}
            onPress={() => onUpdateStatus(entry.id, 'rejected')}
            variant="reject"
            disabled={busy || entry.onboarding_status === 'rejected'}
            icon={<X color={colors.accent} size={12} strokeWidth={2.8} />}
          />
        </View>
      </View>
    </GlassCard>
  );
}
