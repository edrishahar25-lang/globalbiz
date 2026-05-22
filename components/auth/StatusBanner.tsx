import { ActivityIndicator, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export type Status = { kind: 'loading' | 'error' | 'success'; message: string } | null;

type Props = { status: Status };

/** Always-visible inline status row. Works on web + native; doesn't rely on
 * Alert.alert which is unreliable for multi-button alerts on RN Web. */
export function StatusBanner({ status }: Props) {
  if (!status) return null;

  if (status.kind === 'loading') {
    return (
      <View className="flex-row items-center gap-2.5 bg-violet-base/20 border border-violet-glow/40 rounded-2xl px-4 py-3 mb-4">
        <ActivityIndicator size="small" color={colors.violetGlow} />
        <Text className="text-violet-glow font-heebo-medium text-sm flex-1">
          {status.message}
        </Text>
      </View>
    );
  }
  if (status.kind === 'error') {
    return (
      <View className="flex-row items-start gap-2.5 bg-accent/15 border border-accent/40 rounded-2xl px-4 py-3 mb-4">
        <AlertCircle color={colors.accent} size={18} strokeWidth={2.4} />
        <Text className="text-accent font-heebo-medium text-sm flex-1">{status.message}</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-start gap-2.5 bg-mint/15 border border-mint/40 rounded-2xl px-4 py-3 mb-4">
      <CheckCircle2 color={colors.mint} size={18} strokeWidth={2.4} />
      <Text className="text-mint font-heebo-medium text-sm flex-1">{status.message}</Text>
    </View>
  );
}
