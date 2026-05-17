import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useBookmarkStore } from '@/stores/bookmark.store';
import { useEnrollmentStore } from '@/stores/enrollment.store';
import {
  useProgressStore,
  selectCompletedLessonIds,
  selectCompletedCount,
} from '@/stores/progress.store';
import { toCourseWebViewParams } from '@/types/navigation.types';
import { COLORS } from '@/theme/colors';
import type { Chapter, Lesson } from '@/types/domain.types';

// ─── Lesson Row Component ─────────────────────────────────────────────────────
const LessonRow = React.memo(function LessonRow({
  lesson,
  index,
  isComplete,
  isActive,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  isComplete: boolean;
  isActive: boolean;
  onPress: () => void;
}) {
  const typeIcon = lesson.type === 'video'
    ? 'play-circle'
    : lesson.type === 'quiz'
      ? 'help-circle'
      : 'document-text';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.lessonRow, isActive && styles.lessonRowActive]}
    >
      <View style={[styles.lessonStatus, isComplete && styles.lessonStatusDone]}>
        {isComplete ? (
          <Ionicons name="checkmark" size={12} color="#fff" />
        ) : (
          <Text style={styles.lessonNumber}>{index + 1}</Text>
        )}
      </View>
      <View style={styles.lessonInfo}>
        <Text style={[styles.lessonTitle, isComplete && styles.lessonTitleDone]} numberOfLines={1}>
          {lesson.title}
        </Text>
        <View style={styles.lessonMeta}>
          <Ionicons name={typeIcon as any} size={12} color={COLORS.textMuted} />
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        </View>
      </View>
      <Ionicons
        name={isComplete ? 'checkmark-circle' : 'play-circle-outline'}
        size={22}
        color={isComplete ? COLORS.success : COLORS.textMuted}
      />
    </Pressable>
  );
});

// ─── Chapter Section Component ────────────────────────────────────────────────
function ChapterSection({
  chapter,
  chapterIndex,
  completedIds,
  onLessonPress,
  nextLessonId,
}: {
  chapter: Chapter;
  chapterIndex: number;
  completedIds: string[];
  onLessonPress: (lesson: Lesson, chapterTitle: string) => void;
  nextLessonId: string | null;
}) {
  const [expanded, setExpanded] = useState(chapterIndex === 0);
  const completedInChapter = useMemo(
    () => chapter.lessons.filter((l) => completedIds.includes(l.id)).length,
    [chapter.lessons, completedIds],
  );
  const allDone = completedInChapter === chapter.lessons.length;

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <View style={styles.chapterContainer}>
      <Pressable onPress={toggle} style={styles.chapterHeader}>
        <View style={styles.chapterLeft}>
          <Ionicons
            name={allDone ? 'checkmark-circle' : 'folder-outline'}
            size={20}
            color={allDone ? COLORS.success : COLORS.primary}
          />
          <View style={styles.chapterTextWrap}>
            <Text style={styles.chapterTitle} numberOfLines={1}>{chapter.title}</Text>
            <Text style={styles.chapterMeta}>{completedInChapter}/{chapter.lessons.length} lessons</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
      </Pressable>

      {expanded && (
        <View style={styles.lessonList}>
          {chapter.lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx}
              isComplete={completedIds.includes(lesson.id)}
              isActive={lesson.id === nextLessonId}
              onPress={() => onLessonPress(lesson, chapter.title)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const courseId = Number(id);

  const { courses } = useCourses();
  const course = courses.find((c) => c.id === courseId);

  // Stable primitive selectors — no new references per render
  const isBookmarked = useBookmarkStore((s) => s.bookmarkedIds.includes(courseId));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const isEnrolled = useEnrollmentStore((s) => s.enrolledIds.includes(courseId));
  const enroll = useEnrollmentStore((s) => s.enroll);

  // Stable selector — returns existing array from store or EMPTY_ARRAY constant
  const completedIds = useProgressStore((s) => selectCompletedLessonIds(s, courseId));
  const completedCount = useProgressStore((s) => selectCompletedCount(s, courseId));

  const progressPct = useMemo(() => {
    if (!course || course.totalLessons === 0) return 0;
    return Math.round((completedCount / course.totalLessons) * 100);
  }, [course, completedCount]);

  // Find the next incomplete lesson
  const nextLessonInfo = useMemo(() => {
    if (!course) return null;
    for (const ch of course.chapters) {
      for (const lesson of ch.lessons) {
        if (!completedIds.includes(lesson.id)) {
          return { lesson, chapterTitle: ch.title };
        }
      }
    }
    return null;
  }, [course, completedIds]);

  const handleLessonPress = useCallback((lesson: Lesson, chapterTitle: string) => {
    if (!course) return;
    if (!isEnrolled) enroll(courseId);
    const params = toCourseWebViewParams(course, lesson.id, lesson.title, chapterTitle);
    router.push({ pathname: '/course/webview', params: params as any });
  }, [course, isEnrolled, enroll, courseId, router]);

  const handleContinue = useCallback(() => {
    if (!nextLessonInfo || !course) return;
    if (!isEnrolled) enroll(courseId);
    const params = toCourseWebViewParams(
      course, nextLessonInfo.lesson.id, nextLessonInfo.lesson.title, nextLessonInfo.chapterTitle,
    );
    router.push({ pathname: '/course/webview', params: params as any });
  }, [nextLessonInfo, course, isEnrolled, enroll, courseId, router]);

  if (!course) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400 text-base">Course not found.</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text className="text-brand-400 font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const imageUri = course.thumbnail || (course.images.length > 0 ? course.images[0] : '');

  return (
    <ScreenWrapper>
      <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: '#1A2236', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 48 }}>📚</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Badges */}
          <View className="flex-row gap-2 mb-3">
            <Badge label={course.category} variant="primary" />
            <Badge label={course.level} variant="info" />
            {progressPct === 100 && <Badge label="✓ Completed" variant="success" />}
          </View>

          <Text style={styles.title}>{course.title}</Text>

          {/* Instructor */}
          <View style={styles.instructorRow}>
            <Avatar uri={course.instructor.avatarThumb} size="sm" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.instructorName}>{course.instructor.name}</Text>
              <Text style={styles.instructorLocation}>{course.instructor.location}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {course.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.totalLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${course.price}</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>

          {/* Progress (enrolled only) */}
          {isEnrolled && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <Text style={styles.progressPct}>{progressPct}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.progressSubtext}>
                {completedCount} of {course.totalLessons} lessons completed
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.sectionTitle}>About this Course</Text>
          <Text style={styles.description}>{course.description}</Text>

          {/* Chapters */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Course Content</Text>
          <Text style={styles.contentMeta}>
            {course.chapters.length} chapters · {course.totalLessons} lessons · {course.duration}
          </Text>

          {course.chapters.map((ch, idx) => (
            <ChapterSection
              key={ch.id}
              chapter={ch}
              chapterIndex={idx}
              completedIds={completedIds}
              onLessonPress={handleLessonPress}
              nextLessonId={nextLessonInfo?.lesson.id ?? null}
            />
          ))}

          {/* Instructor card */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Your Instructor</Text>
          <View style={styles.instructorCard}>
            <Avatar uri={course.instructor.avatar} size="lg" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.instructorCardName}>{course.instructor.name}</Text>
              <Text style={styles.instructorCardEmail}>{course.instructor.email}</Text>
              <Text style={styles.instructorCardLoc}>{course.instructor.location}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => toggleBookmark(courseId)}
          style={styles.bookmarkBtn}
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? COLORS.primary : COLORS.textSecondary}
          />
        </Pressable>

        {!isEnrolled ? (
          <Button title={`Enroll — $${course.price}`} onPress={() => enroll(courseId)} variant="primary" size="md" fullWidth />
        ) : nextLessonInfo ? (
          <Button title="Continue Learning" onPress={handleContinue} variant="primary" size="md" fullWidth />
        ) : (
          <Button title="✓ Course Completed" onPress={() => { }} variant="secondary" size="md" fullWidth />
        )}
      </View>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backButton: {
    position: 'absolute', top: 48, left: 16, zIndex: 10,
    backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 20,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: '100%', height: 240 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  title: { color: '#F1F5F9', fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 12 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  instructorName: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  instructorLocation: { color: '#64748B', fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#111827', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 8, marginBottom: 20,
    borderWidth: 1, borderColor: '#1E293B',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
  statLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#1E293B', marginVertical: 2 },
  progressSection: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#1E293B',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressPct: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  progressSubtext: { color: '#64748B', fontSize: 12, marginTop: 6 },
  sectionTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  description: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  contentMeta: { color: '#64748B', fontSize: 12, marginBottom: 12 },
  chapterContainer: {
    backgroundColor: '#111827', borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  chapterLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chapterTextWrap: { marginLeft: 10, flex: 1 },
  chapterTitle: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  chapterMeta: { color: '#64748B', fontSize: 11, marginTop: 2 },
  lessonList: { borderTopWidth: 1, borderTopColor: '#1E293B' },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1E293B',
  },
  lessonRowActive: { backgroundColor: 'rgba(99,102,241,0.08)' },
  lessonStatus: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#1E293B',
    alignItems: 'center', justifyContent: 'center',
  },
  lessonStatusDone: { backgroundColor: COLORS.success },
  lessonNumber: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  lessonInfo: { flex: 1, marginLeft: 10 },
  lessonTitle: { color: '#E2E8F0', fontSize: 13, fontWeight: '500' },
  lessonTitleDone: { color: '#64748B', textDecorationLine: 'line-through' },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  lessonDuration: { color: '#64748B', fontSize: 11 },
  instructorCard: {
    flexDirection: 'row', backgroundColor: '#111827', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 16,
  },
  instructorCardName: { color: '#F1F5F9', fontSize: 16, fontWeight: '700' },
  instructorCardEmail: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  instructorCardLoc: { color: '#64748B', fontSize: 12, marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0B0F1A', borderTopWidth: 1, borderTopColor: '#1E293B',
    paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 12,
  },
  bookmarkBtn: {
    backgroundColor: '#1E293B', borderRadius: 12, width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
});
