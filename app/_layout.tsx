import '../global.css';

import { useEffect, useState } from 'react';
import { DevSettings, I18nManager, Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_700Bold,
  Heebo_900Black,
} from '@expo-google-fonts/heebo';

import { initI18n, isRtlLanguage, loadStoredLanguage } from '@/lib/i18n';

I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // On web, Heebo is loaded via Google Fonts CDN (injected into index.html);
  // we MUST skip useFonts there — its local .ttf URLs 404 to HTML, breaking the browser.
  const fontMap =
    Platform.OS === 'web'
      ? {}
      : {
          Heebo_400Regular,
          Heebo_500Medium,
          Heebo_700Bold,
          Heebo_900Black,
        };
  const [nativeFontsLoaded] = useFonts(fontMap);
  const fontsLoaded = Platform.OS === 'web' ? true : nativeFontsLoaded;
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lang = await loadStoredLanguage();
      const shouldBeRtl = isRtlLanguage(lang);

      if (Platform.OS === 'web') {
        // Web: direction is controlled by the `dir` attribute on <html>,
        // not by I18nManager. forceRTL is a no-op and DevSettings.reload
        // is missing in production builds, so a reload would hang.
        // Just set the document direction and proceed.
        if (typeof document !== 'undefined') {
          document.documentElement.dir = shouldBeRtl ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
        initI18n(lang);
        if (!cancelled) setI18nReady(true);
        return;
      }

      // Native: I18nManager change requires a real reload to take effect.
      if (shouldBeRtl !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRtl);
        try {
          DevSettings.reload();
        } catch {
          // dev API missing — fall through and hope it picks up next launch
        }
        return;
      }
      initI18n(lang);
      if (!cancelled) setI18nReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && i18nReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, i18nReady]);

  if (!fontsLoaded || !i18nReady) {
    return <View className="flex-1 bg-[#0a0612]" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0612' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0612' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="transaction/[id]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="convert"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="send/[contactId]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="send/success"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="invoice/created"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
