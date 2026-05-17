import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth/hooks/useSession';
import { COLORS } from '@/theme/colors';
import { APP_NAME } from '@/constants/app.constants';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center">
      <Text className="text-6xl mb-4">📚</Text>
      <Text className="text-3xl font-bold text-brand-400 mb-2">{APP_NAME}</Text>
      <Text className="text-slate-500 text-base mb-10">Learn without limits</Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
