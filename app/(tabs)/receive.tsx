import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react-native';
import { EmptyState, GlassCard, GradientBackground } from '@/components/ui';
import { InvoiceCard, PaymentRequestForm } from '@/components/receive';
import { invoices } from '@/data/mockData';
import { colors } from '@/constants/colors';

export default function ReceiveScreen() {
  const { t } = useTranslation();

  const openInvoices = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'overdue',
  );
  const draftInvoices = invoices.filter((i) => i.status === 'draft');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const hasAnyInvoice = invoices.length > 0;

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-3 pb-5">
            <Text className="text-white font-heebo-black text-3xl">{t('receive.title')}</Text>
            <Text className="text-white/55 font-heebo text-sm mt-1">
              {t('receive.subtitle')}
            </Text>
          </View>

          <View className="px-5 mb-6">
            <PaymentRequestForm />
          </View>

          {!hasAnyInvoice ? (
            <View className="px-5">
              <GlassCard variant="subtle">
                <EmptyState
                  icon={<FileText color={colors.violetGlow} size={28} strokeWidth={1.8} />}
                  title={t('empty.invoices')}
                  subtitle={t('empty.invoicesSubtitle')}
                />
              </GlassCard>
            </View>
          ) : null}

          {openInvoices.length > 0 ? (
            <>
              <View className="px-5 mb-3 flex-row items-center justify-between">
                <Text className="text-white font-heebo-bold text-lg">
                  {t('receive.openInvoices')}
                </Text>
                <Text className="text-white/45 font-heebo-medium text-xs">
                  {t('receive.openInvoicesCount', { count: openInvoices.length })}
                </Text>
              </View>
              <View className="px-5 gap-2.5 mb-6">
                {openInvoices.map((inv) => (
                  <InvoiceCard key={inv.id} invoice={inv} />
                ))}
              </View>
            </>
          ) : null}

          {draftInvoices.length > 0 ? (
            <>
              <View className="px-5 mb-3">
                <Text className="text-white font-heebo-bold text-lg">{t('receive.drafts')}</Text>
              </View>
              <View className="px-5 gap-2.5 mb-6">
                {draftInvoices.map((inv) => (
                  <InvoiceCard key={inv.id} invoice={inv} />
                ))}
              </View>
            </>
          ) : null}

          {paidInvoices.length > 0 ? (
            <>
              <View className="px-5 mb-3">
                <Text className="text-white font-heebo-bold text-lg">
                  {t('receive.paidRecent')}
                </Text>
              </View>
              <View className="px-5 gap-2.5">
                {paidInvoices.map((inv) => (
                  <InvoiceCard key={inv.id} invoice={inv} />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
