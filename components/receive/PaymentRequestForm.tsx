import { useMemo, useState } from 'react';
import {
  I18nManager,
  Platform,
  Pressable,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { Copy, FileText, Share2, ShieldCheck } from 'lucide-react-native';
import { GlassCard, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { ALLOCATION_THRESHOLD_ILS, currencies } from '@/data/mockData';
import { formatCurrency } from '@/lib/format';
import type { CurrencyCode } from '@/types';

const CURRENCY_OPTIONS: CurrencyCode[] = ['ILS', 'USD', 'EUR', 'GBP'];

function buildPaymentUrl(params: {
  to: string;
  amount: number;
  currency: CurrencyCode;
  description?: string;
}): string {
  const qs = new URLSearchParams({
    to: params.to,
    amount: params.amount.toString(),
    currency: params.currency,
  });
  if (params.description) qs.set('desc', params.description);
  return `https://globalbiz.me/pay?${qs.toString()}`;
}

export function PaymentRequestForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyCode>('ILS');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const parsed = parseFloat(amount);
  const isValid = !Number.isNaN(parsed) && parsed > 0;
  const amountIls = isValid ? parsed * currencies[currency].rateToIls : 0;
  const requiresAllocation = amountIls > ALLOCATION_THRESHOLD_ILS;

  const paymentUrl = useMemo(
    () =>
      isValid
        ? buildPaymentUrl({
            to: 'shira-cohen',
            amount: parsed,
            currency,
            description: description.trim() || undefined,
          })
        : '',
    [isValid, parsed, currency, description],
  );

  const tap = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleCreateInvoice = () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push({
      pathname: '/invoice/created',
      params: {
        amount: amount,
        currency,
        description: description.trim(),
        requiresAllocation: requiresAllocation ? '1' : '0',
      },
    });
  };

  const handleShareQr = async () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      await Share.share({
        message: `${t('receive.shareMessage', {
          amount: formatCurrency(parsed, currency),
        })}\n${paymentUrl}`,
        url: paymentUrl,
      });
    } catch {
      // user cancelled or unsupported
    }
  };

  const numericAlign = I18nManager.isRTL ? 'right' : 'left';

  return (
    <GlassCard variant="primary">
      <View className="p-5 gap-5">
        <Text className="text-white font-heebo-bold text-lg">
          {t('receive.requestPayment')}
        </Text>

        <View>
          <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('receive.currencyLabel')}
          </Text>
          <View className="flex-row gap-2">
            {CURRENCY_OPTIONS.map((code) => {
              const isActive = currency === code;
              const c = currencies[code];
              return (
                <Pressable
                  key={code}
                  onPress={() => {
                    tap();
                    setCurrency(code);
                  }}
                  className={`flex-1 rounded-xl border px-2 py-3 items-center ${
                    isActive
                      ? 'bg-violet-base/30 border-violet-glow'
                      : 'bg-glass-strong border-glass-border'
                  }`}
                  style={({ pressed }) => pressed && { opacity: 0.8 }}
                >
                  <Text className="text-xl mb-0.5">{c.flag}</Text>
                  <Text
                    className={`font-heebo-bold text-[11px] ${
                      isActive ? 'text-white' : 'text-white/65'
                    }`}
                  >
                    {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('receive.amountLabel')}
          </Text>
          <View className="flex-row items-center gap-2 bg-glass-strong border border-glass-border rounded-2xl px-4 py-3">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                fontFamily: 'Heebo_700Bold',
                color: '#ffffff',
                fontSize: 22,
                textAlign: numericAlign,
                padding: 0,
              }}
            />
            <Text className="text-white/70 font-heebo-medium text-lg">
              {currencies[currency].symbol}
            </Text>
          </View>
        </View>

        <View>
          <View className="flex-row items-baseline gap-1.5 mb-2">
            <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide">
              {t('receive.descriptionLabel')}
            </Text>
            <Text className="text-white/35 font-heebo text-xs">
              {t('receive.descriptionOptional')}
            </Text>
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('receive.descriptionPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.35)"
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-white font-heebo text-base"
            style={{
              fontFamily: 'Heebo_400Regular',
              color: '#ffffff',
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            maxLength={80}
          />
        </View>

        {isValid ? (
          <View className="items-center gap-3">
            <View className="bg-white p-3 rounded-2xl">
              <QRCode value={paymentUrl} size={170} backgroundColor="#ffffff" color="#0a0612" />
            </View>
            <Text className="text-white/55 font-heebo text-xs">{t('receive.qrHint')}</Text>
            <View className="w-full flex-row items-center gap-2 bg-glass-strong border border-glass-border rounded-xl px-3 py-2.5">
              <Text className="flex-1 text-white/80 font-heebo text-xs" numberOfLines={1}>
                {paymentUrl}
              </Text>
              <Pressable
                onPress={tap}
                className="w-8 h-8 rounded-lg bg-glass items-center justify-center"
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Copy color={colors.violetGlow} size={14} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="bg-glass border border-glass-border rounded-2xl py-8 items-center">
            <Text className="text-white/45 font-heebo text-sm">
              {t('receive.enterAmountHint')}
            </Text>
          </View>
        )}

        {requiresAllocation && (
          <View className="bg-mint/15 border border-mint/40 rounded-2xl px-3.5 py-3 flex-row items-start gap-2.5">
            <ShieldCheck color={colors.mint} size={18} strokeWidth={2.4} />
            <Text className="flex-1 text-mint font-heebo-medium text-[13px] leading-5">
              🛡️ {t('receive.allocationBanner')}
            </Text>
          </View>
        )}

        <View className="gap-2">
          <PrimaryButton
            label={t('receive.createInvoice')}
            onPress={handleCreateInvoice}
            variant="primary"
            size="md"
            disabled={!isValid}
            icon={<FileText color={colors.white} size={18} strokeWidth={2.2} />}
          />
          <PrimaryButton
            label={t('receive.shareQr')}
            onPress={handleShareQr}
            variant="secondary"
            size="sm"
            disabled={!isValid}
            icon={<Share2 color={colors.white} size={16} strokeWidth={2.2} />}
          />
        </View>
      </View>
    </GlassCard>
  );
}
