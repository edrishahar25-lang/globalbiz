import { type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Copy, MessageCircle, QrCode, Share2 } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';

type Action = {
  id: string;
  labelKey: 'receive.byLink' | 'receive.byWhatsapp' | 'receive.byQr';
  icon: ReactNode;
};

const ACTIONS: Action[] = [
  { id: 'link', labelKey: 'receive.byLink', icon: <Share2 color={colors.violetGlow} size={20} strokeWidth={2.2} /> },
  { id: 'whatsapp', labelKey: 'receive.byWhatsapp', icon: <MessageCircle color={colors.mint} size={20} strokeWidth={2.2} /> },
  { id: 'qr', labelKey: 'receive.byQr', icon: <QrCode color={colors.cyanBase} size={20} strokeWidth={2.2} /> },
];

type Props = {
  paymentLink: string;
};

function tap() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function QuickReceiveCard({ paymentLink }: Props) {
  const { t } = useTranslation();
  return (
    <GlassCard variant="primary">
      <View className="p-5 gap-4">
        <View>
          <Text className="text-white/60 font-heebo text-xs mb-1.5">
            {t('receive.paymentLinkLabel')}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text
              className="text-white font-heebo-bold text-base flex-1"
              numberOfLines={1}
            >
              {paymentLink}
            </Text>
            <Pressable
              onPress={tap}
              className="w-9 h-9 rounded-xl bg-glass-strong border border-glass-border items-center justify-center"
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Copy color={colors.violetGlow} size={15} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        <View className="h-px bg-glass-border" />

        <View className="flex-row gap-2.5">
          {ACTIONS.map((a) => (
            <Pressable
              key={a.id}
              onPress={tap}
              className="flex-1 bg-glass-strong border border-glass-border rounded-2xl py-3 items-center gap-1.5"
              style={({ pressed }) => pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }}
            >
              {a.icon}
              <Text className="text-white font-heebo-medium text-xs">{t(a.labelKey)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}
