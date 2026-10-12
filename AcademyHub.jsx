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
// THEME: the page body/container itself stays the site's normal clean
// light theme (bg-slate-50 / bg-slate-100 — #f8fafc / #f1f5f9) for
// proper contrast — ONLY the module cards, lesson widgets, and
// interactive controls (level cards, lesson cards, the category pills,
// the search box) use the dark, glassmorphic styling (solid
// bg-slate-900/bg-slate-800 cards with colored borders), so they pop
// against the light page around them instead of blending into a
// uniformly dark page.
//
// ARCHITECTURE — "Master Path" vs. Category Tracks:
//   - "Master Path" (the first tab) is the 5-level roadmap, where
//     sequential level-locking is the entire point.
//   - A category tab (Forex/Metals/Crypto/etc.) or a text search shows
//     a flat "Focused Track" list of matching lessons, gated by the
//     SAME level-unlock rule as the Master Path.
//   - EVERY card is clickable regardless of lock status: an unlocked
//     card is a normal link straight to the real lesson; a still-locked
//     card is a button that opens the LockedModuleModal below instead —
//     a quick "Basic Concept & Introduction" for that topic (reusing
//     CATEGORY_OVERVIEWS from lib/academyData.js) plus a CTA pointing
//     at Level 1 for the real deep-dive lesson, diagrams, and quiz.
//     Nothing in a category track is ever a dead end or a non-clickable
//     grayed-out card.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACADEMY_LEVELS, CATEGORIES, CATEGORY_OVERVIEWS, getLevelStats } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import Modal from "@/components/community/Modal";

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
      className={`relative overflow-hidden rounded-2xl border bg-slate-900 p-5 shadow-xl shadow-black/20 backdrop-blur transition-all ${
        unlocked ? `${theme.border} ${theme.glow}` : "border-slate-800 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Level {level.order}
          </p>
          <h3 className="mt-0.5 text-lg font-extrabold text-slate-50">{level.title}</h3>
          <p className="text-sm font-medium text-slate-400">{level.subtitle}</p>
        </div>
        {mastered ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
            ✓ Mastered
          </span>
        ) : !unlocked ? (
          <span
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-bold text-slate-500"
            title="Complete the previous level's quizzes to unlock this one"
          >
            🔒 Locked
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-slate-400">{level.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{stats.lessonCount} lessons</span>
        <span>·</span>
        <span>{stats.quizCount} quizzes</span>
        <span>·</span>
        <span>~{stats.totalMinutes} min</span>
      </div>

      {unlocked && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full ${theme.bar}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500">{progressPercent}% complete</p>
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
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-500">
            Complete Level {level.order - 1} first
          </span>
        )}
      </div>
    </div>
  );
}

function FocusedTrackCard({ level, lesson, category, unlocked, completed, onLockedClick }) {
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;

  if (!unlocked) {
    // Every card is clickable regardless of lock status — a locked
    // card opens the LockedModuleModal (a quick topic intro + CTA)
    // instead of either being a dead, non-clickable div or navigating
    // straight into a lesson the visitor hasn't unlocked yet.
    return (
      <button
        type="button"
        onClick={() => onLockedClick({ level, lesson, category })}
        className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left shadow-xl shadow-black/20 transition-all hover:border-slate-700 hover:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-bold text-slate-400">
            Level {level.order} · {level.title}
          </span>
          <span className="text-slate-400" aria-hidden="true">
            🔒
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-200">{lesson.title}</p>
        <p className="mt-1 text-xs text-slate-500">~{lesson.estMinutes} min · tap for a basic intro</p>
      </button>
    );
  }

  return (
    <Link
      href={`/learn/${level.id}/${lesson.id}`}
      className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/20 transition-all hover:border-slate-700"
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
      <p className="mt-2 text-sm font-semibold text-slate-100">{lesson.title}</p>
      <p className="mt-1 text-xs text-slate-500">~{lesson.estMinutes} min</p>
    </Link>
  );
}

/** Opened by a locked FocusedTrackCard. Light-themed (matches every
 * other overlay modal in this app — components/community/Modal.jsx is
 * the shared shell) so it reads as a normal detail popover rather than
 * another dark widget: a short "Basic Concept & Introduction" for the
 * topic (CATEGORY_OVERVIEWS), plus the exact unlock CTA, plus a
 * shortcut straight to Level 1. */
function LockedModuleModal({ info, onClose }) {
  const open = Boolean(info);
  const level = info?.level;
  const lesson = info?.lesson;
  const category = info?.category;
  const firstLevel = ACADEMY_LEVELS[0];

  return (
    <Modal open={open} onClose={onClose} title={lesson?.title} widthClassName="max-w-md">
      {info && (
        <div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            {category?.label || "Academy"} · Level {level.order} · {level.title}
          </span>

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Basic Concept &amp; Introduction
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {category ? CATEGORY_OVERVIEWS[category.id] : null} This specific module, &quot;
            {lesson.title}&quot;, pairs that foundation with a full interactive lesson —
            diagrams, Pro-Tip and Risk-Warning callouts, and a Checkpoint Quiz — once it&apos;s
            unlocked.
          </p>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-xs font-medium leading-relaxed text-amber-800">
              🔒 Full Deep-Dive Module Locked. Complete the foundational levels starting from
              Level 1: Rookie to unlock the complete interactive lesson &amp; quiz.
            </p>
          </div>

          <Link
            href={`/learn/${firstLevel.id}/${firstLevel.lessons[0].id}`}
            onClick={onClose}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
          >
            Start Level 1: Rookie →
          </Link>
        </div>
      )}
    </Modal>
  );
}

export default function AcademyHub() {
  const progress = useAcademyProgress();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [lockedInfo, setLockedInfo] = useState(null);

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
            <div className="mt-6 max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold text-slate-100">
                  Level {currentLevel.order} {currentLevel.title} — {currentLevelPercent}% Completed
                </p>
                <p className="text-xs text-slate-500">
                  {progress.overallCompletedCount} / {progress.overallTotalLessons} lessons overall
                </p>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
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
      <section className="border-b border-slate-100 bg-slate-100/60">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
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
                        : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
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
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
              {query.trim() ? ` matching "${query.trim()}"` : ""}, across every level. Every
              card is clickable — locked lessons open a quick intro and point you at Level 1.
            </p>
            {filteredLessons.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No lessons match your filters — try a different topic or search term.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map(({ level, lesson }) => {
                  const unlocked = progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1;
                  const completed = progress.hydrated && progress.isLessonCompleted(level.id, lesson.id);
                  const cardCategory =
                    activeCategoryMeta ||
                    CATEGORIES.find((c) => (lesson.categories || []).includes(c.id)) ||
                    null;
                  return (
                    <FocusedTrackCard
                      key={`${level.id}/${lesson.id}`}
                      level={level}
                      lesson={lesson}
                      category={cardCategory}
                      unlocked={unlocked}
                      completed={completed}
                      onLockedClick={setLockedInfo}
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

      <LockedModuleModal info={lockedInfo} onClose={() => setLockedInfo(null)} />
    </div>
  );
}
