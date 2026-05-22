import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
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
import { ShieldCheck, Share2, X } from 'lucide-react-native';
import { GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatCurrency, formatFullDateTime } from '@/lib/format';
import type { CurrencyCode } from '@/types';

type Step = 'connecting' | 'verifying' | 'receiving' | 'success';

const PROGRESS_STEPS: Step[] = ['connecting', 'verifying', 'receiving'];

function StepProgress({ current }: { current: Step }) {
  const currentIdx = PROGRESS_STEPS.indexOf(current);
  const isSuccess = current === 'success';
  return (
    <View className="flex-row gap-2 mt-6">
      {PROGRESS_STEPS.map((s, idx) => {
        const isActive = isSuccess || idx <= currentIdx;
        return (
          <View
            key={s}
            className={`h-1.5 rounded-full ${
              isActive ? 'bg-mint' : 'bg-white/15'
            }`}
            style={{ width: isActive ? 32 : 24 }}
          />
        );
      })}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-3">
      <Text className="text-white/45 font-heebo text-xs mb-1">{label}</Text>
      <Text className="text-white font-heebo-medium text-base">{value}</Text>
    </View>
  );
}

export default function InvoiceCreatedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount: string;
    currency: CurrencyCode;
    description: string;
    requiresAllocation: string;
  }>();

  const requiresAllocation = params.requiresAllocation === '1';
  const parsed = parseFloat(params.amount ?? '0');
  const currency: CurrencyCode = params.currency ?? 'ILS';
  const description = params.description ?? '';

  const [step, setStep] = useState<Step>(
    requiresAllocation ? 'connecting' : 'success',
  );

  const allocationNumber = useMemo(() => {
    const n = Math.floor(Math.random() * 99999999)
      .toString()
      .padStart(8, '0');
    return `2026-IL-${n}`;
  }, []);

  const createdAtIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    if (!requiresAllocation) return;
    const t1 = setTimeout(() => setStep('verifying'), 850);
    const t2 = setTimeout(() => setStep('receiving'), 1700);
    const t3 = setTimeout(() => setStep('success'), 2550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [requiresAllocation]);

  const shieldScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    if (step === 'success') {
      shieldScale.value = withDelay(80, withSpring(1, { damping: 9, stiffness: 110 }));
      successOpacity.value = withDelay(220, withTiming(1, { duration: 400 }));
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  }, [step, shieldScale, successOpacity]);

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));
  const successStyle = useAnimatedStyle(() => ({ opacity: successOpacity.value }));

  const stepLabel = (s: Step): string => {
    if (s === 'connecting') return `🔐 ${t('invoice.steps.connecting')}`;
    if (s === 'verifying') return `📋 ${t('invoice.steps.verifying')}`;
    if (s === 'receiving') return `✓ ${t('invoice.steps.receiving')}`;
    return t('invoice.steps.success');
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      await Share.share({
        message: t('invoice.shareMessage', {
          amount: formatCurrency(parsed, currency),
          allocation: requiresAllocation ? allocationNumber : '—',
        }),
      });
    } catch {
      // ignore
    }
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
      <Pressable
        onPress={() => router.dismissAll()}
        className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        <X color={colors.white} size={18} strokeWidth={2.5} />
      </Pressable>
      <Text className="text-white font-heebo-bold text-base">
        {step === 'success' ? t('invoice.createdTitle') : ''}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (step !== 'success') {
    return (
      <GradientBackground variant="bgRich">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {renderHeader()}
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full bg-glass-strong border border-glass-border items-center justify-center">
              <ActivityIndicator size="large" color={colors.violetGlow} />
            </View>
            <Text className="text-white font-heebo-bold text-lg mt-6 text-center">
              {stepLabel(step)}
            </Text>
            <StepProgress current={step} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {renderHeader()}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant={requiresAllocation ? 'mint' : 'primary'}>
            <View className="p-6 items-center">
              <Animated.View style={shieldStyle}>
                <View
                  className={`w-28 h-28 rounded-full items-center justify-center border-2 ${
                    requiresAllocation ? 'bg-mint/20 border-mint' : 'bg-violet-base/20 border-violet-glow'
                  }`}
                >
                  <ShieldCheck
                    color={requiresAllocation ? colors.mint : colors.violetGlow}
                    size={60}
                    strokeWidth={2.5}
                  />
                </View>
              </Animated.View>

              <Animated.View style={[successStyle, { alignItems: 'center', marginTop: 20 }]}>
                {requiresAllocation && (
                  <Text className="text-mint font-heebo-bold text-base mb-3">
                    🛡️ {t('invoice.taxAuthorityVerified')} ✓
                  </Text>
                )}
                {requiresAllocation ? (
                  <>
                    <Text className="text-white/55 font-heebo text-xs">
                      {t('invoice.allocationNumberLabel')}
                    </Text>
                    <Text
                      className="text-white font-heebo-bold mt-1"
                      style={{ fontSize: 22, letterSpacing: 1, fontFamily: 'Heebo_700Bold' }}
                    >
                      {allocationNumber}
                    </Text>
                    <Text className="text-mint font-heebo-medium text-xs mt-2">
                      {t('invoice.validForVat')} ✓
                    </Text>
                  </>
                ) : (
                  <Text className="text-white font-heebo-bold text-2xl mt-1">
                    {t('invoice.createdTitle')}
                  </Text>
                )}
              </Animated.View>
            </View>
          </GlassCard>

          <Animated.View style={[successStyle, { marginTop: 20 }]}>
            <GlassCard variant="subtle">
              <View className="px-5">
                <DetailRow
                  label={t('invoice.amountLabel')}
                  value={formatCurrency(parsed, currency)}
                />
                <View className="h-px bg-glass-border" />
                <DetailRow
                  label={t('invoice.descriptionLabel')}
                  value={description || t('invoice.noDescription')}
                />
                <View className="h-px bg-glass-border" />
                <DetailRow
                  label={t('invoice.dateLabel')}
                  value={formatFullDateTime(createdAtIso)}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View style={[successStyle, { marginTop: 24, gap: 10 }]}>
            <PrimaryButton
              label={t('invoice.shareInvoice')}
              onPress={handleShare}
              variant="primary"
              size="md"
              icon={<Share2 color={colors.white} size={18} strokeWidth={2.2} />}
            />
            <PrimaryButton
              label={t('invoice.done')}
              onPress={() => router.dismissAll()}
              variant="secondary"
              size="md"
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
