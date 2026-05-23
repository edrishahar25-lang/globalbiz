import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatIls } from '@/lib/format';

type Props = {
  totalIls: number;
  changePercent?: number;
};

export function BalanceHero({ totalIls, changePercent }: Props) {
  const { t } = useTranslation();
  const showChange = typeof changePercent === 'number' && changePercent !== 0;
  return (
    <GlassCard variant="primary">
      <View className="p-6">
        <Text className="text-white/70 font-heebo text-sm mb-2">{t('home.totalBalance')}</Text>
        <Text className="text-white font-heebo-black text-5xl tracking-tight">
          {formatIls(totalIls)}
        </Text>
        {showChange ? (
          <View className="flex-row items-center gap-1.5 mt-3">
            <TrendingUp color={colors.mint} size={16} strokeWidth={2.5} />
            <Text className="text-mint font-heebo-medium text-sm">
              {t('home.changeFromLastMonth', { percent: changePercent.toFixed(1) })}
            </Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}
