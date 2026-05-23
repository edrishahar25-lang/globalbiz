import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  cta?: { label: string; onPress: () => void };
  compact?: boolean;
};

/** Production empty-state cell. Used wherever a list/section has no
 * records yet — clarifies to the user that the absence is expected
 * and (optionally) offers a CTA to fix it. */
export function EmptyState({ icon, title, subtitle, cta, compact }: Props) {
  return (
    <View className={`items-center px-6 ${compact ? 'py-6' : 'py-10'}`}>
      {icon ? <View className="mb-3 opacity-70">{icon}</View> : null}
      <Text className="text-ink-soft font-heebo-medium text-sm text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-ink-faint font-heebo text-xs mt-1 text-center leading-5">
          {subtitle}
        </Text>
      ) : null}
      {cta ? (
        <View className="mt-4 w-full max-w-xs">
          <PrimaryButton label={cta.label} onPress={cta.onPress} variant="secondary" size="sm" />
        </View>
      ) : null}
    </View>
  );
}
