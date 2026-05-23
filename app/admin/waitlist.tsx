import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react-native';
import { EmptyState, GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { FilterBar, WaitlistRow } from '@/components/admin';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useWaitlistAdmin } from '@/hooks/useWaitlistAdmin';
import { downloadWaitlistCsv } from '@/lib/csvExport';
import { colors } from '@/constants/colors';
import type { BusinessType, OnboardingStatus } from '@/types';

export default function AdminWaitlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  const { entries, loading, error, refresh, updateStatus } = useWaitlistAdmin({
    search,
    country,
    businessType,
    status,
  });

  // Route protection — if not an admin once we know, bounce to home.
  useEffect(() => {
    if (isAdmin === false) {
      router.replace('/');
    }
  }, [isAdmin, router]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.country));
    return Array.from(set).sort();
  }, [entries]);

  const counts = useMemo(() => {
    const c = { total: entries.length, pending: 0, reviewing: 0, approved: 0, rejected: 0 };
    entries.forEach((e) => {
      c[e.onboarding_status]++;
    });
    return c;
  }, [entries]);

  const handleExport = () => {
    const res = downloadWaitlistCsv(entries);
    if (!res.ok) {
      Alert.alert(t('admin.exportFailed'), t('admin.exportNativeUnsupported'));
    }
  };

  const handleUpdate = async (id: string, next: OnboardingStatus) => {
    const { error: err } = await updateStatus(id, next);
    if (err) Alert.alert(t('admin.updateFailed'), err);
  };

  if (isAdmin === null) {
    return (
      <GradientBackground variant="bgRich">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.violetGlow} />
        </View>
      </GradientBackground>
    );
  }

  if (isAdmin === false) {
    return (
      <GradientBackground variant="bgRich">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white/65 font-heebo-medium text-base text-center">
            {t('admin.forbidden')}
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <ArrowLeft color={colors.white} size={18} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-white font-heebo-bold text-base">{t('admin.title')}</Text>
          <Pressable
            onPress={() => refresh()}
            className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <RefreshCw color={colors.white} size={16} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary card */}
          <GlassCard variant="primary">
            <View className="p-4 flex-row items-baseline justify-between flex-wrap gap-3">
              <View>
                <Text className="text-white/55 font-heebo text-xs">{t('admin.total')}</Text>
                <Text className="text-white font-heebo-black text-3xl mt-0.5">
                  {counts.total}
                </Text>
              </View>
              <View className="flex-row gap-4 flex-wrap">
                <SummaryCount label={t('admin.status.pending')} value={counts.pending} color="text-white/80" />
                <SummaryCount label={t('admin.status.reviewing')} value={counts.reviewing} color="text-violet-glow" />
                <SummaryCount label={t('admin.status.approved')} value={counts.approved} color="text-mint" />
                <SummaryCount label={t('admin.status.rejected')} value={counts.rejected} color="text-accent" />
              </View>
            </View>
          </GlassCard>

          {/* Filters */}
          <View className="mt-4">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              country={country}
              onCountryChange={setCountry}
              countries={countries}
              businessType={businessType}
              onBusinessTypeChange={setBusinessType}
              status={status}
              onStatusChange={setStatus}
              onReset={() => {
                setSearch('');
                setCountry(null);
                setBusinessType(null);
                setStatus(null);
              }}
            />
          </View>

          {/* Export */}
          <View className="mt-4">
            <PrimaryButton
              label={t('admin.exportCsv', { count: entries.length })}
              onPress={handleExport}
              variant="secondary"
              size="sm"
              disabled={entries.length === 0}
              icon={<Download color={colors.white} size={16} strokeWidth={2.2} />}
            />
          </View>

          {/* Body */}
          <View className="mt-5 gap-2.5">
            {loading ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color={colors.violetGlow} />
              </View>
            ) : error ? (
              <GlassCard variant="subtle">
                <View className="p-5">
                  <Text className="text-accent font-heebo-medium text-sm">{error}</Text>
                </View>
              </GlassCard>
            ) : entries.length === 0 ? (
              <GlassCard variant="subtle">
                <EmptyState
                  title={t('admin.emptyTitle')}
                  subtitle={t('admin.emptySubtitle')}
                />
              </GlassCard>
            ) : (
              entries.map((e) => (
                <WaitlistRow key={e.id} entry={e} onUpdateStatus={handleUpdate} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function SummaryCount({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View>
      <Text className="text-white/45 font-heebo text-[10px] uppercase tracking-wide">
        {label}
      </Text>
      <Text className={`font-heebo-bold text-lg mt-0.5 ${color}`}>{value}</Text>
    </View>
  );
}
