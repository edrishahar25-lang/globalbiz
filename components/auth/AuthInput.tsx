import { I18nManager, Text, TextInput, type TextInputProps, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  error?: string | null;
  editable?: boolean;
  hint?: string;
};

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  error,
  editable = true,
  hint,
}: Props) {
  return (
    <View>
      <View className="flex-row items-baseline gap-1.5 mb-1.5">
        <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide">
          {label}
        </Text>
        {hint ? <Text className="text-ink-faint font-heebo text-xs">{hint}</Text> : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        editable={editable}
        className={`bg-glass-strong border rounded-2xl px-4 py-3.5 text-ink font-heebo text-base ${
          error ? 'border-accent' : 'border-glass-border'
        }`}
        style={{
          fontFamily: 'Heebo_400Regular',
          color: '#0F172A',
          textAlign: I18nManager.isRTL && !secureTextEntry && keyboardType !== 'email-address'
            ? 'right'
            : 'left',
          opacity: editable ? 1 : 0.5,
        }}
      />
      {error ? <Text className="text-accent font-heebo text-xs mt-1.5">{error}</Text> : null}
    </View>
  );
}
