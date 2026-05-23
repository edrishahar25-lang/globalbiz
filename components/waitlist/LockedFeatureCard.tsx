import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';

type Props = {
  titleKey: string;
  subtitleKey: string;
};

/** Used in /receive and /send tabs while the feature is gated behind
 *  early-access approval. Honest about the locked state — no fake UI
 *  underneath. */
export function LockedFeatureCard({ titleKey, subtitleKey }: Props) {
  const { t } = useTranslation();
  return (
    <GlassCard variant="subtle">
      <View className="p-7 items-center">
        <View className="w-14 h-14 rounded-full bg-glass-strong border border-glass-border items-center justify-center mb-4">
          <Lock color={colors.muted} size={24} strokeWidth={2} />
        </View>
        <Text className="text-ink font-heebo-bold text-lg text-center">
          {t(titleKey)}
        </Text>
        <Text className="text-ink-soft font-heebo text-sm text-center mt-2 leading-5">
          {t(subtitleKey)}
        </Text>
      </View>
    </GlassCard>
  );
}
