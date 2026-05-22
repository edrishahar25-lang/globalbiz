import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, TrendingUp } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatIls } from '@/lib/format';
import type { AiInsight } from '@/types';

type Variant = 'primary' | 'accent' | 'subtle';

const STYLE: Record<AiInsight['type'], {
  cardVariant: Variant;
  icon: ReactNode;
  labelClass: string;
}> = {
  opportunity: {
    cardVariant: 'primary',
    icon: <TrendingUp color={colors.violetGlow} size={14} strokeWidth={2.5} />,
    labelClass: 'text-violet-glow',
  },
  warning: {
    cardVariant: 'accent',
    icon: <AlertTriangle color={colors.accent} size={14} strokeWidth={2.5} />,
    labelClass: 'text-accent',
  },
  info: {
    cardVariant: 'subtle',
    icon: <Info color={colors.cyanBase} size={14} strokeWidth={2.5} />,
    labelClass: 'text-cyan-base',
  },
};

type Props = {
  insight: AiInsight;
};

export function AiInsightCard({ insight }: Props) {
  const { t } = useTranslation();
  const style = STYLE[insight.type];

  return (
    <GlassCard variant={style.cardVariant}>
      <View className="p-4">
        <View className="flex-row items-center gap-1.5 mb-2">
          {style.icon}
          <Text
            className={`font-heebo-medium text-[11px] uppercase tracking-wide ${style.labelClass}`}
          >
            {t(`profile.insightTypes.${insight.type}`)}
          </Text>
        </View>
        <Text className="text-white font-heebo-bold text-base mb-1">{insight.title}</Text>
        <Text className="text-white/65 font-heebo text-xs leading-5">{insight.description}</Text>
        {insight.potentialSavingsIls && (
          <View className="flex-row items-center gap-1.5 mt-3 bg-mint/15 self-start px-2.5 py-1.5 rounded-full">
            <TrendingUp color={colors.mint} size={12} strokeWidth={2.5} />
            <Text className="text-mint font-heebo-bold text-xs">
              {t('profile.potentialSavings', {
                amount: formatIls(insight.potentialSavingsIls),
              })}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}
