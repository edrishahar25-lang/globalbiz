import { type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '@/constants/gradients';

type Variant = 'primary' | 'secondary' | 'mint' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const sizeStyles: Record<Size, { paddingVertical: number; paddingHorizontal: number }> = {
  sm: { paddingVertical: 10, paddingHorizontal: 16 },
  md: { paddingVertical: 16, paddingHorizontal: 22 },
  lg: { paddingVertical: 20, paddingHorizontal: 26 },
};

const textSizeClass: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const variantGradient: Record<Exclude<Variant, 'secondary'>, keyof typeof gradients> = {
  primary: 'primary',
  mint: 'mint',
  danger: 'danger',
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  className = '',
}: Props) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress();
  };

  const labelNode = (
    <View className="flex-row items-center justify-center gap-2">
      {icon}
      <Text className={`font-heebo-bold text-white ${textSizeClass[size]}`}>{label}</Text>
    </View>
  );

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className={`rounded-2xl border border-glass-border bg-glass-strong items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
        style={({ pressed }) => [sizeStyles[size], pressed && { opacity: 0.8 }]}
      >
        {labelNode}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`rounded-2xl overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}
      style={({ pressed }) => pressed && { opacity: 0.9 }}
    >
      <LinearGradient
        colors={gradients[variantGradient[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ ...sizeStyles[size], alignItems: 'center', justifyContent: 'center' }}
      >
        {labelNode}
      </LinearGradient>
    </Pressable>
  );
}
