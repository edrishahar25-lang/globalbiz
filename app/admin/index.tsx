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
import { ArrowLeft, Download, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { EmptyState, GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { FilterBar, WaitlistRow } from '@/components/admin';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useWaitlistAdmin } from '@/hooks/useWaitlistAdmin';
import { downloadWaitlistCsv } from '@/lib/csvExport';
import { formatRelativeDate } from '@/lib/format';
import { computeInitials } from '@/lib/identity';
import { colors } from '@/constants/colors';
import { Avatar } from '@/components/ui';
import type {
  BusinessType,
  EarlyAccessPriority,
  OnboardingStatus,
} from '@/types';

export default function AdminScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  const { entries, loading, error, refresh, updateStatus, updatePriority } =
    useWaitlistAdmin({ search, country, businessType, status });

  // Security: bounce non-admins back to the public app after a brief
  // "Access denied" flash (the early return below renders it).
  useEffect(() => {
    if (isAdmin === false) {
      const id = setTimeout(() => router.replace('/'), 1200);
      return () => clearTimeout(id);
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

  const latest = useMemo(() => entries.slice(0, 5), [entries]);

  const handleExport = () => {
    const res = downloadWaitlistCsv(entries);
    if (!res.ok) Alert.alert(t('admin.exportFailed'), t('admin.exportNativeUnsupported'));
  };

  const handleStatus = async (id: string, next: OnboardingStatus) => {
    const { error: err } = await updateStatus(id, next);
    if (err) Alert.alert(t('admin.updateFailed'), err);
  };
  const handlePriority = async (id: string, next: EarlyAccessPriority) => {
    const { error: err } = await updatePriority(id, next);
    if (err) Alert.alert(t('admin.updateFailed'), err);
  };

  // --- Loading auth ---
  if (isAdmin === null) {
    return (
      <GradientBackground variant="bgRich">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.violetGlow} />
        </View>
      </GradientBackground>
    );
  }

  // --- Access denied ---
  if (isAdmin === false) {
    return (
      <GradientBackground variant="bgRich">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-accent/15 border border-accent/40 items-center justify-center mb-4">
            <ShieldAlert color={colors.accent} size={28} strokeWidth={2} />
          </View>
          <Text className="text-ink font-heebo-bold text-xl text-center">
            {t('admin.accessDenied')}
          </Text>
          <Text className="text-ink-soft font-heebo text-sm text-center mt-2">
            {t('admin.accessDeniedRedirect')}
          </Text>
        </View>
      </GradientBackground>
    );
  }

  // --- Admin dashboard ---
  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <ArrowLeft color={colors.violetGlow} size={18} strokeWidth={2.5} />
          </Pressable>
          <View className="items-center">
            <Text className="text-ink font-heebo-black text-base">{t('admin.brandTitle')}</Text>
            <Text className="text-ink-faint font-heebo text-[11px]">{t('admin.subtitle')}</Text>
          </View>
          <Pressable
            onPress={() => refresh()}
            className="w-10 h-10 rounded-full bg-glass-strong border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <RefreshCw color={colors.violetGlow} size={16} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary */}
          <GlassCard variant="primary">
            <View className="p-4 flex-row items-baseline justify-between flex-wrap gap-3">
              <View>
                <Text className="text-ink-soft font-heebo text-xs">{t('admin.total')}</Text>
                <Text className="text-ink font-heebo-black text-3xl mt-0.5">{counts.total}</Text>
              </View>
              <View className="flex-row gap-4 flex-wrap">
                <SummaryCount label={t('admin.status.pending')} value={counts.pending} color="text-ink-soft" />
                <SummaryCount label={t('admin.status.approved')} value={counts.approved} color="text-mint" />
                <SummaryCount label={t('admin.status.rejected')} value={counts.rejected} color="text-accent" />
              </View>
            </View>
          </GlassCard>

          {/* Latest signups */}
          {latest.length > 0 ? (
            <View className="mt-4">
              <Text className="text-ink font-heebo-bold text-sm mb-2">
                {t('admin.latestSignups')}
              </Text>
              <GlassCard variant="subtle">
                <View>
                  {latest.map((e, i) => (
                    <View key={e.id}>
                      <View className="flex-row items-center px-4 py-3 gap-3">
                        <Avatar initials={computeInitials(e.full_name)} seed={e.full_name} size="sm" />
                        <View className="flex-1">
                          <Text className="text-ink font-heebo-medium text-sm" numberOfLines={1}>
                            {e.full_name}
                          </Text>
                          <Text className="text-ink-faint font-heebo text-xs" numberOfLines={1}>
                            {e.country} · {t(`businessType.${e.business_type}`)}
                          </Text>
                        </View>
                        <Text className="text-ink-faint font-heebo text-[10px]">
                          {formatRelativeDate(e.created_at)}
                        </Text>
                      </View>
                      {i < latest.length - 1 && <View className="h-px bg-glass-border mx-4" />}
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          ) : null}

          {/* Filters */}
          <View className="mt-5">
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
              icon={<Download color={colors.violetGlow} size={16} strokeWidth={2.2} />}
            />
          </View>

          {/* Table header band — turquoise w/ white text */}
          <View className="mt-5 mb-2.5 rounded-2xl bg-turquoise px-4 py-2.5 flex-row items-center justify-between">
            <Text className="text-white font-heebo-bold text-sm">{t('admin.allUsers')}</Text>
            <Text className="text-white font-heebo-medium text-xs">{entries.length}</Text>
          </View>

          <View className="gap-2.5">
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
                <EmptyState title={t('admin.emptyTitle')} subtitle={t('admin.emptySubtitle')} />
              </GlassCard>
            ) : (
              entries.map((e) => (
                <WaitlistRow
                  key={e.id}
                  entry={e}
                  onUpdateStatus={handleStatus}
                  onUpdatePriority={handlePriority}
                />
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
      <Text className="text-ink-faint font-heebo text-[10px] uppercase tracking-wide">{label}</Text>
      <Text className={`font-heebo-bold text-lg mt-0.5 ${color}`}>{value}</Text>
    </View>
  );
}
