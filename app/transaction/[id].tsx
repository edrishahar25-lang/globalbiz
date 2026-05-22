import { Alert, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Headphones, Share2, ShieldCheck, X } from 'lucide-react-native';
import { Avatar, GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { invoices, transactions } from '@/data/mockData';
import { formatCurrency, formatFullDateTime, formatIls } from '@/lib/format';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-3">
      <Text className="text-white/45 font-heebo text-xs mb-1">{label}</Text>
      <Text className="text-white font-heebo-medium text-base">{value}</Text>
    </View>
  );
}

export default function TransactionDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = transactions.find((x) => x.id === id);

  if (!tx) {
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

  const isReceived = tx.type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountClass = isReceived ? 'text-mint' : 'text-white';

  const linkedInvoice = tx.invoiceId ? invoices.find((i) => i.id === tx.invoiceId) : undefined;

  const tapHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
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
          <Text className="text-white font-heebo-bold text-base">{t('transaction.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard variant="primary">
            <View className="p-6 items-center">
              <Avatar
                initials={tx.counterparty.initials}
                seed={tx.counterparty.name}
                size="xl"
                flag={tx.counterparty.flag}
              />
              <Text className="text-white font-heebo-bold text-xl mt-4">
                {tx.counterparty.name}
              </Text>
              <Text className="text-white/55 font-heebo text-xs mt-1">
                {isReceived ? t('transaction.received') : t('transaction.sent')}
              </Text>
              <Text className={`font-heebo-black text-4xl mt-3 ${amountClass}`}>
                {sign}
                {formatCurrency(tx.amount, tx.currency)}
              </Text>
              {tx.currency !== 'ILS' && (
                <Text className="text-white/55 font-heebo text-sm mt-1">
                  ≈ {formatIls(tx.amountIls)}
                </Text>
              )}
            </View>
          </GlassCard>

          <Text className="text-white/55 font-heebo-medium text-xs uppercase tracking-wide mt-6 mb-2 px-1">
            {t('transaction.detailsHeader')}
          </Text>

          <GlassCard variant="subtle">
            <View className="px-5">
              <DetailRow label={t('transaction.dateLabel')} value={formatFullDateTime(tx.date)} />
              <View className="h-px bg-glass-border" />
              <DetailRow label={t('transaction.descriptionLabel')} value={tx.description} />
              <View className="h-px bg-glass-border" />
              <DetailRow
                label={t('transaction.categoryLabel')}
                value={t(`transaction.categories.${tx.category}`)}
              />
              {linkedInvoice && (
                <>
                  <View className="h-px bg-glass-border" />
                  <DetailRow
                    label={t('transaction.invoiceLabel')}
                    value={linkedInvoice.number}
                  />
                </>
              )}
            </View>
          </GlassCard>

          {linkedInvoice?.allocationNumber &&
            linkedInvoice.allocationStatus === 'approved' && (
              <View className="mt-4">
                <GlassCard variant="mint">
                  <View className="p-5 items-center">
                    <View className="flex-row items-center gap-2 mb-3">
                      <ShieldCheck color={colors.mint} size={18} strokeWidth={2.5} />
                      <Text className="text-mint font-heebo-bold text-sm">
                        🛡️ {t('invoice.taxAuthorityVerified')} ✓
                      </Text>
                    </View>
                    <Text className="text-white/60 font-heebo text-xs">
                      {t('invoice.allocationNumberLabel')}
                    </Text>
                    <Text
                      className="text-white font-heebo-bold mt-1"
                      style={{ fontSize: 18, letterSpacing: 1 }}
                    >
                      {linkedInvoice.allocationNumber}
                    </Text>
                    <Text className="text-mint font-heebo-medium text-xs mt-2">
                      {t('invoice.validForVat')} ✓
                    </Text>
                  </View>
                </GlassCard>
              </View>
            )}

          <View className="mt-6 gap-2.5">
            <PrimaryButton
              label={t('transaction.shareReceipt')}
              icon={<Share2 color={colors.white} size={18} strokeWidth={2.2} />}
              variant="primary"
              size="md"
              onPress={async () => {
                tapHaptic();
                const lines: string[] = [
                  tx.counterparty.name,
                  `${isReceived ? t('transaction.received') : t('transaction.sent')}: ${sign}${formatCurrency(tx.amount, tx.currency)}`,
                  formatFullDateTime(tx.date),
                  tx.description,
                ];
                if (linkedInvoice?.number) {
                  lines.push(`${t('transaction.invoiceLabel')}: ${linkedInvoice.number}`);
                }
                if (linkedInvoice?.allocationNumber) {
                  lines.push(
                    `${t('invoice.allocationNumberLabel')}: ${linkedInvoice.allocationNumber}`,
                  );
                }
                try {
                  await Share.share({ message: lines.join('\n') });
                } catch (err) {
                  console.warn('[transaction.shareReceipt] failed', err);
                  Alert.alert(
                    t('transaction.shareSuccessTitle'),
                    t('transaction.shareSuccessBody'),
                  );
                }
              }}
            />
            <PrimaryButton
              label={t('transaction.contactSupport')}
              icon={<Headphones color={colors.white} size={18} strokeWidth={2.2} />}
              variant="secondary"
              size="md"
              onPress={() => {
                tapHaptic();
                Alert.alert(t('transaction.supportTitle'), t('transaction.supportBody'));
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
