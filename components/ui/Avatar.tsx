import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { avatarGradientFor } from '@/constants/gradients';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  initials: string;
  seed?: string;
  size?: Size;
  flag?: string;
  className?: string;
};

const sizeMap: Record<Size, { box: number; font: number }> = {
  sm: { box: 36, font: 13 },
  md: { box: 48, font: 17 },
  lg: { box: 64, font: 22 },
  xl: { box: 88, font: 32 },
};

export function Avatar({ initials, seed, size = 'md', flag, className = '' }: Props) {
  const { box, font } = sizeMap[size];
  const flagBox = box * 0.38;
  const grad = avatarGradientFor(seed ?? initials);

  return (
    <View className={`relative ${className}`} style={{ width: box, height: box }}>
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: box,
          height: box,
          borderRadius: box / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: font,
            color: '#ffffff',
            fontFamily: 'Heebo_700Bold',
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </Text>
      </LinearGradient>
      {flag && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: flagBox,
            height: flagBox,
            borderRadius: flagBox / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.ink2,
            borderWidth: 2,
            borderColor: colors.ink,
          }}
        >
          <Text style={{ fontSize: flagBox * 0.65 }}>{flag}</Text>
        </View>
      )}
    </View>
  );
}
