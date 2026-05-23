import { type ReactNode } from 'react';
import { Platform, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

type Props = {
  icon: ReactNode;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export function SettingsToggleRow({ icon, label, value, onValueChange }: Props) {
  const handle = (next: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onValueChange(next);
  };

  return (
    <View className="flex-row items-center px-5 py-4 gap-3">
      <View className="w-9 h-9 rounded-xl bg-glass-strong border border-glass-border items-center justify-center">
        {icon}
      </View>
      <Text className="flex-1 text-ink font-heebo-medium text-base">{label}</Text>
      <Switch
        value={value}
        onValueChange={handle}
        trackColor={{ false: '#CBD5E1', true: colors.violetBase }}
        thumbColor={value ? colors.violetGlow : '#ffffff'}
        ios_backgroundColor="#CBD5E1"
      />
    </View>
  );
}
