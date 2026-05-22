import { TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { colors } from '@/constants/colors';

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
};

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <View className="flex-row items-center gap-2 bg-glass-strong border border-glass-border rounded-2xl px-4 py-3">
      <Search color="rgba(255,255,255,0.45)" size={18} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        className="flex-1 text-white font-heebo text-base"
        style={{ fontFamily: 'Heebo_400Regular', textAlign: 'right' }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          className="w-6 h-6 rounded-full bg-glass items-center justify-center"
        >
          <X color={colors.muted} size={12} strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
}
