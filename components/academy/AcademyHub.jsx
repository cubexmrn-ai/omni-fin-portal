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
// THEME — light page, dark component islands: the Academy's own page
// background is a clean light surface (bg-slate-50), matching the rest
// of the site. ONLY the individual cards — the Master Path's level
// cards, a category track's lesson cards, and the progress-summary box
// — keep the sleek dark bg-slate-900/text-white treatment, for sharp
// contrast against the light page around them. There is no full-page
// dark wrapper anymore.
//
// LEVEL LOCKING — same standard everywhere: Level 1 is unlocked by
// default; Levels 2-5 stay LOCKED (with a visible "Locked 🔒" badge)
// until every lesson in the previous level is mastered. This applies
// identically on the Master Path roadmap AND on every category track
// (Forex, Metals, Crypto, Technicals, Personal Finance) — a locked
// lesson's card is inert (no link, cursor-not-allowed) everywhere it
// appears, so clicking it never opens the lesson.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACADEMY_LEVELS, CATEGORIES, getLevelStats } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLocalizedLevel, getLocalizedLesson } from "@/lib/i18n/academyLocalized";

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
  const { t, language } = useLanguage();
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;
  const stats = getLevelStats(level);
  const firstLesson = level.lessons[0];
  // Every non-English language gets its own curated subtitle/
  // description (with core terms kept in English brackets) rather than
  // the generic t() dictionary — see lib/i18n/academyLocalized.js for
  // why only the level/lesson METADATA is translated, not the lesson
  // body itself.
  const display = language === "en" ? level : getLocalizedLevel(language, level.id, level);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all ${
        unlocked ? `${theme.border} ${theme.glow}` : "border-slate-800 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("levelWord")} {level.order}
          </p>
          <h3 className="mt-0.5 text-lg font-extrabold text-white">{display.title}</h3>
          <p className="text-sm font-medium text-slate-400">{display.subtitle}</p>
        </div>
        {mastered ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
            ✓ {t("masteredWord")}
          </span>
        ) : !unlocked ? (
          <span
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-bold text-slate-400"
            title="Complete the previous level's quizzes to unlock this one"
          >
            {t("locked")}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-slate-400">{display.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{stats.lessonCount} {t("lessonsWord")}</span>
        <span>·</span>
        <span>{stats.quizCount} {t("quizzesWord")}</span>
        <span>·</span>
        <span>~{stats.totalMinutes} {t("minWord")}</span>
      </div>

      {unlocked && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full ${theme.bar}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500">{progressPercent}% {t("completedWord").toLowerCase()}</p>
        </div>
      )}

      <div className="mt-4">
        {/* Oct 2026 pSEO/GEO/LLMO audit: a locked level used to render
            this as an inert <span> with no href at all — a crawler (and
            a visitor who hasn't finished the previous level's quizzes)
            had literally no clickable path to 16 of this Academy's 20
            lessons from this hub, even though every lesson URL is
            statically pre-rendered and sitemapped. The gamified lock
            stays (see the "Locked 🔒" badge above and `completeLevelFirst`
            copy below it), but it's now purely a cosmetic/retention
            signal — the link itself is always real, so anyone or
            anything can jump straight to any level on demand. */}
        <Link
          href={`/learn/${level.id}/${firstLesson.id}`}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
            unlocked ? theme.button : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          {unlocked
            ? `${progressPercent > 0 && progressPercent < 100 ? t("continueWord") : t("startWord")} ${t("levelWord")} ${level.order} →`
            : `${t("startWord")} ${t("levelWord")} ${level.order} →`}
        </Link>
        {!unlocked && (
          <p className="mt-1.5 text-[11px] text-slate-500">{t("completeLevelFirst", { n: level.order - 1 })}</p>
        )}
      </div>
    </div>
  );
}

/** A lesson card inside a category track (Forex / Metals / Crypto /
 * Technicals / Personal Finance). The "Locked 🔒" badge is a cosmetic/
 * gamification signal only (Oct 2026 pSEO/GEO/LLMO audit) — this used
 * to render a non-clickable <div> with no href at all for a locked
 * lesson, which meant browsing a category gave a crawler or a visitor
 * no path to it whatsoever. Every card is a real <Link> now,
 * regardless of lock state; what's actually gated is still just the
 * Checkpoint Quiz on the lesson page itself (see LessonViewer.jsx). */
function FocusedTrackCard({ level, lesson, completed, unlocked }) {
  const { t, language } = useLanguage();
  const theme = LEVEL_THEME[level.theme] || LEVEL_THEME.blue;
  const isLocalized = language !== "en";
  const levelTitle = isLocalized ? getLocalizedLevel(language, level.id, level).title : level.title;
  const lessonTitle = isLocalized ? getLocalizedLesson(language, lesson.id, lesson).title : lesson.title;

  return (
    <Link
      href={`/learn/${level.id}/${lesson.id}`}
      className={`rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all ${
        unlocked ? "hover:border-slate-700 hover:bg-slate-800" : "opacity-80 hover:border-slate-700 hover:bg-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${theme.chip}`}>
          {t("levelWord")} {level.order} · {levelTitle}
        </span>
        {completed ? (
          <span className="text-emerald-400" aria-hidden="true">
            ✓
          </span>
        ) : !unlocked ? (
          <span
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-bold text-slate-400"
            title="Complete the previous level's quizzes to unlock this lesson's checkpoint quiz"
          >
            {t("locked")}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{lessonTitle}</p>
      <p className="mt-1 text-xs text-slate-500">~{lesson.estMinutes} {t("minWord")}</p>
    </Link>
  );
}

export default function AcademyHub() {
  const { t, language } = useLanguage();
  const progress = useAcademyProgress();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const currentLevel = progress.currentLevel;
  const currentLevelPercent = currentLevel ? progress.getLevelProgressPercent(currentLevel.id) : 0;
  const currentLevelTitle =
    currentLevel && language !== "en"
      ? getLocalizedLevel(language, currentLevel.id, currentLevel).title
      : currentLevel?.title;

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header — light surface, matching the rest of the site */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              {t("dashboard")}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{t("academy")}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("academyHubTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t("academyHubDesc")}
          </p>

          {/* Progress summary — one of the Academy's dark "info containers" */}
          {progress.hydrated && currentLevel && (
            <div className="mt-6 max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between text-sm">
                <p className="font-bold text-white">
                  {t("levelWord")} {currentLevel.order} {currentLevelTitle} — {currentLevelPercent}% {t("completedWord")}
                </p>
                <p className="text-xs text-slate-400">
                  {progress.overallCompletedCount} / {progress.overallTotalLessons} {t("overallLessonsWord")}
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

      {/* Path / Category Switcher & Search — light controls on the light page */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Master Path or category track">
            {/* Not a category filter like the pills below it — this is a
                real navigation link out to app/learn/lab/page.jsx's
                standalone Interactive Demo Trading Lab, so it's styled
                distinctly (amber, with an icon) to signal that. */}
            <Link
              href="/learn/lab"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-sm font-bold text-amber-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-100"
            >
              <span aria-hidden="true">📈</span> Trading Lab (Demo Sim)
            </Link>
            {[{ id: "all", label: t("masterPathLabel") }, ...CATEGORIES].map((cat) => {
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
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
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
              placeholder={t("searchLessonsPlaceholder")}
              aria-label={t("searchLessonsPlaceholder")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Either the Master Path roadmap, or a Focused Track View — both
          apply the exact same Level 1 unlocked / Level 2-5 locked
          standard, via each card's own `unlocked` prop. */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isFocusedView ? (
          <div>
            <p className="mb-3 text-xs text-slate-500">
              {activeCategoryMeta ? (
                <span className="font-semibold text-slate-700">
                  {activeCategoryMeta.label} {t("trackWord")}
                </span>
              ) : (
                <span className="font-semibold text-slate-700">{t("searchResultsLabel")}</span>
              )}
              {" — "}
              {filteredLessons.length} {t("lessonsWord")}
              {query.trim() ? ` matching "${query.trim()}"` : ""}. {t("lockedLevelsNote")}
            </p>
            {filteredLessons.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                {t("noLessonsMatch")}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLessons.map(({ level, lesson }) => (
                  <FocusedTrackCard
                    key={`${level.id}/${lesson.id}`}
                    level={level}
                    lesson={lesson}
                    completed={progress.hydrated && progress.isLessonCompleted(level.id, lesson.id)}
                    unlocked={progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-xs text-slate-500">
              {t("masterPathDesc")}
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
