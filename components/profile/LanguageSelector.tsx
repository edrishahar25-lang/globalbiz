import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { GlassCard } from '@/components/ui';
import { colors } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSelector() {
  const { t } = useTranslation();
  const { current, change, supported } = useLanguage();

  return (
    <GlassCard variant="subtle">
      <View>
        {supported.map((lang, i) => {
          const isActive = current === lang;
          return (
            <View key={lang}>
              <Pressable
                onPress={() => change(lang)}
                className="flex-row items-center justify-between px-5 py-4"
                style={({ pressed }) => pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                <Text
                  className={`font-heebo-medium text-base ${
                    isActive ? 'text-violet-glow' : 'text-white'
                  }`}
                >
                  {t(`profile.languageNames.${lang}`)}
                </Text>
                {isActive && <Check color={colors.mint} size={20} strokeWidth={2.5} />}
              </Pressable>
              {i < supported.length - 1 && <View className="h-px bg-glass-border mx-5" />}
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}
