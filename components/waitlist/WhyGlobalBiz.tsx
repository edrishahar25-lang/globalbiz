import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe, Landmark, ShieldCheck, Sparkles } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';

function Card({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <GlassCard variant="subtle">
      <View className="p-5 flex-row gap-3">
        <View className="w-10 h-10 rounded-xl bg-glass-strong border border-glass-border items-center justify-center">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-ink font-heebo-bold text-base">{title}</Text>
          <Text className="text-ink-soft font-heebo text-sm mt-1 leading-5">{body}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export function WhyGlobalBiz() {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      <Card
        icon={<Globe color={colors.violetGlow} size={20} strokeWidth={2.2} />}
        title={t('why.intlTitle')}
        body={t('why.intlBody')}
      />
      <Card
        icon={<ShieldCheck color={colors.mint} size={20} strokeWidth={2.2} />}
        title={t('why.taxTitle')}
        body={t('why.taxBody')}
      />
      <Card
        icon={<Sparkles color={colors.cyanBase} size={20} strokeWidth={2.2} />}
        title={t('why.automationTitle')}
        body={t('why.automationBody')}
      />
      <Card
        icon={<Landmark color={colors.accent} size={20} strokeWidth={2.2} />}
        title={t('why.bankTitle')}
        body={t('why.bankBody')}
      />
    </View>
  );
}
