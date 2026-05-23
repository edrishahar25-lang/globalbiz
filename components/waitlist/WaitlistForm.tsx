import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { GlassCard, PrimaryButton } from '@/components/ui';
import { StatusBanner, type Status } from '@/components/auth/StatusBanner';
import { colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { useWaitlist } from '@/hooks/useWaitlist';
import {
  BUSINESS_TYPES,
  MONTHLY_INCOME_RANGES,
  PAYMENT_TOOLS,
  type BusinessType,
  type MonthlyIncomeRange,
  type PaymentTool,
} from '@/types';

type Chip = { value: string; label: string };

function ChipRow({
  options,
  selected,
  onSelect,
  multi,
}: {
  options: Chip[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => {
        const isActive = selected.includes(o.value);
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            className={`rounded-2xl border px-3.5 py-2.5 flex-row items-center gap-1.5 ${
              isActive
                ? 'bg-violet-base/30 border-violet-glow'
                : 'bg-glass-strong border-glass-border'
            }`}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            {multi && isActive ? (
              <Check color={colors.violetGlow} size={12} strokeWidth={2.5} />
            ) : null}
            <Text
              className={`font-heebo-medium text-sm ${
                isActive ? 'text-ink' : 'text-ink-soft'
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function WaitlistForm() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { entry, submit, submitting } = useWaitlist();

  const [country, setCountry] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [worksIntl, setWorksIntl] = useState<'' | 'yes' | 'no'>('');
  const [incomeRange, setIncomeRange] = useState<MonthlyIncomeRange | ''>('');
  const [tools, setTools] = useState<PaymentTool[]>([]);
  const [referral, setReferral] = useState('');
  const [status, setStatus] = useState<Status>(null);

  // Hydrate from existing entry — so "Update application" pre-fills.
  useEffect(() => {
    if (!entry) return;
    setCountry(entry.country);
    setBusinessType(entry.business_type);
    setWorksIntl(entry.works_internationally ? 'yes' : 'no');
    setIncomeRange(entry.monthly_income_range);
    setTools(entry.current_tools);
    setReferral(entry.referral_source ?? '');
  }, [entry]);

  const businessOpts: Chip[] = useMemo(
    () => BUSINESS_TYPES.map((v) => ({ value: v, label: t(`businessType.${v}`) })),
    [t],
  );
  const incomeOpts: Chip[] = useMemo(
    () =>
      MONTHLY_INCOME_RANGES.map((v) => ({
        value: v,
        label: t(`incomeRange.${v}`),
      })),
    [t],
  );
  const toolOpts: Chip[] = useMemo(
    () => PAYMENT_TOOLS.map((v) => ({ value: v, label: t(`tools.${v}`) })),
    [t],
  );
  const yesNoOpts: Chip[] = [
    { value: 'yes', label: t('common.yes') },
    { value: 'no', label: t('common.no') },
  ];

  const isValid =
    country.trim().length > 0 &&
    businessType !== '' &&
    worksIntl !== '' &&
    incomeRange !== '';

  const handleSubmit = async () => {
    setStatus(null);
    if (!user) {
      setStatus({ kind: 'error', message: t('waitlist.notAuthenticated') });
      return;
    }
    if (!isValid) {
      setStatus({ kind: 'error', message: t('waitlist.fillAllRequired') });
      return;
    }
    setStatus({
      kind: 'loading',
      message: entry ? t('waitlist.updating') : t('waitlist.submitting'),
    });
    const { error } = await submit({
      full_name: profile?.full_name ?? user.email?.split('@')[0] ?? '',
      email: user.email ?? '',
      country: country.trim(),
      business_type: businessType as BusinessType,
      works_internationally: worksIntl === 'yes',
      monthly_income_range: incomeRange as MonthlyIncomeRange,
      current_tools: tools,
      referral_source: referral.trim() || null,
    });
    if (error) {
      setStatus({ kind: 'error', message: error });
      return;
    }
    setStatus({
      kind: 'success',
      message: entry ? t('waitlist.updated') : t('waitlist.submitted'),
    });
  };

  const toggleTool = (v: string) => {
    const tool = v as PaymentTool;
    setTools((prev) => (prev.includes(tool) ? prev.filter((x) => x !== tool) : [...prev, tool]));
  };

  return (
    <GlassCard variant="primary">
      <View className="p-5 gap-5">
        <View>
          <Text className="text-ink font-heebo-bold text-lg">
            {entry ? t('waitlist.updateTitle') : t('waitlist.title')}
          </Text>
          <Text className="text-ink-soft font-heebo text-sm mt-1">{t('waitlist.subtitle')}</Text>
        </View>

        <StatusBanner status={status} />

        {/* Country */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.country')} *
          </Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder={t('waitlist.countryPlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
          />
        </View>

        {/* Business type */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.businessType')} *
          </Text>
          <ChipRow
            options={businessOpts}
            selected={businessType ? [businessType] : []}
            onSelect={(v) => setBusinessType(v as BusinessType)}
          />
        </View>

        {/* International? */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.worksInternationally')} *
          </Text>
          <ChipRow
            options={yesNoOpts}
            selected={worksIntl ? [worksIntl] : []}
            onSelect={(v) => setWorksIntl(v as 'yes' | 'no')}
          />
        </View>

        {/* Income */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.monthlyIncome')} *
          </Text>
          <ChipRow
            options={incomeOpts}
            selected={incomeRange ? [incomeRange] : []}
            onSelect={(v) => setIncomeRange(v as MonthlyIncomeRange)}
          />
        </View>

        {/* Tools (multi) */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.currentTools')}
          </Text>
          <ChipRow options={toolOpts} selected={tools} onSelect={toggleTool} multi />
        </View>

        {/* Referral */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.referralSource')}
          </Text>
          <TextInput
            value={referral}
            onChangeText={setReferral}
            placeholder={t('waitlist.referralPlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={120}
          />
        </View>

        <PrimaryButton
          label={
            submitting
              ? entry
                ? t('waitlist.updating')
                : t('waitlist.submitting')
              : entry
                ? t('waitlist.updateCta')
                : t('waitlist.submitCta')
          }
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          disabled={!isValid || submitting}
        />
      </View>
    </GlassCard>
  );
}
