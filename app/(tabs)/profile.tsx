import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useBookmarkStore } from '@/stores/bookmark.store';
import { useEnrollmentStore } from '@/stores/enrollment.store';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { formatDate } from '@/utils/date.utils';

interface StatCardProps { value: number | string; label: string; icon: string }
function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <Card className="flex-1 mx-1 items-center py-4" elevated>
      <Text className="text-2xl mb-1">{icon}</Text>
      <Text className="text-slate-100 text-xl font-bold">{value}</Text>
      <Text className="text-slate-400 text-xs text-center mt-0.5">{label}</Text>
    </Card>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, avatarUri, updateAvatar } = useAuthStore();
  const bookmarkCount = useBookmarkStore((s) => s.bookmarkedIds.length);
  const enrollmentCount = useEnrollmentStore((s) => s.enrolledIds.length);
  const { logout } = useLogout();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateAvatar(result.assets[0].uri);
    }
  };

  if (!user) return null;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-slate-900 px-6 pt-10 pb-8 items-center border-b border-slate-800">
          {/* Avatar with + button */}
          <Pressable onPress={pickImage} style={localStyles.avatarWrapper}>
            <View style={[localStyles.avatarCircle, !avatarUri && { backgroundColor: '#4338CA', justifyContent: 'center', alignItems: 'center' }]}>
              {avatarUri ? (
                <Image 
                  source={{ uri: avatarUri }} 
                  style={{ width: 80, height: 80, borderRadius: 40 }} 
                  contentFit="cover" 
                />
              ) : (
                <Text style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>
                  {user?.username?.charAt(0)?.toUpperCase() ?? 'U'}
                </Text>
              )}
            </View>
            <View style={localStyles.plusButton}>
              <Text style={localStyles.plusText}>+</Text>
            </View>
          </Pressable>

          <Text className="text-slate-100 text-2xl font-bold mt-4">{user.username}</Text>
          <Text className="text-slate-400 text-sm mt-1">{user.email}</Text>
          <View className="bg-brand-900 px-3 py-1 rounded-full mt-3">
            <Text className="text-brand-300 text-xs font-semibold capitalize">{user.role}</Text>
          </View>
          <Text className="text-slate-500 text-xs mt-2">
            Member since {formatDate(user.createdAt)}
          </Text>
        </View>

        {/* Stats */}
        <View className="px-4 pt-6">
          <Text className="text-slate-100 text-lg font-bold mb-3">Activity</Text>
          <View className="flex-row">
            <StatCard value={enrollmentCount} label="Enrolled" icon="🎓" />
            <StatCard value={bookmarkCount} label="Bookmarked" icon="🔖" />
            <StatCard value={enrollmentCount + bookmarkCount} label="Total Activity" icon="⚡" />
          </View>
        </View>

        {/* Actions */}
        <View style={localStyles.menuSection}>
          <Text className="text-slate-100 text-lg font-bold mb-3">Account</Text>
          <View style={localStyles.menuCard}>
            {[
              { icon: '🎓', label: 'My Courses', onPress: () => router.push('/(tabs)/bookmarks') },
              { icon: '⚙️', label: 'Settings', onPress: () => router.push('/(tabs)/settings') },
            ].map((item, idx, arr) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[
                  localStyles.menuRow,
                  idx < arr.length - 1 && localStyles.menuRowBorder,
                ]}
              >
                <View style={localStyles.menuLeft}>
                  <Text style={localStyles.menuIcon}>{item.icon}</Text>
                  <Text style={localStyles.menuLabel}>{item.label}</Text>
                </View>
                <Text style={localStyles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View className="px-4 mt-6">
          <Button title="Sign Out" onPress={logout} variant="danger" fullWidth size="lg" />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  avatarWrapper: {
    width: 88,
    height: 88,
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#DFFA41',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plusButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DFFA41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#232322',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  menuCard: {
    backgroundColor: '#1A2236',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    color: '#F1F5F9',
    fontSize: 16,
  },
  chevron: {
    color: '#64748B',
    fontSize: 20,
  },
});
