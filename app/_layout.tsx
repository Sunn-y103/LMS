import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/providers/QueryProvider';
import { NetworkProvider } from '@/providers/NetworkProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryProvider>
          <NetworkProvider>
            <NotificationProvider>
              <OfflineBanner />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F1A' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="course/[id]"
                  options={{ headerShown: false, presentation: 'card' }}
                />
                <Stack.Screen
                  name="course/webview"
                  options={{ headerShown: false, presentation: 'fullScreenModal' }}
                />
              </Stack>
            </NotificationProvider>
          </NetworkProvider>
        </QueryProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
