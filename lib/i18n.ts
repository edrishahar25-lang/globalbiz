import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import he from '@/locales/he.json';
import en from '@/locales/en.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';

export const SUPPORTED_LANGUAGES = ['he', 'en', 'de', 'es', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const RTL_LANGUAGES: readonly Language[] = ['he'];

const LANGUAGE_STORAGE_KEY = 'globalbiz.language';

const isSupported = (code: string): code is Language =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

export const isRtlLanguage = (lang: string): boolean =>
  (RTL_LANGUAGES as readonly string[]).includes(lang);

const resources = {
  he: { translation: he },
  en: { translation: en },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr },
};

export async function loadStoredLanguage(): Promise<Language> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;
  } catch {
    // fall through to device locale
  }
  const deviceCode = getLocales()[0]?.languageCode ?? null;
  if (deviceCode && isSupported(deviceCode)) return deviceCode;
  return 'he';
}

export async function persistLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

let initialized = false;

export function initI18n(initialLanguage: Language): void {
  if (initialized) {
    void i18n.changeLanguage(initialLanguage);
    return;
  }
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    compatibilityJSON: 'v4',
  });
  initialized = true;
}

export default i18n;
