import { type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
import { colors } from '@/constants/colors';

type KeyValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'del';

const ROWS: KeyValue[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

type Props = {
  onKey: (key: KeyValue) => void;
};

function tap() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

function Key({ value, onPress }: { value: KeyValue; onPress: () => void }) {
  let content: ReactNode;
  if (value === 'del') {
    content = <Delete color={colors.white} size={22} strokeWidth={2.2} />;
  } else {
    content = (
      <Text className="text-white font-heebo-bold text-2xl">{value}</Text>
    );
  }
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      className="flex-1 h-16 rounded-2xl bg-glass-strong border border-glass-border items-center justify-center"
      style={({ pressed }) =>
        pressed && { opacity: 0.6, transform: [{ scale: 0.96 }] }
      }
    >
      {content}
    </Pressable>
  );
}

export function Keypad({ onKey }: Props) {
  return (
    <View className="gap-2">
      {ROWS.map((row, ri) => (
        <View key={ri} className="flex-row gap-2">
          {row.map((k) => (
            <Key key={k} value={k} onPress={() => onKey(k)} />
          ))}
        </View>
      ))}
    </View>
  );
}
