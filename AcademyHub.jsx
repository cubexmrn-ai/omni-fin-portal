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
// THEME: the page body itself is the site's normal light theme (same
// slate/white as every other page) for proper contrast — ONLY the
// module cards, lesson widgets, and interactive controls (level cards,
// lesson cards, the category pills, the search box) use the dark,
// glassmorphic styling (gray-900/#111827 cards, gray-800/#1f2937
// borders, ink/#0b0f19 for the deepest widget chrome), so they pop
// against the light page around them instead of blending into a
// uniformly dark page.
//
// ARCHITECTURE — "Master Path" vs. Category Tracks:
//   - "Master Path" (the first tab) is the 5-level roadmap, where
//     sequential level-locking is the entire point.
//   - A category tab (Forex/Metals/Crypto/etc.) or a text search shows
//     a flat "Focused Track" list of matching lessons, gated by the
//     SAME level-unlock rule as the Master Path (a lesson is only
//     clickable once its level is unlocked) — advanced, level-specific
//     modules stay locked behind normal progression either way.
//   - The one exception: selecting a category tab (with no search
//     query) always shows one extra, always-unlocked "Overview / Basic
//     Introduction" card for that topic first — informational only, not
//     a real lesson — with a banner pointing at Level 1 for the real
//     deep-dive modules. See CATEGORY_OVERVIEWS in lib/academyData.js
//     for why this is a standalone blurb rather than a link to an
//     actual lesson.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACADEMY_LEVELS, CATEGORIES, CATEGORY_OVERVIEWS, getLevelStats } from "@/lib/academyData";
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
      className={`relative overflow-hidden rounded-2xl border bg-gray-900 p-5 shadow-xl shadow-black/20 backdrop-blur transition-all ${
        unlocked ? `${theme.border} ${theme.glow}` : "border-gray-800 opacity-75"
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

/** The always-unlocked, informational "Overview / Basic Introduction"
 * card shown first in a category's Focused Track View. Not a link to a
 * real lesson — see CATEGORY_OVERVIEWS' header comment in
 * lib/academyData.js for why. */
function CategoryOverviewCard({ category, blurb }) {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-gray-900 p-4 shadow-xl shadow-black/20 sm:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-400">
          Overview · Basic Introduction
        </span>
        <span className="text-[11px] font-semibold text-gray-500">Always unlocked</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-100">{category.label} — what it is</p>
      <p className="mt-1.5 text-sm text-gray-400">{blurb}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <span className="text-amber-400" aria-hidden="true">
          ⚠️
        </span>
        <p className="text-xs text-amber-200/90">
          This is a basic overview. To unlock full deep-dive modules for this topic, complete
          the core levels starting from Level 1.
        </p>
      </div>
      <Link
        href={`/learn/${ACADEMY_LEVELS[0].id}/${ACADEMY_LEVELS[0].lessons[0].id}`}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)] hover:bg-blue-500"
      >
        Start Level 1 →
      </Link>
    </div>
  );
}

function FocusedTrackCard({ level, lesson, unlocked, completed }) {
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;

  if (!unlocked) {
    return (
      <div
        className="cursor-not-allowed rounded-xl border border-gray-800 bg-gray-900/60 p-4 opacity-60"
        title={`Complete Level ${level.order - 1} first to unlock this lesson`}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-gray-700 bg-gray-800/60 px-2 py-0.5 text-[11px] font-bold text-gray-500">
            Level {level.order} · {level.title}
          </span>
          <span className="text-gray-500" aria-hidden="true">
            🔒
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-400">{lesson.title}</p>
        <p className="mt-1 text-xs text-gray-600">~{lesson.estMinutes} min</p>
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${level.id}/${lesson.id}`}
      className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-xl shadow-black/20 transition-all hover:border-gray-700"
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

  const isFocusedView = query.trim().length > 0 || activeCategory !== "all";
  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory);
  // The Overview card only makes sense for a specific topic the person
  // is browsing, not a free-text search — so it's shown only when a
  // category tab is active and there's no search query layered on top.
  const showCategoryOverview = Boolean(activeCategoryMeta) && query.trim().length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress Banner */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Academy</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            OmniFin Academy
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A free, gamified path from the basics of money to professional risk management —
            5 levels, bite-sized lessons, and a checkpoint quiz at the end of every module.
          </p>

          {progress.hydrated && currentLevel && (
            <div className="mt-6 max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-xl shadow-black/20">
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
            <p className="mb-3 text-xs text-slate-500">
              {activeCategoryMeta ? (
                <span className="font-semibold text-slate-700">{activeCategoryMeta.label} Track</span>
              ) : (
                <span className="font-semibold text-slate-700">Search results</span>
              )}
              {" — "}
              {filteredLessons.length} lesson{filteredLessons.length === 1 ? "" : "s"}
              {query.trim() ? ` matching "${query.trim()}"` : ""}, across every level. Locked
              lessons still require completing earlier levels on the Master Path.
            </p>
            {filteredLessons.length === 0 && !showCategoryOverview ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No lessons match your filters — try a different topic or search term.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {showCategoryOverview && (
                  <CategoryOverviewCard
                    category={activeCategoryMeta}
                    blurb={CATEGORY_OVERVIEWS[activeCategoryMeta.id]}
                  />
                )}
                {filteredLessons.map(({ level, lesson }) => {
                  const unlocked = progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1;
                  const completed = progress.hydrated && progress.isLessonCompleted(level.id, lesson.id);
                  return (
                    <FocusedTrackCard
                      key={`${level.id}/${lesson.id}`}
                      level={level}
                      lesson={lesson}
                      unlocked={unlocked}
                      completed={completed}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Master Path</span> — the full
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
