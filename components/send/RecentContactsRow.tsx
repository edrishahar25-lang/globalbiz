import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui';
import type { Contact } from '@/types';

type Props = {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
};

export function RecentContactsRow({ contacts, onSelect }: Props) {
  const handle = (c: Contact) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onSelect(c);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
    >
      {contacts.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => handle(c)}
          className="items-center"
          style={({ pressed }) => pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }}
        >
          <Avatar initials={c.initials} seed={c.name} size="lg" flag={c.flag} />
          <Text
            className="text-white font-heebo-medium text-xs mt-2"
            numberOfLines={1}
            style={{ maxWidth: 64 }}
          >
            {c.name.split(' ')[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
