import { useMemo, useState } from 'react';
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

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function WaitlistForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submit, submitting, count } = useWaitlist();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [worksIntl, setWorksIntl] = useState<'' | 'yes' | 'no'>('');
  const [incomeRange, setIncomeRange] = useState<MonthlyIncomeRange | ''>('');
  const [tools, setTools] = useState<PaymentTool[]>([]);
  const [referral, setReferral] = useState('');
  const [status, setStatus] = useState<Status>(null);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setBusinessName('');
    setCountry('');
    setCity('');
    setBusinessType('');
    setWorksIntl('');
    setIncomeRange('');
    setTools([]);
    setReferral('');
  };

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

  const emailValid = EMAIL_RE.test(email.trim());

  // International income is only relevant — and only required — when the
  // applicant works with international clients.
  const isValid =
    fullName.trim().length > 0 &&
    emailValid &&
    phone.trim().length >= 6 &&
    country.trim().length > 0 &&
    businessType !== '' &&
    worksIntl !== '' &&
    (worksIntl === 'no' || incomeRange !== '');

  const handleSubmit = async () => {
    setStatus(null);
    if (!user) {
      setStatus({ kind: 'error', message: t('waitlist.notAuthenticated') });
      return;
    }
    if (!emailValid) {
      setStatus({ kind: 'error', message: t('waitlist.emailInvalid') });
      return;
    }
    if (!isValid) {
      setStatus({ kind: 'error', message: t('waitlist.fillAllRequired') });
      return;
    }
    setStatus({ kind: 'loading', message: t('waitlist.submitting') });
    const { error, limit } = await submit({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      business_name: businessName.trim() || null,
      country: country.trim(),
      city: city.trim() || null,
      business_type: businessType as BusinessType,
      works_internationally: worksIntl === 'yes',
      // Column is NOT NULL; for "no international income" store the lowest
      // bucket since the international-income question doesn't apply.
      monthly_income_range: worksIntl === 'yes' ? (incomeRange as MonthlyIncomeRange) : 'lt_1k',
      current_tools: tools,
      referral_source: referral.trim() || null,
    });
    if (limit) {
      setStatus({ kind: 'error', message: t('waitlist.limitReached') });
      return;
    }
    if (error) {
      setStatus({ kind: 'error', message: error });
      return;
    }
    // Registered — clear the form so the next applicant can be added.
    resetForm();
    setStatus({ kind: 'success', message: t('waitlist.submitted') });
  };

  const toggleTool = (v: string) => {
    const tool = v as PaymentTool;
    setTools((prev) => (prev.includes(tool) ? prev.filter((x) => x !== tool) : [...prev, tool]));
  };

  return (
    <GlassCard variant="primary">
      <View className="p-5 gap-5">
        <View>
          <Text className="text-ink font-heebo-bold text-lg">{t('waitlist.title')}</Text>
          <Text className="text-ink-soft font-heebo text-sm mt-1">{t('waitlist.subtitle')}</Text>
          <Text className="text-violet-deep font-heebo-medium text-xs mt-1.5">
            {t('waitlist.registeredCount', { count })}
          </Text>
        </View>

        <StatusBanner status={status} />

        {/* Full name */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.fullName')} *
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('waitlist.fullNamePlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={80}
          />
        </View>

        {/* Email */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.email')} *
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('waitlist.emailPlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={120}
          />
        </View>

        {/* Phone */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.phone')} *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t('waitlist.phonePlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            keyboardType="phone-pad"
            autoComplete="tel"
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={20}
          />
        </View>

        {/* Business name */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.businessName')}
          </Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder={t('waitlist.businessNamePlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={80}
          />
        </View>

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

        {/* City */}
        <View>
          <Text className="text-ink-soft font-heebo-medium text-xs uppercase tracking-wide mb-2">
            {t('waitlist.city')}
          </Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('waitlist.cityPlaceholder')}
            placeholderTextColor="#94A3B8"
            editable={!submitting}
            className="bg-glass-strong border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
            style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A' }}
            maxLength={60}
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

        {/* Income — only shown when the user works internationally */}
        {worksIntl === 'yes' ? (
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
        ) : null}

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
          label={submitting ? t('waitlist.submitting') : t('waitlist.submitCta')}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          disabled={!isValid || submitting}
        />
      </View>
    </GlassCard>
  );
}
