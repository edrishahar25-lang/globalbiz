import { Text, View } from 'react-native';
import { currencies } from '@/data/mockData';
import type { CurrencyCode } from '@/types';

type Variant = 'flag' | 'flagSymbol' | 'flagCode' | 'full';

type Props = {
  currency: CurrencyCode;
  variant?: Variant;
  className?: string;
  textClassName?: string;
};

export function CurrencyFlag({
  currency,
  variant = 'flag',
  className = '',
  textClassName = 'text-white font-heebo-medium',
}: Props) {
  const c = currencies[currency];
  return (
    <View className={`flex-row items-center gap-1.5 ${className}`}>
      <Text className="text-base">{c.flag}</Text>
      {variant === 'flagSymbol' && <Text className={textClassName}>{c.symbol}</Text>}
      {variant === 'flagCode' && <Text className={textClassName}>{c.code}</Text>}
      {variant === 'full' && (
        <Text className={textClassName}>
          {c.code} {c.symbol}
        </Text>
      )}
    </View>
  );
}
