import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { CourseWebView } from '@/components/webview/CourseWebView';
import {
  useProgressStore,
  selectIsLessonComplete,
  selectCompletedCount,
} from '@/stores/progress.store';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { COLORS } from '@/theme/colors';
import type { CourseWebViewParams } from '@/types/navigation.types';

function buildLessonHtml(params: CourseWebViewParams, isComplete: boolean): string {
  const s = (v: string) => v.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>${s(params.lessonTitle)}</title>
<style>
  :root { --primary: #6366F1; --bg: #0B0F1A; --text: #F1F5F9; --muted: #94A3B8; --border: #1E293B; --surface: #111827; --success: #22C55E; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); padding: 20px; line-height: 1.7; }
  .chip { display: inline-block; background: rgba(99,102,241,0.15); color: var(--primary); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .chapter { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .video-placeholder { width: 100%; aspect-ratio: 16/9; background: var(--surface); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid var(--border); }
  .play-btn { width: 56px; height: 56px; background: var(--primary); border-radius: 28px; display: flex; align-items: center; justify-content: center; }
  .play-btn::after { content: ''; display: block; width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 20px solid #fff; margin-left: 4px; }
  .section { background: var(--surface); border-radius: 14px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--border); }
  .section h2 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  .desc { font-size: 14px; color: var(--muted); line-height: 1.8; }
  .note { background: rgba(99,102,241,0.08); border-left: 3px solid var(--primary); padding: 12px 14px; border-radius: 0 10px 10px 0; margin-bottom: 16px; }
  .note p { font-size: 13px; color: var(--muted); }
  .btn { width: 100%; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 700; cursor: pointer; text-align: center; }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-done { background: var(--success); color: #fff; }
  .btn:disabled { opacity: 0.5; }
</style>
</head>
<body>
<span class="chip">${s(params.category)}</span>
<h1>${s(params.lessonTitle)}</h1>
<p class="chapter">📂 ${s(params.chapterTitle)} · ${s(params.instructorName)}</p>

<div class="video-placeholder">
  <div class="play-btn"></div>
</div>

<div class="section">
  <h2>Lesson Content</h2>
  <p class="desc">${s(params.description)}</p>
</div>

<div class="note">
  <p>💡 <strong>Key Takeaway:</strong> Practice the concepts covered in this lesson before moving on to the next one.</p>
</div>

<div class="section">
  <h2>About this Course</h2>
  <p class="desc">Course: ${s(params.title)} · ⭐ ${s(params.rating)} · $${s(params.price)}</p>
</div>

<button class="btn ${isComplete ? 'btn-done' : 'btn-primary'}" id="completeBtn"
  onclick="markComplete()" ${isComplete ? 'disabled' : ''}>
  ${isComplete ? '✅ Lesson Completed' : '✓ Mark as Complete'}
</button>

<script>
  var done = ${isComplete ? 'true' : 'false'};
  function notify(t, p) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: t, payload: p })); } catch(e) {}
  }
  function markComplete() {
    if (done) return;
    done = true;
    var btn = document.getElementById('completeBtn');
    btn.textContent = '✅ Lesson Completed';
    btn.disabled = true;
    btn.className = 'btn btn-done';
    notify('LESSON_COMPLETE', { lessonId: '${s(params.lessonId)}' });
  }
</script>
</body>
</html>`;
}

export default function CourseWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as CourseWebViewParams;
  const courseId = Number(params.courseId);

  const { courses } = useCourses();
  const course = courses.find((c) => c.id === courseId);

  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);

  // Stable primitive selectors
  const isComplete = useProgressStore((s) => selectIsLessonComplete(s, courseId, params.lessonId));
  const completedCount = useProgressStore((s) => selectCompletedCount(s, courseId));
  const totalLessons = course?.totalLessons ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Find prev/next lessons
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course) return { prevLesson: null, nextLesson: null };
    const allLessons = course.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title })),
    );
    const idx = allLessons.findIndex((l) => l.id === params.lessonId);
    return {
      prevLesson: idx > 0 ? allLessons[idx - 1] : null,
      nextLesson: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
    };
  }, [course, params.lessonId]);

  const handleMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'LESSON_COMPLETE' && msg.payload?.lessonId) {
        markLessonComplete(courseId, msg.payload.lessonId);
      }
    } catch { /* ignore */ }
  }, [markLessonComplete, courseId]);

  const navigateToLesson = useCallback((lesson: { id: string; title: string; chapterTitle: string }) => {
    router.replace({
      pathname: '/course/webview',
      params: {
        ...params,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        chapterTitle: lesson.chapterTitle,
      } as any,
    });
  }, [params, router]);

  const html = useMemo(
    () => buildLessonHtml(params, isComplete),
    [params, isComplete],
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={hdr.container}>
        <Pressable onPress={() => router.back()} style={hdr.closeBtn} accessibilityLabel="Close">
          <Ionicons name="arrow-back" size={20} color="#E2E8F0" />
        </Pressable>
        <View style={hdr.titleWrap}>
          <Text style={hdr.title} numberOfLines={1}>{params.lessonTitle}</Text>
          <Text style={hdr.subtitle}>{params.chapterTitle} · {progressPct}% complete</Text>
        </View>
        {isComplete && <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />}
      </View>

      {/* Progress bar */}
      <View style={hdr.progressTrack}>
        <View style={[hdr.progressFill, { width: `${progressPct}%` }]} />
      </View>

      {/* WebView */}
      <CourseWebView htmlContent={html} onRawMessage={handleMessage} />

      {/* Footer nav */}
      <View style={ftr.container}>
        <Pressable
          onPress={prevLesson ? () => navigateToLesson(prevLesson) : undefined}
          style={[ftr.navBtn, !prevLesson && ftr.navBtnDisabled]}
          disabled={!prevLesson}
        >
          <Ionicons name="chevron-back" size={18} color={prevLesson ? '#E2E8F0' : '#334155'} />
          <Text style={[ftr.navText, !prevLesson && ftr.navTextDisabled]}>Prev</Text>
        </Pressable>

        <Text style={ftr.lessonCounter}>{completedCount}/{totalLessons}</Text>

        <Pressable
          onPress={nextLesson ? () => navigateToLesson(nextLesson) : undefined}
          style={[ftr.navBtn, !nextLesson && ftr.navBtnDisabled]}
          disabled={!nextLesson}
        >
          <Text style={[ftr.navText, !nextLesson && ftr.navTextDisabled]}>Next</Text>
          <Ionicons name="chevron-forward" size={18} color={nextLesson ? '#E2E8F0' : '#334155'} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const hdr = {
  container: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  closeBtn: { width: 36, height: 36, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 8 },
  titleWrap: { flex: 1 },
  title: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' as const },
  subtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },
  progressTrack: { height: 3, backgroundColor: '#1E293B' },
  progressFill: { height: 3, backgroundColor: COLORS.primary },
};

const ftr = {
  container: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1E293B', backgroundColor: '#0B0F1A' },
  navBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#1E293B' },
  navBtnDisabled: { opacity: 0.4 },
  navText: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' as const },
  navTextDisabled: { color: '#334155' },
  lessonCounter: { color: '#64748B', fontSize: 13, fontWeight: '600' as const },
};
