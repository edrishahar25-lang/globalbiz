import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OnboardingStatus } from '@/types';

const STYLE: Record<OnboardingStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-ink-faint/15', text: 'text-ink-soft' },
  reviewing: { bg: 'bg-cyan-base/15', text: 'text-violet-deep' },
  approved: { bg: 'bg-mint/15', text: 'text-mint' },
  rejected: { bg: 'bg-accent/15', text: 'text-accent' },
};

export function StatusBadge({ status }: { status: OnboardingStatus }) {
  const { t } = useTranslation();
  const s = STYLE[status];
  return (
    <View className={`self-start px-2 py-1 rounded-full ${s.bg}`}>
      <Text className={`font-heebo-medium text-[11px] ${s.text}`}>
        {t(`admin.status.${status}`)}
      </Text>
    </View>
  );
}
