import { type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export type QuickActionItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
};

type Props = {
  actions: QuickActionItem[];
};

export function QuickActions({ actions }: Props) {
  const handlePress = (action: QuickActionItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    action.onPress();
  };

  return (
    <View className="flex-row justify-around px-5">
      {actions.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => handlePress(a)}
          className="items-center"
          style={({ pressed }) => pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }}
        >
          <View className="w-14 h-14 rounded-2xl bg-glass-strong border border-glass-border items-center justify-center mb-2">
            {a.icon}
          </View>
          <Text className="text-white font-heebo-medium text-xs">{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
