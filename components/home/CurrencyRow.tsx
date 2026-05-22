import { ScrollView, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui';
import { currencies, toIls } from '@/data/mockData';
import type { Balance } from '@/types';
import { formatCurrency, formatIls } from '@/lib/format';

type Props = {
  balances: Balance[];
};

export function CurrencyRow({ balances }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
    >
      {balances.map((b) => {
        const c = currencies[b.currency];
        const ilsEquiv = toIls(b.amount, b.currency);
        return (
          <GlassCard key={b.currency} variant="subtle">
            <View className="p-4 w-40">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">{c.flag}</Text>
                <Text className="text-white/60 font-heebo-medium text-sm">{c.code}</Text>
              </View>
              <Text className="text-white font-heebo-bold text-lg" numberOfLines={1}>
                {formatCurrency(b.amount, b.currency)}
              </Text>
              {b.currency !== 'ILS' && (
                <Text className="text-white/50 font-heebo text-xs mt-1">
                  ≈ {formatIls(ilsEquiv)}
                </Text>
              )}
            </View>
          </GlassCard>
        );
      })}
    </ScrollView>
  );
}
