import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { GlassCard, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/colors';
import { currentUser } from '@/data/mockData';
import { formatIls } from '@/lib/format';

function formatValidUntil(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function TaxAuthorityCard() {
  const { t } = useTranslation();
  const ta = currentUser.taxAuthority;

  const handleManage = () => {
    Alert.alert(
      t('profile.manageConnectionTitle'),
      t('profile.manageConnectionBody'),
    );
  };

  return (
    <GlassCard variant="mint">
      <View className="p-5">
        <View className="flex-row items-center gap-2">
          <ShieldCheck color={colors.mint} size={20} strokeWidth={2.5} />
          <Text className="text-mint font-heebo-bold text-base flex-1">
            🛡️ {t('profile.taxConnectedHeader')} ✓
          </Text>
        </View>

        <View className="h-px bg-glass-border my-4" />

        <View className="gap-3">
          <View>
            <Text className="text-white/55 font-heebo text-xs mb-1">
              {t('profile.digitalCert')}
            </Text>
            <Text
              className="text-white font-heebo-bold text-base"
              style={{ letterSpacing: 0.6 }}
            >
              {ta.certNumber}
            </Text>
          </View>

          <View>
            <Text className="text-white/55 font-heebo text-xs mb-1">
              {t('profile.validUntil')}
            </Text>
            <Text className="text-white font-heebo-medium text-base">
              {formatValidUntil(ta.validUntil)}
            </Text>
          </View>
        </View>

        <View className="h-px bg-glass-border my-4" />

        <View className="flex-row gap-2.5">
          <View className="flex-1 bg-glass-strong border border-glass-border rounded-2xl px-3 py-3">
            <Text className="text-white/55 font-heebo text-[10px] mb-1.5">
              {t('profile.invoicesValidatedThisMonth')}
            </Text>
            <Text className="text-white font-heebo-black text-2xl">
              {ta.invoicesValidatedThisMonth}
            </Text>
          </View>
          <View className="flex-1 bg-glass-strong border border-glass-border rounded-2xl px-3 py-3">
            <Text className="text-white/55 font-heebo text-[10px] mb-1.5">
              {t('profile.totalAllocations')}
            </Text>
            <Text className="text-white font-heebo-black text-2xl">
              {formatIls(ta.totalAllocatedIls)}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <PrimaryButton
            label={t('profile.manageConnection')}
            onPress={handleManage}
            variant="secondary"
            size="sm"
          />
        </View>
      </View>
    </GlassCard>
  );
}
