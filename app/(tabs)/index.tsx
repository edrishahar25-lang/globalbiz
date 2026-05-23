import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  FileText,
  Inbox,
  Send,
} from 'lucide-react-native';
import { Avatar, EmptyState, GlassCard, GradientBackground } from '@/components/ui';
import {
  BalanceHero,
  CurrencyRow,
  QuickActions,
  TransactionItem,
  type QuickActionItem,
} from '@/components/home';
import { balances, totalBalanceIls, transactions } from '@/data/mockData';
import { colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { computeInitials, displayName } from '@/lib/identity';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const recentTransactions = transactions.slice(0, 8);
  const userName = displayName({ fullName: profile?.full_name, email: user?.email });
  const userInitials = computeInitials(userName);

  const actions: QuickActionItem[] = [
    {
      id: 'send',
      label: t('actions.send'),
      icon: <Send color={colors.violetGlow} size={22} strokeWidth={2.2} />,
      onPress: () => router.push('/send'),
    },
    {
      id: 'receive',
      label: t('actions.receive'),
      icon: <ArrowDownToLine color={colors.mint} size={22} strokeWidth={2.2} />,
      onPress: () => router.push('/receive'),
    },
    {
      id: 'invoice',
      label: t('actions.invoice'),
      icon: <FileText color={colors.cyanBase} size={22} strokeWidth={2.2} />,
      onPress: () => router.push('/receive'),
    },
    {
      id: 'convert',
      label: t('actions.convert'),
      icon: <ArrowLeftRight color={colors.accent} size={22} strokeWidth={2.2} />,
      onPress: () => router.push('/convert'),
    },
  ];

  return (
    <GradientBackground variant="bgRich">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between px-5 pt-3 pb-6">
            <View className="flex-1">
              <Text className="text-white/55 font-heebo text-sm">{t('home.greeting')}</Text>
              <Text className="text-white font-heebo-bold text-xl">{userName}</Text>
            </View>
            <Avatar initials={userInitials} seed={userName} size="md" flag="🇮🇱" />
          </View>

          <View className="px-5 mb-5">
            <BalanceHero totalIls={totalBalanceIls} />
          </View>

          {balances.length > 0 ? (
            <View className="mb-6">
              <CurrencyRow balances={balances} />
            </View>
          ) : null}

          <View className="mb-7">
            <QuickActions actions={actions} />
          </View>

          <View className="px-5 mb-3 flex-row items-center justify-between">
            <Text className="text-white font-heebo-bold text-lg">{t('home.recentActivity')}</Text>
            {recentTransactions.length > 0 ? (
              <Pressable
                onPress={() =>
                  Alert.alert(t('demo.viewAllTitle'), t('demo.viewAllBody'))
                }
                hitSlop={10}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text className="text-violet-glow font-heebo-medium text-sm">
                  {t('home.viewAll')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="px-5">
            <GlassCard variant="subtle">
              {recentTransactions.length === 0 ? (
                <EmptyState
                  icon={<Inbox color={colors.violetGlow} size={28} strokeWidth={1.8} />}
                  title={t('empty.transactions')}
                  subtitle={t('empty.transactionsSubtitle')}
                />
              ) : (
                recentTransactions.map((tx, i) => (
                  <View key={tx.id}>
                    <TransactionItem
                      transaction={tx}
                      onPress={(t) =>
                        router.push({
                          pathname: '/transaction/[id]',
                          params: { id: t.id },
                        })
                      }
                    />
                    {i < recentTransactions.length - 1 && (
                      <View className="h-px bg-glass-border mx-5" />
                    )}
                  </View>
                ))
              )}
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
