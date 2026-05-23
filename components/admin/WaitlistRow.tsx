import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Avatar, GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { StatusBadge } from './StatusBadge';
import { SegmentedControl } from './SegmentedControl';
import { computeInitials } from '@/lib/identity';
import { formatRelativeDate } from '@/lib/format';
import {
  EARLY_ACCESS_PRIORITIES,
  type EarlyAccessPriority,
  type OnboardingStatus,
  type WaitlistEntry,
} from '@/types';

const STATUS_VALUES: OnboardingStatus[] = ['pending', 'approved', 'rejected'];

type Props = {
  entry: WaitlistEntry;
  onUpdateStatus: (id: string, status: OnboardingStatus) => void;
  onUpdatePriority: (id: string, priority: EarlyAccessPriority) => void;
  onOpen?: (id: string) => void;
  busy?: boolean;
};

export function WaitlistRow({ entry, onUpdateStatus, onUpdatePriority, onOpen, busy }: Props) {
  const { t } = useTranslation();
  const initials = computeInitials(entry.full_name);

  const statusOpts = useMemo(
    () => STATUS_VALUES.map((s) => ({ value: s, label: t(`admin.status.${s}`) })),
    [t],
  );
  const priorityOpts = useMemo(
    () =>
      EARLY_ACCESS_PRIORITIES.map((p) => ({
        value: p,
        label: t(`admin.priority.${p}`),
      })),
    [t],
  );

  return (
    <GlassCard variant="subtle">
      <View className="p-4 gap-3.5">
        <Pressable
          onPress={onOpen ? () => onOpen(entry.id) : undefined}
          className="flex-row items-start gap-3"
          style={({ pressed }) => pressed && onOpen && { opacity: 0.6 }}
        >
          <Avatar initials={initials} seed={entry.full_name} size="md" />
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2">
              <Text
                className="text-ink font-heebo-bold text-base flex-1"
                numberOfLines={1}
              >
                {entry.full_name}
              </Text>
              <StatusBadge status={entry.onboarding_status} />
              {onOpen ? <ChevronLeft color={colors.muted} size={18} strokeWidth={2.4} /> : null}
            </View>
            <Text className="text-ink-soft font-heebo text-xs mt-0.5" numberOfLines={1}>
              {entry.email}
            </Text>
            <Text className="text-ink-faint font-heebo text-xs mt-1">
              {entry.country} · {t(`businessType.${entry.business_type}`)} ·{' '}
              {t(`incomeRange.${entry.monthly_income_range}`)}
            </Text>
            <Text className="text-ink-faint font-heebo text-xs mt-0.5">
              {t('admin.colInternational')}:{' '}
              {entry.works_internationally ? t('common.yes') : t('common.no')}
            </Text>
            {entry.current_tools.length > 0 ? (
              <Text className="text-ink-faint font-heebo text-xs mt-0.5" numberOfLines={1}>
                {entry.current_tools.map((tk) => t(`tools.${tk}`)).join(' · ')}
              </Text>
            ) : null}
            {entry.referral_source ? (
              <Text className="text-ink-faint font-heebo text-[11px] mt-1" numberOfLines={1}>
                ↪ {entry.referral_source}
              </Text>
            ) : null}
            <Text className="text-ink-faint font-heebo text-[10px] mt-1">
              {formatRelativeDate(entry.created_at)}
            </Text>
          </View>
        </Pressable>

        <SegmentedControl<OnboardingStatus>
          label={t('admin.colStatus')}
          options={statusOpts}
          value={entry.onboarding_status === 'reviewing' ? 'pending' : entry.onboarding_status}
          onChange={(v) => onUpdateStatus(entry.id, v)}
          disabled={busy}
        />
        <SegmentedControl<EarlyAccessPriority>
          label={t('admin.colPriority')}
          options={priorityOpts}
          value={entry.early_access_priority}
          onChange={(v) => onUpdatePriority(entry.id, v)}
          activeClass="bg-mint/30"
          disabled={busy}
        />
      </View>
    </GlassCard>
  );
}
