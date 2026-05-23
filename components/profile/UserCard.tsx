import { Text, View } from 'react-native';
import { Avatar, GlassCard } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { computeInitials, displayName } from '@/lib/identity';

export function UserCard() {
  const { user, profile } = useAuth();

  const name = displayName({ fullName: profile?.full_name, email: user?.email });
  const initials = computeInitials(name);
  const businessName = profile?.business_name?.trim() ?? '';

  return (
    <GlassCard variant="primary">
      <View className="p-6 items-center">
        <Avatar initials={initials} seed={name} size="xl" flag="🇮🇱" />
        <Text className="text-ink font-heebo-black text-2xl mt-4">{name}</Text>
        {businessName ? (
          <Text className="text-ink-soft font-heebo-medium text-base mt-0.5">
            {businessName}
          </Text>
        ) : null}
        {user?.email ? (
          <Text className="text-ink-faint font-heebo text-xs mt-2">{user.email}</Text>
        ) : null}
      </View>
    </GlassCard>
  );
}
