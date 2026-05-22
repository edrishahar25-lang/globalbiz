import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import { Avatar } from '@/components/ui';
import { colors } from '@/constants/colors';
import { formatIls } from '@/lib/format';
import type { Contact } from '@/types';

type Props = {
  contact: Contact;
  onPress: (contact: Contact) => void;
};

export function ContactRow({ contact, onPress }: Props) {
  const { t } = useTranslation();
  const handle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress(contact);
  };

  return (
    <Pressable
      onPress={handle}
      className="flex-row items-center px-5 py-3.5 gap-3"
      style={({ pressed }) => pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      <Avatar initials={contact.initials} seed={contact.name} flag={contact.flag} size="md" />
      <View className="flex-1">
        <Text className="text-white font-heebo-medium text-base">{contact.name}</Text>
        <Text className="text-white/45 font-heebo text-xs mt-0.5">{contact.role}</Text>
      </View>
      <View className="items-end">
        <Text className="text-white/40 font-heebo text-[10px]">{t('send.totalSentLabel')}</Text>
        <Text className="text-white/80 font-heebo-medium text-xs mt-0.5">
          {formatIls(contact.totalSentIls)}
        </Text>
      </View>
      <ChevronLeft color={colors.muted} size={16} strokeWidth={2.2} />
    </Pressable>
  );
}
