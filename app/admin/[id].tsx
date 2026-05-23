import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react-native';
import { Avatar, EmptyState, GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { SegmentedControl } from '@/components/admin/SegmentedControl';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatusBanner, type Status } from '@/components/auth/StatusBanner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useApplicant } from '@/hooks/useApplicant';
import { computeInitials } from '@/lib/identity';
import { formatFullDateTime } from '@/lib/format';
import { copyText, mailtoUrl, openExternal, telUrl, whatsappUrl } from '@/lib/contact';
import { colors } from '@/constants/colors';
import {
  EARLY_ACCESS_PRIORITIES,
  type EarlyAccessPriority,
  type OnboardingStatus,
} from '@/types';

const STATUS_ACTIONS: { value: OnboardingStatus; tone: string }[] = [
  { value: 'approved', tone: 'bg-mint' },
  { value: 'reviewing', tone: 'bg-turquoise' },
  { value: 'rejected', tone: 'bg-accent' },
];

export default function ApplicantDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applicant, note, loading, error, updateStatus, updatePriority, saveNote, archive } =
    useApplicant(id);

  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [banner, setBanner] = useState<Status>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setNoteDraft(note);
  }, [note]);

  useEffect(() => {
    if (isAdmin === false) {
      const tid = setTimeout(() => router.replace('/'), 1200);
      return () => clearTimeout(tid);
    }
  }, [isAdmin, router]);

  const flash = (kind: 'success' | 'error', message: string) => {
    setBanner({ kind, message });
    setTimeout(() => setBanner(null), 2200);
  };

  const onStatus = async (s: OnboardingStatus) => {
    const { error: err } = await updateStatus(s);
    if (err) flash('error', t('adminDetail.saveFailed'));
    else flash('success', t('adminDetail.statusSaved'));
  };

  const onPriority = async (p: EarlyAccessPriority) => {
    const { error: err } = await updatePriority(p);
    if (err) flash('error', t('adminDetail.saveFailed'));
  };

  const onSaveNote = async () => {
    setSavingNote(true);
    const { error: err } = await saveNote(noteDraft);
    setSavingNote(false);
    if (err) flash('error', t('adminDetail.saveFailed'));
    else flash('success', t('adminDetail.noteSaved'));
  };

  const onCopy = async (value: string) => {
    const ok = await copyText(value);
    flash(ok ? 'success' : 'error', ok ? t('adminDetail.copied') : t('adminDetail.copyUnsupported'));
  };

  const onDelete = async () => {
    const { error: err } = await archive();
    if (err) {
      flash('error', t('adminDetail.saveFailed'));
      return;
    }
    router.back();
  };

  // --- Auth states ---
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
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-accent/15 border border-accent/40 items-center justify-center mb-4">
            <ShieldAlert color={colors.accent} size={28} strokeWidth={2} />
          </View>
          <Text className="text-ink font-heebo-bold text-xl text-center">
            {t('admin.accessDenied')}
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-3 pb-3 gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-glass-border items-center justify-center"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <ArrowLeft color={colors.violetGlow} size={18} strokeWidth={2.5} />
          </Pressable>
          <Text className="text-ink font-heebo-black text-lg flex-1" numberOfLines={1}>
            {applicant?.full_name ?? t('adminDetail.title')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.violetGlow} />
          </View>
        ) : !applicant ? (
          <View className="flex-1 px-5">
            <GlassCard variant="subtle">
              <EmptyState
                title={t('adminDetail.notFoundTitle')}
                subtitle={error ?? t('adminDetail.notFoundSubtitle')}
              />
            </GlassCard>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {banner ? <View className="mb-1"><StatusBanner status={banner} /></View> : null}

            {/* Profile */}
            <GlassCard variant="subtle">
              <View className="p-5">
                <View className="flex-row items-center gap-3.5 mb-4">
                  <Avatar initials={computeInitials(applicant.full_name)} seed={applicant.full_name} size="lg" />
                  <View className="flex-1">
                    <Text className="text-ink font-heebo-black text-xl" numberOfLines={1}>
                      {applicant.full_name}
                    </Text>
                    <View className="mt-1.5">
                      <StatusBadge status={applicant.onboarding_status} />
                    </View>
                  </View>
                </View>

                <InfoRow icon={<Mail color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.email')} value={applicant.email} />
                <InfoRow icon={<Phone color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.phone')} value={applicant.phone} />
                <InfoRow icon={<Building2 color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.businessName')} value={applicant.business_name} />
                <InfoRow icon={<Building2 color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.businessType')} value={t(`businessType.${applicant.business_type}`)} />
                <InfoRow icon={<Globe color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.country')} value={applicant.country} />
                <InfoRow icon={<MapPin color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.city')} value={applicant.city} />
                <InfoRow icon={<Globe color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('admin.colInternational')} value={applicant.works_internationally ? t('common.yes') : t('common.no')} />
                <InfoRow label={t('adminDetail.income')} value={t(`incomeRange.${applicant.monthly_income_range}`)} />
                <InfoRow label={t('adminDetail.tools')} value={applicant.current_tools.length ? applicant.current_tools.map((tk) => t(`tools.${tk}`)).join(' · ') : null} />
                <InfoRow label={t('adminDetail.referral')} value={applicant.referral_source} />
                <InfoRow icon={<Calendar color={colors.violetGlow} size={16} strokeWidth={2.2} />} label={t('adminDetail.registered')} value={formatFullDateTime(applicant.created_at)} last />
              </View>
            </GlassCard>

            {/* Contact actions */}
            <SectionLabel>{t('adminDetail.contact')}</SectionLabel>
            <GlassCard variant="subtle">
              <View className="p-4 flex-row flex-wrap gap-2.5">
                {applicant.phone ? (
                  <ActionChip icon={<Phone color="#ffffff" size={16} strokeWidth={2.3} />} label={t('adminDetail.call')} solid onPress={() => openExternal(telUrl(applicant.phone!))} />
                ) : null}
                {applicant.phone ? (
                  <ActionChip icon={<MessageCircle color="#ffffff" size={16} strokeWidth={2.3} />} label={t('adminDetail.whatsapp')} tone="bg-mint" solid onPress={() => openExternal(whatsappUrl(applicant.phone!, t('adminDetail.whatsappGreeting', { name: applicant.full_name })))} />
                ) : null}
                <ActionChip icon={<Mail color={colors.violetGlow} size={16} strokeWidth={2.3} />} label={t('adminDetail.emailAction')} onPress={() => openExternal(mailtoUrl(applicant.email))} />
                <ActionChip icon={<Copy color={colors.violetGlow} size={16} strokeWidth={2.3} />} label={t('adminDetail.copyEmail')} onPress={() => onCopy(applicant.email)} />
                {applicant.phone ? (
                  <ActionChip icon={<Copy color={colors.violetGlow} size={16} strokeWidth={2.3} />} label={t('adminDetail.copyPhone')} onPress={() => onCopy(applicant.phone!)} />
                ) : null}
              </View>
            </GlassCard>

            {/* Status actions */}
            <SectionLabel>{t('adminDetail.status')}</SectionLabel>
            <GlassCard variant="subtle">
              <View className="p-4 gap-2.5">
                {STATUS_ACTIONS.map((a) => {
                  const active = applicant.onboarding_status === a.value;
                  return (
                    <Pressable
                      key={a.value}
                      onPress={() => onStatus(a.value)}
                      className={`flex-row items-center justify-center gap-2 rounded-2xl py-3 ${active ? a.tone : 'bg-white border border-glass-border'}`}
                      style={({ pressed }) => pressed && { opacity: 0.85 }}
                    >
                      {active ? <Check color="#ffffff" size={16} strokeWidth={2.6} /> : null}
                      <Text className={`font-heebo-bold text-sm ${active ? 'text-white' : 'text-ink'}`}>
                        {t(`admin.status.${a.value}`)}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => onStatus('pending')}
                  className={`flex-row items-center justify-center gap-2 rounded-2xl py-3 ${applicant.onboarding_status === 'pending' ? 'bg-ink-faint/30' : 'bg-white border border-glass-border'}`}
                  style={({ pressed }) => pressed && { opacity: 0.85 }}
                >
                  {applicant.onboarding_status === 'pending' ? <Clock color={colors.muted} size={16} strokeWidth={2.4} /> : null}
                  <Text className="font-heebo-bold text-sm text-ink-soft">{t('admin.status.pending')}</Text>
                </Pressable>
              </View>
            </GlassCard>

            {/* Priority */}
            <SectionLabel>{t('admin.colPriority')}</SectionLabel>
            <GlassCard variant="subtle">
              <View className="p-4">
                <SegmentedControl<EarlyAccessPriority>
                  label={t('admin.colPriority')}
                  options={EARLY_ACCESS_PRIORITIES.map((p) => ({ value: p, label: t(`admin.priority.${p}`) }))}
                  value={applicant.early_access_priority}
                  onChange={onPriority}
                  activeClass="bg-mint/30"
                />
              </View>
            </GlassCard>

            {/* Internal notes */}
            <SectionLabel>{t('adminDetail.internalNotes')}</SectionLabel>
            <GlassCard variant="subtle">
              <View className="p-4 gap-3">
                <Text className="text-ink-faint font-heebo text-xs">{t('adminDetail.notesHint')}</Text>
                <TextInput
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                  placeholder={t('adminDetail.notesPlaceholder')}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-sky border border-glass-border rounded-2xl px-4 py-3 text-ink font-heebo text-base"
                  style={{ fontFamily: 'Heebo_400Regular', color: '#0F172A', minHeight: 96 }}
                />
                <PrimaryButton
                  label={savingNote ? t('adminDetail.saving') : t('adminDetail.saveNote')}
                  onPress={onSaveNote}
                  variant="secondary"
                  size="sm"
                  disabled={savingNote}
                />
              </View>
            </GlassCard>

            {/* Delete (archive) */}
            <View className="mt-5">
              {confirmingDelete ? (
                <GlassCard variant="subtle">
                  <View className="p-4 gap-3">
                    <Text className="text-ink font-heebo-bold text-sm text-center">
                      {t('adminDetail.deleteConfirm')}
                    </Text>
                    <View className="flex-row gap-2.5">
                      <Pressable
                        onPress={onDelete}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 bg-accent"
                        style={({ pressed }) => pressed && { opacity: 0.85 }}
                      >
                        <Trash2 color="#ffffff" size={16} strokeWidth={2.3} />
                        <Text className="text-white font-heebo-bold text-sm">{t('adminDetail.deleteYes')}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setConfirmingDelete(false)}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 bg-white border border-glass-border"
                        style={({ pressed }) => pressed && { opacity: 0.85 }}
                      >
                        <X color={colors.muted} size={16} strokeWidth={2.3} />
                        <Text className="text-ink font-heebo-bold text-sm">{t('common.cancel')}</Text>
                      </Pressable>
                    </View>
                  </View>
                </GlassCard>
              ) : (
                <Pressable
                  onPress={() => setConfirmingDelete(true)}
                  className="flex-row items-center justify-center gap-2 rounded-2xl py-3 border border-accent/40 bg-accent/5"
                  style={({ pressed }) => pressed && { opacity: 0.8 }}
                >
                  <Trash2 color={colors.accent} size={16} strokeWidth={2.3} />
                  <Text className="text-accent font-heebo-bold text-sm">{t('adminDetail.delete')}</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="text-ink font-heebo-bold text-sm mt-5 mb-2">{children}</Text>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon?: ReactNode;
  label: string;
  value: string | null | undefined;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center py-2.5 gap-3 ${last ? '' : 'border-b border-glass-border'}`}>
      {icon ? <View className="w-5 items-center">{icon}</View> : <View className="w-5" />}
      <Text className="text-ink-faint font-heebo text-xs w-28">{label}</Text>
      <Text className="text-ink font-heebo-medium text-sm flex-1 text-left" numberOfLines={2}>
        {value && String(value).trim() ? value : '—'}
      </Text>
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
  solid,
  tone = 'bg-turquoise',
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  solid?: boolean;
  tone?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-2xl px-4 py-2.5 ${solid ? tone : 'bg-white border border-glass-border'}`}
      style={({ pressed }) => pressed && { opacity: 0.8 }}
    >
      {icon}
      <Text className={`font-heebo-bold text-sm ${solid ? 'text-white' : 'text-violet-glow'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
