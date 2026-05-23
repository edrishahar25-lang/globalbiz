import { useMemo } from 'react';
import { I18nManager, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import {
  BUSINESS_TYPES,
  type BusinessType,
  type OnboardingStatus,
} from '@/types';

const STATUS_VALUES: OnboardingStatus[] = ['pending', 'reviewing', 'approved', 'rejected'];

type Props = {
  search: string;
  onSearchChange: (next: string) => void;
  country: string | null;
  onCountryChange: (next: string | null) => void;
  countries: string[];
  businessType: BusinessType | null;
  onBusinessTypeChange: (next: BusinessType | null) => void;
  status: OnboardingStatus | null;
  onStatusChange: (next: OnboardingStatus | null) => void;
  onReset: () => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${
        active
          ? 'bg-violet-base/30 border-violet-glow'
          : 'bg-glass-strong border-glass-border'
      }`}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <Text
        className={`font-heebo-medium text-xs ${
          active ? 'text-white' : 'text-white/65'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterBar(props: Props) {
  const { t } = useTranslation();
  const numericAlign = I18nManager.isRTL ? 'right' : 'left';

  const anyFilterActive = useMemo(
    () => !!(props.search || props.country || props.businessType || props.status),
    [props.search, props.country, props.businessType, props.status],
  );

  return (
    <View className="gap-3">
      {/* Search */}
      <View className="flex-row items-center gap-2 bg-glass-strong border border-glass-border rounded-2xl px-4 py-3">
        <Search color="rgba(255,255,255,0.45)" size={18} strokeWidth={2.2} />
        <TextInput
          value={props.search}
          onChangeText={props.onSearchChange}
          placeholder={t('admin.searchPlaceholder')}
          placeholderTextColor="rgba(255,255,255,0.35)"
          className="flex-1 text-white font-heebo text-base"
          style={{
            fontFamily: 'Heebo_400Regular',
            color: '#ffffff',
            textAlign: numericAlign,
          }}
        />
        {props.search.length > 0 ? (
          <Pressable
            onPress={() => props.onSearchChange('')}
            className="w-6 h-6 rounded-full bg-glass items-center justify-center"
          >
            <X color={colors.muted} size={12} strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {/* Status chips */}
      <View>
        <Text className="text-white/45 font-heebo-medium text-[10px] uppercase tracking-wide mb-1.5">
          {t('admin.filterStatus')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label={t('admin.all')}
            active={props.status === null}
            onPress={() => props.onStatusChange(null)}
          />
          {STATUS_VALUES.map((s) => (
            <Chip
              key={s}
              label={t(`admin.status.${s}`)}
              active={props.status === s}
              onPress={() => props.onStatusChange(s)}
            />
          ))}
        </View>
      </View>

      {/* Business type chips */}
      <View>
        <Text className="text-white/45 font-heebo-medium text-[10px] uppercase tracking-wide mb-1.5">
          {t('admin.filterBusinessType')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label={t('admin.all')}
            active={props.businessType === null}
            onPress={() => props.onBusinessTypeChange(null)}
          />
          {BUSINESS_TYPES.map((bt) => (
            <Chip
              key={bt}
              label={t(`businessType.${bt}`)}
              active={props.businessType === bt}
              onPress={() => props.onBusinessTypeChange(bt)}
            />
          ))}
        </View>
      </View>

      {/* Country chips — built dynamically from the dataset */}
      {props.countries.length > 0 ? (
        <View>
          <Text className="text-white/45 font-heebo-medium text-[10px] uppercase tracking-wide mb-1.5">
            {t('admin.filterCountry')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Chip
              label={t('admin.all')}
              active={props.country === null}
              onPress={() => props.onCountryChange(null)}
            />
            {props.countries.map((c) => (
              <Chip
                key={c}
                label={c}
                active={props.country === c}
                onPress={() => props.onCountryChange(c)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {anyFilterActive ? (
        <Pressable onPress={props.onReset} hitSlop={6} className="self-start">
          <Text className="text-violet-glow font-heebo-medium text-xs">
            {t('admin.resetFilters')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
