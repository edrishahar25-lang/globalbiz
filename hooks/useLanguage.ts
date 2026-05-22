import { useCallback } from 'react';
import { DevSettings, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  isRtlLanguage,
  persistLanguage,
  SUPPORTED_LANGUAGES,
  type Language,
} from '@/lib/i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const current = i18n.language as Language;

  const change = useCallback(async (next: Language) => {
    if (next === current) return;
    await persistLanguage(next);
    await i18n.changeLanguage(next);
    const shouldBeRtl = isRtlLanguage(next);

    if (Platform.OS === 'web') {
      // Web: set <html dir> + lang, then full reload so all CSS
      // direction-dependent styles re-apply cleanly.
      if (typeof document !== 'undefined') {
        document.documentElement.dir = shouldBeRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = next;
      }
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return;
    }

    if (shouldBeRtl !== I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(shouldBeRtl);
      try {
        DevSettings.reload();
      } catch {
        // production build without expo-updates: silent — UI shows hint
      }
    }
  }, [current, i18n]);

  return { current, change, supported: SUPPORTED_LANGUAGES };
}
