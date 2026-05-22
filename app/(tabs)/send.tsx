import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react-native';
import { GlassCard, GradientBackground, PrimaryButton } from '@/components/ui';
import { ContactRow, RecentContactsRow, SearchInput } from '@/components/send';
import { contacts } from '@/data/mockData';
import { colors } from '@/constants/colors';
import type { Contact } from '@/types';

export default function SendScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const recent = useMemo(
    () =>
      contacts
        .filter((c) => c.lastInteractionAt)
        .sort((a, b) => (b.lastInteractionAt ?? '').localeCompare(a.lastInteractionAt ?? '')),
    [],
  );

  const filteredAll = useMemo(() => {
    const q = query.trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.includes(q) || c.role.includes(q),
    );
  }, [query]);

  const handleSelect = (contact: Contact) => {
    router.push({
      pathname: '/send/[contactId]',
      params: { contactId: contact.id },
    });
  };

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-3 pb-5">
            <Text className="text-white font-heebo-black text-3xl">{t('send.title')}</Text>
          </View>

          <View className="px-5 mb-6">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t('send.searchPlaceholder')}
            />
          </View>

          {query.length === 0 && recent.length > 0 && (
            <View className="mb-7">
              <Text className="text-white/55 font-heebo-medium text-xs px-5 mb-3 uppercase tracking-wide">
                {t('send.recentContacts')}
              </Text>
              <RecentContactsRow contacts={recent} onSelect={handleSelect} />
            </View>
          )}

          <View className="px-5 mb-3">
            <Text className="text-white font-heebo-bold text-lg">{t('send.allContacts')}</Text>
          </View>

          <View className="px-5">
            <GlassCard variant="subtle">
              {filteredAll.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-white/55 font-heebo text-sm">{t('send.noResults')}</Text>
                </View>
              ) : (
                filteredAll.map((c, i) => (
                  <View key={c.id}>
                    <ContactRow contact={c} onPress={handleSelect} />
                    {i < filteredAll.length - 1 && (
                      <View className="h-px bg-glass-border mx-5" />
                    )}
                  </View>
                ))
              )}
            </GlassCard>
          </View>

          <View className="px-5 mt-6">
            <PrimaryButton
              label={t('send.addContact')}
              onPress={() =>
                Alert.alert(t('demo.addContactTitle'), t('demo.addContactBody'))
              }
              variant="secondary"
              size="md"
              icon={<UserPlus color={colors.white} size={18} strokeWidth={2.2} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
