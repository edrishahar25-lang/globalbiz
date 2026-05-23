import { Pressable, Text, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
  activeClass?: string; // bg for the active segment
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  activeClass = 'bg-turquoise/20',
  disabled,
}: Props<T>) {
  return (
    <View className="gap-1.5">
      <Text className="text-ink-faint font-heebo-medium text-[10px] uppercase tracking-wide">
        {label}
      </Text>
      <View className="flex-row bg-sky border border-glass-border rounded-xl overflow-hidden">
        {options.map((o, i) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              disabled={disabled}
              className={`flex-1 py-2 items-center ${active ? activeClass : ''} ${
                i > 0 ? 'border-l border-glass-border' : ''
              }`}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text
                className={`font-heebo-medium text-xs ${
                  active ? 'text-ink' : 'text-ink-soft'
                }`}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
