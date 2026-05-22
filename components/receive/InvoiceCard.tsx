import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Loader, ShieldCheck } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatCurrency, formatDaysUntil } from '@/lib/format';
import type { Invoice } from '@/types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

type Props = {
  invoice: Invoice;
};

export function InvoiceCard({ invoice }: Props) {
  const { t } = useTranslation();
  const isOverdue = invoice.status === 'overdue';
  const isPaid = invoice.status === 'paid';
  const showDueInfo = !isPaid;
  const dueInfo = showDueInfo ? formatDaysUntil(invoice.dueAt) : null;

  return (
    <GlassCard variant={isOverdue ? 'accent' : 'subtle'}>
      <View className="p-4 gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base">{invoice.client.flag}</Text>
              <Text className="text-white font-heebo-medium text-base" numberOfLines={1}>
                {invoice.client.name}
              </Text>
            </View>
            <Text className="text-white/45 font-heebo text-xs mt-1">{invoice.number}</Text>
          </View>
          <View className="items-end gap-1.5">
            <Text className="text-white font-heebo-bold text-base">
              {formatCurrency(invoice.amount, invoice.currency)}
            </Text>
            <InvoiceStatusBadge status={invoice.status} />
          </View>
        </View>

        {dueInfo && (
          <>
            <View className="h-px bg-glass-border" />
            <View className="flex-row items-center justify-between">
              <Text
                className={`font-heebo-medium text-xs ${
                  dueInfo.isOverdue ? 'text-accent' : 'text-white/65'
                }`}
              >
                {dueInfo.label}
              </Text>
              {dueInfo.isOverdue && (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      t('demo.reminderSentTitle'),
                      t('demo.reminderSentBody', { name: invoice.client.name }),
                    )
                  }
                  className="flex-row items-center gap-1.5 bg-glass-strong border border-glass-border rounded-full px-3 py-1.5"
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Bell color={colors.violetGlow} size={12} strokeWidth={2.5} />
                  <Text className="text-white font-heebo-medium text-xs">
                    {t('receive.sendReminder')}
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {invoice.allocationStatus === 'approved' && invoice.allocationNumber && (
          <View className="bg-mint/15 border border-mint/30 rounded-xl px-3 py-2 flex-row items-center gap-2">
            <ShieldCheck color={colors.mint} size={13} strokeWidth={2.5} />
            <Text
              className="flex-1 text-mint font-heebo-bold text-[11px]"
              numberOfLines={1}
              style={{ letterSpacing: 0.4 }}
            >
              {invoice.allocationNumber}
            </Text>
            <Text className="text-mint/75 font-heebo text-[10px]">
              {t('invoice.validForVat')} ✓
            </Text>
          </View>
        )}

        {invoice.allocationStatus === 'pending' && (
          <View className="bg-violet-base/15 border border-violet-glow/30 rounded-xl px-3 py-2 flex-row items-center gap-2">
            <Loader color={colors.violetGlow} size={13} strokeWidth={2.5} />
            <Text className="flex-1 text-violet-glow font-heebo-medium text-[11px]">
              {t('invoice.allocationPending')}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}
