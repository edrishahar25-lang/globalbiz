import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileBarChart, Sparkles } from 'lucide-react-native';
import { EmptyState, GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatIls } from '@/lib/format';
import { taxReport } from '@/data/mockData';

function Row({
  label,
  value,
  emphasize,
  negative,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  negative?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={`font-heebo ${emphasize ? 'text-white font-heebo-bold text-base' : 'text-white/65 text-sm'}`}
      >
        {label}
      </Text>
      <Text
        className={`font-heebo-bold ${emphasize ? 'text-white text-base' : negative ? 'text-accent text-sm' : 'text-white/90 text-sm'}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function TaxReportCard() {
  const { t } = useTranslation();

  if (!taxReport) {
    return (
      <GlassCard variant="subtle">
        <View className="p-5">
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles color={colors.violetGlow} size={16} strokeWidth={2.5} />
            <Text className="text-white font-heebo-bold text-base">
              {t('profile.taxReport')}
            </Text>
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

  const totalTax =
    taxReport.estimatedIncomeTaxIls +
    taxReport.estimatedBituachLeumiIls +
    taxReport.estimatedVatIls;

  return (
    <GlassCard variant="subtle">
      <View className="p-5">
        <View className="flex-row items-center gap-2 mb-1">
          <Sparkles color={colors.violetGlow} size={16} strokeWidth={2.5} />
          <Text className="text-white font-heebo-bold text-base">{t('profile.taxReport')}</Text>
        </View>
        <Text className="text-white/45 font-heebo text-xs mb-4">{taxReport.monthLabel}</Text>

        <Row label={t('profile.income')} value={formatIls(taxReport.totalIncomeIls)} />
        <Row
          label={t('profile.expenses')}
          value={`-${formatIls(taxReport.totalExpensesIls)}`}
          negative
        />
        <View className="h-px bg-glass-border my-1" />
        <Row label={t('profile.netProfit')} value={formatIls(taxReport.netProfitIls)} emphasize />

        <View className="h-px bg-glass-border my-3" />

        <Text className="text-white/45 font-heebo-medium text-[11px] uppercase tracking-wide mb-1.5">
          {t('profile.estimatedTax')}
        </Text>
        <Row label={t('profile.incomeTax')} value={formatIls(taxReport.estimatedIncomeTaxIls)} />
        <Row
          label={t('profile.bituachLeumi')}
          value={formatIls(taxReport.estimatedBituachLeumiIls)}
        />
        <Row label={t('profile.vat')} value={formatIls(taxReport.estimatedVatIls)} />
        <View className="h-px bg-glass-border my-1" />
        <Row label={t('profile.totalTax')} value={formatIls(totalTax)} emphasize />
      </View>
    </GlassCard>
  );
}
