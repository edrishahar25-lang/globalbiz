import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';

type Props = {
  icon: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
};

export function SettingsRow({ icon, label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-4 gap-3"
      style={({ pressed }) => pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      <View className="w-9 h-9 rounded-xl bg-glass-strong border border-glass-border items-center justify-center">
        {icon}
      </View>
      <Text className="flex-1 text-white font-heebo-medium text-base">{label}</Text>
      {value && <Text className="text-white/55 font-heebo text-sm">{value}</Text>}
      <ChevronLeft color={colors.muted} size={16} strokeWidth={2.2} />
    </Pressable>
  );
}
