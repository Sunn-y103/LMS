import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/(tabs)/home" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0F1A' } }} />
  );
}
