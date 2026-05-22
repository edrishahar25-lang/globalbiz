import '../global.css';

import { useEffect, useState } from 'react';
import { ActivityIndicator, DevSettings, I18nManager, Platform, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
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
import { useTranslation } from 'react-i18next';

import { initI18n, isRtlLanguage, loadStoredLanguage } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { colors } from '@/constants/colors';

I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync().catch(() => {});

function FullScreenLoader({ label }: { label?: string }) {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: '#0a0612' }}
    >
      <ActivityIndicator size="large" color={colors.violetGlow} />
      {label ? (
        <Text className="text-white/55 font-heebo text-sm mt-4" style={{ fontFamily: 'Heebo_400Regular' }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function ProtectedNavigator() {
  const { session, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [initializing, session, segments, router]);

  if (initializing) {
    return <FullScreenLoader label={t('auth.loadingApp')} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0612' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
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
  );
}

export default function RootLayout() {
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
        if (typeof document !== 'undefined') {
          document.documentElement.dir = shouldBeRtl ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
        initI18n(lang);
        if (!cancelled) setI18nReady(true);
        return;
      }

      if (shouldBeRtl !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRtl);
        try {
          DevSettings.reload();
        } catch {
          // production native build without expo-updates: fall through
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
    return <View className="flex-1" style={{ backgroundColor: '#0a0612' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0612' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <ProtectedNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
