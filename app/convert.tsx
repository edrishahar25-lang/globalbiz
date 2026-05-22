import { useState } from 'react';
import {
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { currencies } from '@/data/mockData';
import { formatCurrency, formatIls } from '@/lib/format';
import type { CurrencyCode } from '@/types';

const TARGETS: CurrencyCode[] = ['USD', 'EUR', 'GBP'];

export default function ConvertScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState<CurrencyCode>('USD');

  const parsed = parseFloat(amount);
  const isValid = !Number.isNaN(parsed) && parsed > 0;
  const targetCurrency = currencies[to];
  const converted = isValid ? parsed / targetCurrency.rateToIls : 0;
  const rate = (1 / targetCurrency.rateToIls).toFixed(4);

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert(t('convert.invalidAmount'));
      return;
    }
    Alert.alert(
      t('convert.successTitle'),
      t('convert.successBody', {
        amount: formatIls(parsed),
        converted: formatCurrency(converted, to),
      }),
      [{ text: t('common.ok'), onPress: () => router.back() }],
    );
  };

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <X color={colors.white} size={18} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-white font-heebo-bold text-base">{t('convert.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mb-2 px-1">
              {t('convert.fromLabel', { code: 'ILS' })}
            </Text>
            <GlassCard variant="primary">
              <View className="flex-row items-center p-5 gap-3">
                <Text className="text-3xl">🇮🇱</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={t('convert.amountPlaceholder')}
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="decimal-pad"
                  autoFocus
                  style={{
                    flex: 1,
                    fontFamily: 'Heebo_700Bold',
                    color: '#ffffff',
                    fontSize: 32,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    padding: 0,
                  }}
                />
                <Text className="text-white/70 font-heebo-medium text-lg">₪</Text>
              </View>
            </GlassCard>

            <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mt-6 mb-2 px-1">
              {t('convert.toLabel')}
            </Text>
            <View className="flex-row gap-2.5 mb-4">
              {TARGETS.map((code) => {
                const isActive = to === code;
                const c = currencies[code];
                return (
                  <Pressable
                    key={code}
                    onPress={() => setTo(code)}
                    className={`flex-1 rounded-2xl border px-3 py-4 items-center ${
                      isActive
                        ? 'bg-violet-base/30 border-violet-glow'
                        : 'bg-glass-strong border-glass-border'
                    }`}
                    style={({ pressed }) => pressed && { opacity: 0.8 }}
                  >
                    <Text className="text-2xl mb-1">{c.flag}</Text>
                    <Text
                      className={`font-heebo-bold text-sm ${
                        isActive ? 'text-white' : 'text-white/65'
                      }`}
                    >
                      {c.code}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <GlassCard variant="subtle">
              <View className="p-5">
                <Text className="text-white/55 font-heebo text-xs mb-1">
                  {t('convert.youReceive')}
                </Text>
                <Text className="text-white font-heebo-black text-3xl">
                  {isValid ? formatCurrency(converted, to) : `${targetCurrency.symbol}0.00`}
                </Text>
                <View className="h-px bg-glass-border my-3" />
                <Text className="text-white/55 font-heebo text-xs">
                  {t('convert.rateLine', { from: 'ILS', rate, to })}
                </Text>
                <Text className="text-mint font-heebo-medium text-xs mt-1">
                  {t('convert.feeLine')}
                </Text>
              </View>
            </GlassCard>

            <View className="mt-6">
              <PrimaryButton
                label={t('convert.cta')}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={!isValid}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
