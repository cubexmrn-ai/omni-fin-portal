"use client";

// components/academy/CourseSidebar.jsx
//
// Sticky "course sidebar" for a lesson page (app/learn/[level]/[lesson]/
// page.jsx + components/academy/LessonViewer.jsx) — the standard
// learning-portal pattern: current level header, an in-level progress
// tracker, and a clickable vertical list of every lesson in that level
// so a visitor can jump straight to any of them without going back to
// the main Academy hub.
//
// WHY EVERY ROW IS CLICKABLE: hooks/useAcademyProgress.js locks and
// unlocks whole LEVELS, not individual lessons within a level — there's
// no "lesson 3 of level 2 is locked until lesson 2 is done" concept in
// this curriculum's data model. By the time this sidebar renders at
// all, LessonViewer.jsx has already confirmed the current level is
// unlocked (its own "locked" early-return happens before this
// component is reached), so every lesson listed here, being in that
// same already-unlocked level, is already a legitimate destination.
// The "locked modules" language in the product spec refers to entire
// LEVELS (shown on the Master Path roadmap and in the hub's Focused
// Track View), not a second lock layer within one open level.

import Link from "next/link";
import { getLevel, getLevelStats } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";

const LEVEL_THEME = {
  emerald: { bar: "bg-emerald-500", active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" },
  blue: { bar: "bg-blue-500", active: "border-blue-500/40 bg-blue-500/10 text-blue-200" },
  violet: { bar: "bg-violet-500", active: "border-violet-500/40 bg-violet-500/10 text-violet-200" },
  amber: { bar: "bg-amber-500", active: "border-amber-500/40 bg-amber-500/10 text-amber-200" },
  rose: { bar: "bg-rose-500", active: "border-rose-500/40 bg-rose-500/10 text-rose-200" },
};

export default function CourseSidebar({ levelId, currentLessonId }) {
  const progress = useAcademyProgress();
  const level = getLevel(levelId);
  if (!level) return null;

  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;
  const stats = getLevelStats(level);
  const percent = progress.hydrated ? progress.getLevelProgressPercent(levelId) : 0;
  const completedCount = Math.round((percent / 100) * stats.lessonCount);

  return (
    <aside className="hidden lg:block lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-28 lg:self-start rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl shadow-black/20">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
          Level {level.order}
        </p>
        <h2 className="mt-0.5 text-base font-extrabold text-gray-50">{level.title}</h2>
        <p className="mt-0.5 text-xs text-gray-400">{level.subtitle}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              {completedCount} / {stats.lessonCount} lessons
            </span>
            <span className="font-semibold text-gray-300">{percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div className={`h-full ${theme.bar} transition-all`} style={{ width: `${percent}%` }} />
          </div>
        </div>

        <nav aria-label={`${level.title} lessons`} className="mt-4 space-y-1">
          {level.lessons.map((lesson, i) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = progress.hydrated && progress.isLessonCompleted(levelId, lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/learn/${levelId}/${lesson.id}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? theme.active
                    : "border-transparent text-gray-400 hover:border-gray-800 hover:bg-black/20 hover:text-gray-200"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-white/15 text-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
