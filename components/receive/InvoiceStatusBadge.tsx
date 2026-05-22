import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, Clock, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import type { InvoiceStatus } from '@/types';

type StatusStyle = {
  bgClass: string;
  textClass: string;
  icon: ReactNode;
};

const STATUS: Record<InvoiceStatus, StatusStyle> = {
  draft: {
    bgClass: 'bg-white/10',
    textClass: 'text-white/65',
    icon: <FileText color="rgba(255,255,255,0.65)" size={11} strokeWidth={2.5} />,
  },
  sent: {
    bgClass: 'bg-violet-base/25',
    textClass: 'text-violet-glow',
    icon: <Clock color={colors.violetGlow} size={11} strokeWidth={2.5} />,
  },
  paid: {
    bgClass: 'bg-mint/20',
    textClass: 'text-mint',
    icon: <Check color={colors.mint} size={11} strokeWidth={3} />,
  },
  overdue: {
    bgClass: 'bg-accent/25',
    textClass: 'text-accent',
    icon: <AlertCircle color={colors.accent} size={11} strokeWidth={2.5} />,
  },
};

type Props = {
  status: InvoiceStatus;
};

export function InvoiceStatusBadge({ status }: Props) {
  const { t } = useTranslation();
  const style = STATUS[status];
  return (
    <View className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${style.bgClass}`}>
      {style.icon}
      <Text className={`font-heebo-medium text-[11px] ${style.textClass}`}>
        {t(`invoice.status.${status}`)}
      </Text>
    </View>
  );
}
