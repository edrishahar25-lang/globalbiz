import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileBarChart, Sparkles } from 'lucide-react-native';
import { EmptyState, GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';

// Phase 2: no real tax data is tracked yet. The card just announces
// the future capability — no fake numbers, no fake AI insights.
export function TaxReportCard() {
  const { t } = useTranslation();
  return (
    <GlassCard variant="subtle">
      <View className="p-5">
        <View className="flex-row items-center gap-2 mb-2">
          <Sparkles color={colors.violetGlow} size={16} strokeWidth={2.5} />
          <Text className="text-white font-heebo-bold text-base">{t('profile.taxReport')}</Text>
        </View>
        <EmptyState
          compact
          icon={<FileBarChart color={colors.violetGlow} size={24} strokeWidth={1.8} />}
          title={t('empty.taxReport')}
          subtitle={t('empty.taxReportSubtitle')}
        />
      </View>
    </GlassCard>
  );
}
