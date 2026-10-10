"use client";

// components/academy/AcademyHub.jsx
//
// The interactive body of the Academy hub (app/learn/page.jsx): the
// progress banner, the 5-level roadmap grid, and the search/category
// filter. Split out as its own "use client" component (same pattern as
// components/NewsFeed.jsx for app/ai-news/page.jsx) so app/learn/page.jsx
// itself can stay a plain server component with its own metadata export —
// progress lives in localStorage, which only exists client-side.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACADEMY_LEVELS, CATEGORIES, getLevelStats } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";

const THEME_STYLES = {
  emerald: { ring: "border-emerald-200", badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700" },
  blue: { ring: "border-blue-200", badge: "bg-blue-50 text-blue-700", bar: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
  violet: { ring: "border-violet-200", badge: "bg-violet-50 text-violet-700", bar: "bg-violet-500", chip: "bg-violet-100 text-violet-700" },
  amber: { ring: "border-amber-200", badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700" },
  rose: { ring: "border-rose-200", badge: "bg-rose-50 text-rose-700", bar: "bg-rose-500", chip: "bg-rose-100 text-rose-700" },
};

function LevelCard({ level, unlocked, mastered, progressPercent }) {
  const theme = THEME_STYLES[level.theme] || THEME_STYLES.blue;
  const stats = getLevelStats(level);
  const firstLesson = level.lessons[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-card transition-shadow ${
        unlocked ? theme.ring : "border-slate-200"
      } ${unlocked ? "hover:shadow-card-hover" : "opacity-75"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Level {level.order}
          </p>
          <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">{level.title}</h3>
          <p className="text-sm font-medium text-slate-500">{level.subtitle}</p>
        </div>
        {mastered ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
            ✓ Mastered
          </span>
        ) : !unlocked ? (
          <span
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-400"
            title="Complete the previous level's quizzes to unlock this one"
          >
            🔒 Locked
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-slate-600">{level.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>{stats.lessonCount} lessons</span>
        <span>·</span>
        <span>{stats.quizCount} quizzes</span>
        <span>·</span>
        <span>~{stats.totalMinutes} min</span>
      </div>

      {unlocked && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${theme.bar}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-400">{progressPercent}% complete</p>
        </div>
      )}

      <div className="mt-4">
        {unlocked ? (
          <Link
            href={`/learn/${level.id}/${firstLesson.id}`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${theme.bar} hover:opacity-90`}
          >
            {progressPercent > 0 && progressPercent < 100 ? "Continue" : "Start"} Level {level.order} →
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
            Complete Level {level.order - 1} first
          </span>
        )}
      </div>
    </div>
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

  const isSearching = query.trim().length > 0 || activeCategory !== "all";

  return (
    <div>
      {/* Progress Banner */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">Dashboard</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Academy</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            OmniFin Academy
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A free, gamified path from the basics of money to professional risk management —
            5 levels, bite-sized lessons, and a quiz at the end of every module.
          </p>

          {progress.hydrated && currentLevel && (
            <div className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold text-slate-900">
                  Level {currentLevel.order} {currentLevel.title} — {currentLevelPercent}% Completed
                </p>
                <p className="text-xs text-slate-400">
                  {progress.overallCompletedCount} / {progress.overallTotalLessons} lessons overall
                </p>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-brand-600 transition-all"
                  style={{ width: `${progress.overallPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {[{ id: "all", label: "All Topics" }, ...CATEGORIES].map((cat) => {
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
                      ? "bg-brand-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </section>

      {/* Either the search results, or the level roadmap */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isSearching ? (
          <div>
            <p className="mb-3 text-xs text-slate-400">
              {filteredLessons.length} lesson{filteredLessons.length === 1 ? "" : "s"} match
              {activeCategory !== "all" ? ` the "${CATEGORIES.find((c) => c.id === activeCategory)?.label}" filter` : ""}
              {query.trim() ? ` and "${query.trim()}"` : ""}.
            </p>
            {filteredLessons.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No lessons match your filters — try a different topic or search term.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map(({ level, lesson }) => {
                  const unlocked = progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1;
                  const completed = progress.isLessonCompleted(level.id, lesson.id);
                  const theme = THEME_STYLES[level.theme] || THEME_STYLES.blue;
                  return (
                    <Link
                      key={`${level.id}/${lesson.id}`}
                      href={unlocked ? `/learn/${level.id}/${lesson.id}` : "#"}
                      aria-disabled={!unlocked}
                      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow ${
                        unlocked ? "hover:shadow-card-hover" : "pointer-events-none opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${theme.chip}`}>
                          Level {level.order} · {level.title}
                        </span>
                        {completed && <span className="text-emerald-600" aria-hidden="true">✓</span>}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-800">{lesson.title}</p>
                      <p className="mt-1 text-xs text-slate-400">~{lesson.estMinutes} min</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
