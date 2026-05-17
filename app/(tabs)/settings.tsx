import React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { usePreferencesStore } from '@/stores/preferences.store';
import { clearCurrentUserData } from '@/lib/userScopedStorage';
import { clearAppCache } from '@/services/storage/async.storage';
import { APP_NAME, APP_VERSION } from '@/constants/app.constants';
import { COLORS } from '@/theme/colors';

export default function SettingsScreen() {
  const { notificationsEnabled, setNotificationsEnabled } = usePreferencesStore();

  async function handleClearCache() {
    Alert.alert(
      'Clear Cache',
      'This will clear cached data. Your bookmarks and enrollments will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAppCache();
          },
        },
      ],
    );
  }

  async function handleClearMyData() {
    Alert.alert(
      'Clear My Data',
      'This will permanently delete your bookmarks, enrollments, preferences, and activity from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearCurrentUserData();
          },
        },
      ],
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-2">
          <Text className="text-slate-100 text-2xl font-bold">Settings</Text>
        </View>

        {/* Notifications */}
        <View className="px-4 mt-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2 ml-1">
            Notifications
          </Text>
          <Card padding="none" className="overflow-hidden">
            <View className="flex-row items-center px-5 py-4">
              <Text className="text-slate-100 text-base flex-1">🔔 Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.bgElevated, true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </View>

        {/* Data */}
        <View className="px-4 mt-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2 ml-1">
            Data
          </Text>
          <Card padding="none" className="overflow-hidden">
            <Pressable
              onPress={handleClearCache}
              className="flex-row items-center px-5 py-4 active:bg-slate-800 border-b border-slate-800"
            >
              <Text className="text-slate-300 text-base flex-1">🗑️ Clear Cache</Text>
              <Text className="text-slate-500">›</Text>
            </Pressable>
            <Pressable
              onPress={handleClearMyData}
              className="flex-row items-center px-5 py-4 active:bg-slate-800"
            >
              <Text className="text-red-400 text-base flex-1">⚠️ Clear My Data</Text>
              <Text className="text-slate-500">›</Text>
            </Pressable>
          </Card>
        </View>

        {/* About */}
        <View className="px-4 mt-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2 ml-1">
            About
          </Text>
          <Card elevated>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 text-sm">App</Text>
              <Text className="text-slate-100 text-sm font-medium">{APP_NAME}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-sm">Version</Text>
              <Text className="text-slate-100 text-sm font-medium">{APP_VERSION}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
