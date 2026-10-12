"use client";

// components/academy/AcademyHub.jsx
//
// The interactive body of the Academy hub (app/learn/page.jsx): the
// progress banner, the category/path switcher, and either the 5-level
// Master Path roadmap or a Focused Track View. Split out as its own
// "use client" component (same pattern as components/NewsFeed.jsx for
// app/ai-news/page.jsx) so app/learn/page.jsx itself can stay a plain
// server component with its own metadata export — progress lives in
// localStorage, which only exists client-side.
//
// DARK THEME: the Academy is permanently dark-themed (its own fixed
// palette — bg-ink/#0b0f19 page background, gray-900/#111827
// glassmorphic cards, gray-800/#1f2937 borders) regardless of the rest
// of the (light-themed) site, rather than a toggleable `dark:` variant —
// see the header comment in tailwind.config.js's "ink" color entry.
//
// ARCHITECTURE FIX — "Master Path" vs. Category Tracks:
// Previously, selecting a category filter (Forex/Metals/Crypto/etc.)
// reused the same flat lesson grid as a text search AND still applied
// the roadmap's level-unlock gating (locked lessons rendered
// pointer-events-none/grayed out) — so browsing "just the Forex
// lessons" was full of artificial dead ends for anything past Level 1.
// Now:
//   - "Master Path" (the former "All Topics" tab) is the ONLY place
//     level-locking is shown at all — it's the 5-level roadmap, where
//     sequential unlocking is the entire point.
//   - Every other view (a category tab, or a search) is a flat,
//     frictionless "Focused Track" list: every matching lesson is
//     always a real link, regardless of whether its level is unlocked
//     on the Master Path. A lesson's own page still shows its progress
//     (see LessonViewer.jsx) — browsing it out of sequence just means
//     the person made that choice deliberately, not that the site is
//     broken.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACADEMY_LEVELS, CATEGORIES, getLevelStats } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";

// Per-level accent used on the Master Path roadmap cards — a trim
// color/glow for visual hierarchy between the 5 levels, distinct from
// the lesson-detail page's fixed blue/emerald/rose semantic accents
// (CTA / pro-tip / risk) which stay the same regardless of level.
const LEVEL_THEME = {
  emerald: {
    border: "border-emerald-500/30",
    glow: "hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.35)]",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    bar: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-400",
  },
  blue: {
    border: "border-blue-500/30",
    glow: "hover:shadow-[0_0_24px_-6px_rgba(59,130,246,0.4)]",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    bar: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-500",
    chip: "bg-blue-500/10 text-blue-400",
  },
  violet: {
    border: "border-violet-500/30",
    glow: "hover:shadow-[0_0_24px_-6px_rgba(167,139,250,0.35)]",
    badge: "bg-violet-500/10 text-violet-400 border border-violet-500/30",
    bar: "bg-violet-500",
    button: "bg-violet-600 hover:bg-violet-500",
    chip: "bg-violet-500/10 text-violet-400",
  },
  amber: {
    border: "border-amber-500/30",
    glow: "hover:shadow-[0_0_24px_-6px_rgba(245,158,11,0.35)]",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    bar: "bg-amber-500",
    button: "bg-amber-600 hover:bg-amber-500",
    chip: "bg-amber-500/10 text-amber-400",
  },
  rose: {
    border: "border-rose-500/30",
    glow: "hover:shadow-[0_0_24px_-6px_rgba(244,63,94,0.35)]",
    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    bar: "bg-rose-500",
    button: "bg-rose-600 hover:bg-rose-500",
    chip: "bg-rose-500/10 text-rose-400",
  },
};

function LevelCard({ level, unlocked, mastered, progressPercent }) {
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;
  const stats = getLevelStats(level);
  const firstLesson = level.lessons[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gray-900/80 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] backdrop-blur transition-all ${
        unlocked ? `${theme.border} ${theme.glow}` : "border-gray-800 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Level {level.order}
          </p>
          <h3 className="mt-0.5 text-lg font-extrabold text-gray-50">{level.title}</h3>
          <p className="text-sm font-medium text-gray-400">{level.subtitle}</p>
        </div>
        {mastered ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
            ✓ Mastered
          </span>
        ) : !unlocked ? (
          <span
            className="shrink-0 rounded-full border border-gray-700 bg-gray-800/60 px-2.5 py-1 text-xs font-bold text-gray-500"
            title="Complete the previous level's quizzes to unlock this one"
          >
            🔒 Locked
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-gray-400">{level.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>{stats.lessonCount} lessons</span>
        <span>·</span>
        <span>{stats.quizCount} quizzes</span>
        <span>·</span>
        <span>~{stats.totalMinutes} min</span>
      </div>

      {unlocked && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div className={`h-full ${theme.bar}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-gray-500">{progressPercent}% complete</p>
        </div>
      )}

      <div className="mt-4">
        {unlocked ? (
          <Link
            href={`/learn/${level.id}/${firstLesson.id}`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${theme.button}`}
          >
            {progressPercent > 0 && progressPercent < 100 ? "Continue" : "Start"} Level {level.order} →
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-500">
            Complete Level {level.order - 1} first
          </span>
        )}
      </div>
    </div>
  );
}

function FocusedTrackCard({ level, lesson, completed }) {
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;
  return (
    <Link
      href={`/learn/${level.id}/${lesson.id}`}
      className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all hover:border-gray-700 hover:bg-gray-900"
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${theme.chip}`}>
          Level {level.order} · {level.title}
        </span>
        {completed && (
          <span className="text-emerald-400" aria-hidden="true">
            ✓
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-100">{lesson.title}</p>
      <p className="mt-1 text-xs text-gray-500">~{lesson.estMinutes} min</p>
    </Link>
  );
}

export default function AcademyHub() {
  const progress = useAcademyProgress();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const currentLevel = progress.currentLevel;
  const currentLevelPercent = currentLevel ? progress.getLevelProgressPercent(currentLevel.id) : 0;

  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = [];
    for (const level of ACADEMY_LEVELS) {
      for (const lesson of level.lessons) {
        const categories = lesson.categories || [];
        if (activeCategory !== "all" && !categories.includes(activeCategory)) continue;
        if (q) {
          const haystack = `${lesson.title} ${level.title} ${level.subtitle}`.toLowerCase();
          if (!haystack.includes(q)) continue;
        }
        results.push({ level, lesson });
      }
    }
    return results;
  }, [query, activeCategory]);

  // Showing a flat, frictionless list (no level-locking) whenever we're
  // NOT on the Master Path roadmap — a category track or a text search.
  const isFocusedView = query.trim().length > 0 || activeCategory !== "all";
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-ink text-gray-100">
      {/* Progress Banner */}
      <section className="border-b border-gray-800 bg-gradient-to-b from-blue-950/40 via-ink to-ink">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-400">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-400">Academy</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-50 sm:text-4xl">
            OmniFin Academy
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            A free, gamified path from the basics of money to professional risk management —
            5 levels, bite-sized lessons, and a checkpoint quiz at the end of every module.
          </p>

          {progress.hydrated && currentLevel && (
            <div className="mt-6 max-w-xl rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-[0_0_30px_-10px_rgba(59,130,246,0.25)]">
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold text-gray-100">
                  Level {currentLevel.order} {currentLevel.title} — {currentLevelPercent}% Completed
                </p>
                <p className="text-xs text-gray-500">
                  {progress.overallCompletedCount} / {progress.overallTotalLessons} lessons overall
                </p>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress.overallPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Path / Category Switcher & Search */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Master Path or category track">
            {[{ id: "all", label: "Master Path" }, ...CATEGORIES].map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-blue-600 text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)]"
                      : "border border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons…"
              aria-label="Search lessons"
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Either the Master Path roadmap, or a Focused Track View */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isFocusedView ? (
          <div>
            <p className="mb-3 text-xs text-gray-500">
              {activeCategoryMeta ? (
                <span className="font-semibold text-gray-300">
                  {activeCategoryMeta.label} Track
                </span>
              ) : (
                <span className="font-semibold text-gray-300">Search results</span>
              )}
              {" — "}
              {filteredLessons.length} lesson{filteredLessons.length === 1 ? "" : "s"}
              {query.trim() ? ` matching "${query.trim()}"` : ""}, from every level — no
              need to clear earlier levels first.
            </p>
            {filteredLessons.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No lessons match your filters — try a different topic or search term.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map(({ level, lesson }) => (
                  <FocusedTrackCard
                    key={`${level.id}/${lesson.id}`}
                    level={level}
                    lesson={lesson}
                    completed={progress.hydrated && progress.isLessonCompleted(level.id, lesson.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-xs text-gray-500">
              <span className="font-semibold text-gray-300">Master Path</span> — the full
              5-level curriculum, in order. Each level unlocks once every lesson in the
              previous one is mastered.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ACADEMY_LEVELS.map((level) => {
                const unlocked = progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1;
                const mastered = progress.hydrated ? progress.isLevelMastered(level.id) : false;
                const percent = progress.hydrated ? progress.getLevelProgressPercent(level.id) : 0;
                return (
                  <LevelCard
                    key={level.id}
                    level={level}
                    unlocked={unlocked}
                    mastered={mastered}
                    progressPercent={percent}
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
