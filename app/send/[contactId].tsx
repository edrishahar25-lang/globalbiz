import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { Avatar, GradientBackground, PrimaryButton } from '@/components/ui';
import { Keypad } from '@/components/send';
import { colors } from '@/constants/colors';
import { contacts, currencies } from '@/data/mockData';
import { formatCurrency } from '@/lib/format';

function formatDisplay(amount: string): string {
  if (amount === '' || amount === '0') return '0';
  const [intPart, decPart] = amount.split('.');
  const formattedInt = new Intl.NumberFormat('en-US').format(
    parseInt(intPart ?? '0', 10),
  );
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

export default function SendAmountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const contact = contacts.find((c) => c.id === contactId);
  const [amount, setAmount] = useState('0');

  if (!contact) {
    return (
      <GradientBackground variant="bgRich">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View className="flex-1 items-center justify-center px-6">
            <PrimaryButton
              label={t('common.close')}
              onPress={() => router.back()}
              variant="secondary"
            />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const currency = contact.preferredCurrency;
  const symbol = currencies[currency].symbol;

  const handleKey = (k: string) => {
    if (k === 'del') {
      setAmount((curr) => (curr.length <= 1 ? '0' : curr.slice(0, -1)));
      return;
    }
    if (k === '.') {
      setAmount((curr) => {
        if (curr.includes('.')) return curr;
        return curr === '0' ? '0.' : `${curr}.`;
      });
      return;
    }
    setAmount((curr) => {
      if (curr === '0') return k;
      if (curr.includes('.')) {
        const decimals = curr.split('.')[1] ?? '';
        if (decimals.length >= 2) return curr;
      }
      return curr + k;
    });
  };

  const parsed = parseFloat(amount);
  const isValid = !Number.isNaN(parsed) && parsed > 0;

  const handleSend = () => {
    if (!isValid) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.replace({
      pathname: '/send/success',
      params: { contactId: contact.id, amount, currency },
    });
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
          <View />
          <View style={{ width: 40 }} />
        </View>

        <View className="items-center px-5 pb-2">
          <Text className="text-white/55 font-heebo text-xs mb-3">
            {t('send.recipientLabel')}
          </Text>
          <Avatar
            initials={contact.initials}
            seed={contact.name}
            size="lg"
            flag={contact.flag}
          />
          <Text className="text-white font-heebo-bold text-lg mt-2">{contact.name}</Text>
          <Text className="text-white/45 font-heebo text-xs mt-0.5">{contact.role}</Text>
        </View>

        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-white/45 font-heebo text-xs mb-2">{t('send.amountLabel')}</Text>
          <View className="flex-row items-baseline gap-2">
            <Text
              className={`font-heebo-black ${amount === '0' ? 'text-white/30' : 'text-white'}`}
              style={{ fontSize: 56, lineHeight: 64 }}
            >
              {formatDisplay(amount)}
            </Text>
            <Text className="text-white/70 font-heebo-medium text-2xl">{symbol}</Text>
          </View>
        </View>

        <View className="px-5 pb-2">
          <Keypad onKey={handleKey} />
        </View>

        <View className="px-5 pb-5 pt-3">
          <PrimaryButton
            label={
              isValid
                ? t('send.sendCta', {
                    amount: formatCurrency(parsed, currency),
                  })
                : t('send.enterAmount')
            }
            onPress={handleSend}
            variant="primary"
            size="lg"
            disabled={!isValid}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
