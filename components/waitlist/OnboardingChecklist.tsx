import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Lock } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import type { OnboardingStatus } from '@/types';

type ItemState = 'done' | 'pending' | 'locked';

type Props = {
  hasAccount: boolean;
  hasProfile: boolean;
  hasWaitlist: boolean;
  status: OnboardingStatus | null;
};

function StatusIcon({ state }: { state: ItemState }) {
  if (state === 'done') return <CheckCircle2 color={colors.mint} size={20} strokeWidth={2.4} />;
  if (state === 'pending') return <Clock color={colors.violetGlow} size={20} strokeWidth={2.4} />;
  return <Lock color={colors.muted} size={18} strokeWidth={2.4} />;
}

function Row({
  state,
  label,
  hint,
}: {
  state: ItemState;
  label: string;
  hint?: string;
}) {
  const textClass =
    state === 'done' ? 'text-white' : state === 'pending' ? 'text-white' : 'text-white/45';
  return (
    <View className="flex-row items-start gap-3 py-3">
      <View className="w-6 items-center pt-0.5">
        <StatusIcon state={state} />
      </View>
      <View className="flex-1">
        <Text className={`font-heebo-medium text-base ${textClass}`}>{label}</Text>
        {hint ? (
          <Text className="text-white/45 font-heebo text-xs mt-0.5">{hint}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function OnboardingChecklist({ hasAccount, hasProfile, hasWaitlist, status }: Props) {
  const { t } = useTranslation();

  const reviewState: ItemState =
    !hasWaitlist
      ? 'locked'
      : status === 'approved'
        ? 'done'
        : 'pending';
  const reviewLabel =
    status === 'approved'
      ? t('onboarding.earlyAccessGranted')
      : t('onboarding.earlyAccessReview');

  return (
    <GlassCard variant="subtle">
      <View className="p-5">
        <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mb-3">
          {t('onboarding.title')}
        </Text>
        <Row
          state={hasAccount ? 'done' : 'pending'}
          label={t('onboarding.accountCreated')}
        />
        <View className="h-px bg-glass-border" />
        <Row
          state={hasProfile ? 'done' : 'pending'}
          label={t('onboarding.profileCompleted')}
        />
        <View className="h-px bg-glass-border" />
        <Row
          state={hasWaitlist ? 'done' : 'pending'}
          label={t('onboarding.waitlistSubmitted')}
          hint={hasWaitlist ? undefined : t('onboarding.waitlistHint')}
        />
        <View className="h-px bg-glass-border" />
        <Row
          state={reviewState}
          label={reviewLabel}
          hint={
            reviewState === 'pending'
              ? t('onboarding.reviewHint')
              : undefined
          }
        />
        <View className="h-px bg-glass-border" />
        <Row state="locked" label={t('onboarding.bankingLocked')} />
        <View className="h-px bg-glass-border" />
        <Row state="locked" label={t('onboarding.taxAuthorityLocked')} />
      </View>
    </GlassCard>
  );
}
