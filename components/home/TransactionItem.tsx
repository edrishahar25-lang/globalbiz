import { Platform, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui';
import type { Transaction } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/lib/format';

type Props = {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
};

export function TransactionItem({ transaction, onPress }: Props) {
  const isReceived = transaction.type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountClass = isReceived ? 'text-mint' : 'text-white';

  const handle = () => {
    if (!onPress) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress(transaction);
  };

  return (
    <Pressable
      onPress={handle}
      disabled={!onPress}
      className="flex-row items-center px-5 py-3.5 gap-3"
      style={({ pressed }) =>
        pressed && onPress ? { backgroundColor: 'rgba(255,255,255,0.04)' } : null
      }
    >
      <Avatar
        initials={transaction.counterparty.initials}
        seed={transaction.counterparty.name}
        flag={transaction.counterparty.flag}
        size="md"
      />
      <View className="flex-1">
        <Text className="text-white font-heebo-medium text-base" numberOfLines={1}>
          {transaction.counterparty.name}
        </Text>
        <Text className="text-white/45 font-heebo text-xs mt-0.5" numberOfLines={1}>
          {transaction.description}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`${amountClass} font-heebo-bold text-base`}>
          {sign}
          {formatCurrency(transaction.amount, transaction.currency)}
        </Text>
        <Text className="text-white/40 font-heebo text-xs mt-0.5">
          {formatRelativeDate(transaction.date)}
        </Text>
      </View>
    </Pressable>
  );
}
