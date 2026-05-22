import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/gradients';

type Variant = 'subtle' | 'strong' | 'primary' | 'mint' | 'accent';

type Props = {
  children: ReactNode;
  variant?: Variant;
  onPress?: () => void;
  className?: string;
};

const variantBgClass: Record<Variant, string> = {
  subtle: 'bg-glass',
  strong: 'bg-glass-strong',
  primary: 'bg-glass',
  mint: 'bg-glass',
  accent: 'bg-glass',
};

const variantOverlay: Record<Variant, keyof typeof gradients | null> = {
  subtle: null,
  strong: null,
  primary: 'card',
  mint: 'mintSoft',
  accent: 'accentSoft',
};

export function GlassCard({ children, variant = 'subtle', onPress, className = '' }: Props) {
  const baseClass = `rounded-3xl border border-glass-border overflow-hidden ${variantBgClass[variant]} ${className}`;
  const overlay = variantOverlay[variant];

  const inner = (
    <>
      {overlay && (
        <LinearGradient
          colors={gradients[overlay]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={baseClass} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {inner}
      </Pressable>
    );
  }
  return <View className={baseClass}>{inner}</View>;
}
