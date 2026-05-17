import React, { useState, useCallback, useEffect } from 'react';
import { Text, TextInput, View, Pressable, Modal, ScrollView } from 'react-native';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { CourseList } from '@/components/course/CourseList';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useSearchCourses } from '@/features/courses/hooks/useSearchCourses';
import { useDebounce } from '@/hooks/useDebounce';
import { RetryView } from '@/components/common/RetryView';
import { normalizeError } from '@/utils/error.utils';
import { COLORS } from '@/theme/colors';
import { DEBOUNCE_DELAY_MS } from '@/constants/app.constants';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY_MS);

  const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Notifications.getPresentedNotificationsAsync().then((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => sub.remove();
  }, []);

  const openNotifications = async () => {
    setIsModalVisible(true);
    setUnreadCount(0);
    await Notifications.dismissAllNotificationsAsync();
  };

  const {
    courses,
    isLoading,
    isFetchingNextPage,
    isRefreshing,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
  } = useCourses();

  const filteredCourses = useSearchCourses(courses, debouncedSearch);

  const handleEndReached = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error && !isLoading && courses.length === 0) {
    return (
      <ScreenWrapper>
        <RetryView error={normalizeError(error)} onRetry={refetch} />
      </ScreenWrapper>
    );
  }

  const Header = (
    <View className="pt-4 pb-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-slate-100 text-2xl font-bold">Hi, {user?.username} 👋</Text>
        <Pressable onPress={openNotifications} className="relative p-2" accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={24} color={COLORS.textSecondary} />
          {unreadCount > 0 && (
            <View className="absolute top-1 right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
      <Text className="text-slate-400 text-sm mb-4">Discover what to learn next</Text>
      <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-2">
        <Text className="text-slate-400 mr-2">🔍</Text>
        <TextInput
          className="flex-1 text-slate-100 text-base"
          placeholder="Search courses, instructors…"
          placeholderTextColor={COLORS.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          accessibilityLabel="Search courses"
        />
        {searchInput.length > 0 && (
          <Text
            className="text-slate-400 text-sm ml-2"
            onPress={() => setSearchInput('')}
          >
            ✕
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <CourseList
        courses={filteredCourses}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefreshing={isRefreshing}
        hasNextPage={hasNextPage}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
        ListHeaderComponent={Header}
      />
      
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 bg-slate-900 pt-12 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-slate-100 text-2xl font-bold">Notifications</Text>
            <Pressable onPress={() => setIsModalVisible(false)} accessibilityLabel="Close notifications">
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </Pressable>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <Text className="text-slate-400 text-center mt-10">No notifications yet.</Text>
            ) : (
              notifications.map((n) => (
                <View key={n.request.identifier} className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700">
                  <Text className="text-slate-100 font-bold mb-1">{n.request.content.title}</Text>
                  <Text className="text-slate-400 text-sm">{n.request.content.body}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
