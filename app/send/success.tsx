import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { GradientBackground, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { contacts } from '@/data/mockData';
import { formatCurrency } from '@/lib/format';
import type { CurrencyCode } from '@/types';

export default function SendSuccessScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { contactId, amount, currency } = useLocalSearchParams<{
    contactId: string;
    amount: string;
    currency: CurrencyCode;
  }>();

  const contact = contacts.find((c) => c.id === contactId);
  const parsed = parseFloat(amount ?? '0');
  const formatted = formatCurrency(parsed, currency ?? 'ILS');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(80, withSpring(1, { damping: 9, stiffness: 110 }));
    opacity.value = withTiming(1, { duration: 250 });
    textOpacity.value = withDelay(280, withTiming(1, { duration: 350 }));
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [opacity, scale, textOpacity]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View style={circleStyle}>
            <View className="w-32 h-32 rounded-full bg-mint/20 border-2 border-mint items-center justify-center">
              <CheckCircle2 color={colors.mint} size={72} strokeWidth={2.5} />
            </View>
          </Animated.View>

          <Animated.View style={[textStyle, { alignItems: 'center', marginTop: 24 }]}>
            <Text className="text-white font-heebo-black text-3xl">
              {t('send.successTitle')}
            </Text>
            <Text className="text-white/70 font-heebo text-base mt-2 text-center">
              {t('send.successBody', {
                amount: formatted,
                name: contact?.name ?? '',
              })}
            </Text>
          </Animated.View>
        </View>

        <View className="px-5 pb-8">
          <PrimaryButton
            label={t('send.done')}
            onPress={() => router.dismissAll()}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
