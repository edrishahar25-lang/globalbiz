import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { gradients } from '@/constants/gradients';

type Variant = 'bg' | 'bgRich' | 'primary' | 'primarySoft';

type Props = {
  children: ReactNode;
  variant?: Variant;
  decorative?: boolean;
};

export function GradientBackground({ children, variant = 'bg', decorative = true }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {decorative && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -120,
              left: -80,
              width: 320,
              height: 320,
              borderRadius: 160,
              backgroundColor: colors.violetBase,
              opacity: 0.22,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: -100,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: colors.cyanBase,
              opacity: 0.1,
            }}
          />
        </>
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
