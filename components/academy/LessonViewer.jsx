"use client";

// components/academy/LessonViewer.jsx
//
// The interactive body of a lesson page (app/learn/[level]/[lesson]/page.jsx):
// a sticky reading-progress top bar, a two-column reader (a sticky left
// outline sidebar + the main lesson content on the right), the lesson's
// typed content sections (text / proTip / risk / formula / visual /
// tool / relatedLink), a sticky prev/next + "Jump to Quiz" bottom nav
// bar, and the
// end-of-lesson Checkpoint Quiz (components/academy/QuizModule.jsx)
// wired to hooks/useAcademyProgress so a passing score marks the lesson
// Mastered and unlocks the next level.
//
// THEME — light page, dark component islands (matching the Academy hub
// in components/academy/AcademyHub.jsx): the page itself is a clean
// light surface (bg-slate-50); the plain lesson prose (TextSection)
// reads directly on that light page in dark text. The callout cards
// (Pro Tip / Risk Warning / Key Formula), the left outline sidebar, and
// the sticky bottom nav bar are the "sleek dark" component islands —
// bg-slate-900 with a fixed 3-color semantic accent:
//   - Electric Blue (blue-500/#3b82f6)  -> primary CTAs, formula/key-rule cards
//   - Emerald (emerald-500/#10b981)      -> pro-tips, "mastered"/success states
//   - Soft Rose (rose-500/#f43f5e)       -> risk warnings, incorrect-answer states
// LessonVisualCard/EmbeddedTool/QuizModule are already self-contained
// dark cards, so they're untouched here and simply float correctly on
// the new light page.
//
// TWO-COLUMN READER LAYOUT: below the sticky top bar, the page is a
// `grid-cols-1 lg:grid-cols-4` layout —
//   - Left sidebar (`lg:col-span-1`, `lg:sticky`): the current level's
//     header + progress bar, then a vertical outline of every lesson
//     from the current level through every level still ahead. The
//     active lesson is highlighted; lessons in an unlocked level are
//     real links (quick switching); lessons in a level that's still
//     locked show a 🔒 indicator instead, so the roadmap ahead is
//     visible but not clickable.
//   - Right main panel (`lg:col-span-3`): the lesson content, callouts,
//     and the Checkpoint Quiz.
//
// Split out as "use client" (same pattern as components/academy/AcademyHub.jsx)
// so the page.jsx route itself can stay a server component with its own
// generateStaticParams/metadata — progress lives in localStorage, which
// only exists client-side.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACADEMY_LEVELS, getLesson, getAdjacentLessons } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import LessonVisualCard from "@/components/academy/LessonVisualCard";
import EmbeddedTool from "@/components/academy/EmbeddedTool";
import QuizModule from "@/components/academy/QuizModule";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLocalizedLevel, getLocalizedLesson } from "@/lib/i18n/academyLocalized";
import { getLocalizedLessonContent } from "@/lib/i18n/academyBodyContent";

// Light-surface chip variant of each level's accent color, used on the
// (light) lesson header and top bar — the dark-card chip variant for
// the Master Path roadmap lives in AcademyHub.jsx's LEVEL_THEME.
const LEVEL_TAG_THEME = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

// Dark-card chip variant of the same accent, used inside the dark
// outline sidebar (where a light chip would disappear).
const LEVEL_CHIP_DARK = {
  emerald: "bg-emerald-500/10 text-emerald-400",
  blue: "bg-blue-500/10 text-blue-400",
  violet: "bg-violet-500/10 text-violet-400",
  amber: "bg-amber-500/10 text-amber-400",
  rose: "bg-rose-500/10 text-rose-400",
};

const LEVEL_BAR_COLOR = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

function ProTip({ body }) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-slate-900 p-4">
      <span className="text-xl" aria-hidden="true">
        💡
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-400">{t("proTipLabel")}</p>
        <p className="mt-1 text-sm text-slate-200">{body}</p>
      </div>
    </div>
  );
}

function RiskWarning({ body }) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-slate-900 p-4">
      <span className="text-xl" aria-hidden="true">
        ⚠️
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-rose-400">{t("riskWarningLabel")}</p>
        <p className="mt-1 text-sm text-slate-200">{body}</p>
      </div>
    </div>
  );
}

function FormulaBadge({ label, formula, note }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-blue-500/30 bg-slate-900 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
        {t("keyFormulaLabel")} — {label}
      </p>
      <p className="mt-1.5 rounded-lg bg-black/30 px-3 py-2 font-mono text-sm font-semibold text-slate-100">
        {formula}
      </p>
      {note && <p className="mt-2 text-xs text-blue-200/80">{note}</p>}
    </div>
  );
}

/** A cross-link card pointing from this lesson out to a live OmniFin
 * tool page (/calculators, /converters, /market-analysis, /ai-news) —
 * for the case where the right follow-up isn't a tool that can be
 * embedded inline (see EmbeddedTool's registry), either because it's
 * a full page rather than a single widget, or because the honest
 * thing to say about it needs more than a widget caption (e.g. the
 * RSI and Gann lessons link to /market-analysis' live Technical
 * Analysis report, which explicitly marks its own RSI/Gann sections
 * unavailable without historical price data — the `note` field is
 * where that kind of caveat belongs, rather than overselling what the
 * live tool shows). Same dark-card visual language as ProTip/
 * FormulaBadge, in blue since this is a primary CTA. */
function RelatedLinkCard({ href, label, note }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900 p-4 transition-colors hover:border-blue-400/60"
    >
      <span className="text-xl" aria-hidden="true">
        🔗
      </span>
      <div>
        <p className="text-sm font-semibold text-blue-300">{label}</p>
        {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
      </div>
    </Link>
  );
}

function TextSection({ heading, body, list }) {
  return (
    <div>
      {heading && <h2 className="text-lg font-bold text-slate-900">{heading}</h2>}
      <p className={`text-sm leading-relaxed text-slate-600 ${heading ? "mt-2" : ""}`}>{body}</p>
      {Array.isArray(list) && list.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-0.5 text-blue-500" aria-hidden="true">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ section }) {
  switch (section.type) {
    case "text":
      return <TextSection heading={section.heading} body={section.body} list={section.list} />;
    case "proTip":
      return <ProTip body={section.body} />;
    case "risk":
      return <RiskWarning body={section.body} />;
    case "formula":
      return <FormulaBadge label={section.label} formula={section.formula} note={section.note} />;
    case "visual":
      return <LessonVisualCard diagram={section.diagram} caption={section.caption} />;
    case "tool":
      return <EmbeddedTool toolId={section.toolId} caption={section.caption} />;
    case "relatedLink":
      return <RelatedLinkCard href={section.href} label={section.label} note={section.note} />;
    default:
      return null;
  }
}

/** Sticky top bar: a stepper-style reading-progress bar (how far down
 * the lesson you've scrolled), the level tag, and the estimated read
 * time. Sits right below the site's own global header (which is
 * `sticky top-0`), so it stays visible on scroll without overlapping it. */
function LessonTopBar({ level, lesson, scrollPercent }) {
  const { t, language } = useLanguage();
  const tagTheme = LEVEL_TAG_THEME[level.theme] || LEVEL_TAG_THEME.blue;
  const levelTitle = language !== "en" ? getLocalizedLevel(language, level.id, level).title : level.title;
  return (
    <div className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className={`shrink-0 rounded-full border px-2 py-0.5 font-bold ${tagTheme}`}>
            {t("levelWord")} {level.order} · {levelTitle}
          </span>
          <span className="shrink-0 text-slate-500">~{lesson.estMinutes} {t("minWord")}</span>
          <span className="shrink-0 font-semibold text-slate-700">{scrollPercent}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-blue-500 transition-[width] duration-150"
            style={{ width: `${scrollPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Left sticky sidebar: the current level's header + progress bar,
 * then a vertical outline of every lesson from the current level
 * through every level still ahead — the course roadmap. Unlocked
 * levels' lessons are real links (the active one highlighted); a
 * still-locked level shows a 🔒 indicator and its lessons are inert. */
function LessonOutlineSidebar({ level, lessonId, progress }) {
  const { t, language } = useLanguage();
  const isLocalized = language !== "en";
  const levelPercent = progress.hydrated ? progress.getLevelProgressPercent(level.id) : 0;
  const barColor = LEVEL_BAR_COLOR[level.theme] || LEVEL_BAR_COLOR.blue;
  const levelTitle = isLocalized ? getLocalizedLevel(language, level.id, level).title : level.title;

  // The roadmap ahead: this level plus every level that comes after it
  // (earlier, already-passed levels aren't repeated here — the Academy
  // hub's Master Path is the place for the full history).
  const roadmapLevels = ACADEMY_LEVELS.filter((l) => l.order >= level.order);

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* Current level header + progress */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("levelWord")} {level.order}
        </p>
        <h2 className="mt-0.5 text-base font-extrabold text-white">{levelTitle}</h2>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full ${barColor}`} style={{ width: `${levelPercent}%` }} />
        </div>
        <p className="mt-1 text-[11px] font-medium text-slate-500">{t("percentOfLevelComplete", { percent: levelPercent })}</p>
      </div>

      {/* Outline — current level's lessons, then every level ahead */}
      <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900">
        {roadmapLevels.map((roadmapLevel) => {
          const unlocked = progress.hydrated
            ? progress.isLevelUnlocked(roadmapLevel.id)
            : roadmapLevel.order === 1;
          const chip = LEVEL_CHIP_DARK[roadmapLevel.theme] || LEVEL_CHIP_DARK.blue;
          const roadmapLevelTitle = isLocalized
            ? getLocalizedLevel(language, roadmapLevel.id, roadmapLevel).title
            : roadmapLevel.title;

          return (
            <div key={roadmapLevel.id} className="border-b border-slate-800 p-3 last:border-b-0">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${chip}`}>
                  {t("levelWord")} {roadmapLevel.order} · {roadmapLevelTitle}
                </span>
                {!unlocked && (
                  <span className="shrink-0 text-[11px] font-bold text-slate-500" aria-label="Locked level">
                    🔒
                  </span>
                )}
              </div>

              <ul className="mt-2 space-y-0.5">
                {roadmapLevel.lessons.map((roadmapLesson) => {
                  const isActive = roadmapLevel.id === level.id && roadmapLesson.id === lessonId;
                  const completed =
                    progress.hydrated && progress.isLessonCompleted(roadmapLevel.id, roadmapLesson.id);

                  const roadmapLessonTitle = isLocalized
                    ? getLocalizedLesson(language, roadmapLesson.id, roadmapLesson).title
                    : roadmapLesson.title;

                  // Oct 2026 pSEO/GEO/LLMO audit: a locked lesson used
                  // to render here as a plain <li><span> with no href
                  // at all — the in-lesson roadmap, same as the hub's
                  // cards above, gave a crawler (and a visitor ahead of
                  // schedule) no clickable path forward. The 🔒 is now
                  // a cosmetic badge only; the Link is always real.
                  return (
                    <li key={roadmapLesson.id}>
                      <Link
                        href={`/learn/${roadmapLevel.id}/${roadmapLesson.id}`}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          isActive
                            ? "bg-blue-500/15 font-semibold text-blue-300"
                            : unlocked
                            ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                            : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                        }`}
                      >
                        <span className="truncate">{roadmapLessonTitle}</span>
                        {completed && !isActive ? (
                          <span className="shrink-0 text-emerald-400" aria-hidden="true">
                            ✓
                          </span>
                        ) : !unlocked ? (
                          <span className="shrink-0" aria-hidden="true">
                            🔒
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LessonViewer({ levelId, lessonId }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isLocalized = language !== "en";
  const progress = useAcademyProgress();
  const resolved = getLesson(levelId, lessonId);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    if (resolved) progress.setLastActive(levelId, lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, lessonId]);

  // Reading-progress stepper: how far down the page the visitor has
  // scrolled, as a percentage. Reset to 0 whenever the lesson changes
  // (new page), and recomputed on every scroll/resize — wrapped so it
  // never throws if layout metrics are momentarily unavailable.
  useEffect(() => {
    setScrollPercent(0);
    function handleScroll() {
      try {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) {
          setScrollPercent(100);
          return;
        }
        const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
        setScrollPercent(pct);
      } catch {
        // Leave the last known percentage rather than crash the page.
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [levelId, lessonId]);

  if (!resolved) return null; // the server page already calls notFound() for an invalid pair

  const { level, lesson } = resolved;
  const { prev, next } = getAdjacentLessons(levelId, lessonId);
  const locked = progress.hydrated && !progress.isLevelUnlocked(levelId);
  const alreadyMastered = progress.isLessonCompleted(levelId, lessonId);
  const levelTitle = isLocalized ? getLocalizedLevel(language, level.id, level).title : level.title;
  const lessonTitle = isLocalized ? getLocalizedLesson(language, lesson.id, lesson).title : lesson.title;
  // Full lesson BODY (sections + quiz text) in the active language, with
  // a graceful per-section/per-question fallback to English wherever a
  // translation doesn't exist yet — see lib/i18n/academyBodyContent.js.
  // `toolId`/`diagram`/`href`/`correctOptionId` are never touched by this
  // overlay, so embeds, calculators, and quiz scoring are unaffected.
  const localizedLesson = isLocalized ? getLocalizedLessonContent(language, lesson) : lesson;

  function handleQuizFinish({ score, total }) {
    progress.recordQuizResult(levelId, lessonId, {
      score,
      total,
      passPercent: localizedLesson.quiz?.passPercent ?? 80,
    });
  }

  function handleProceed() {
    if (next) {
      router.push(`/learn/${next.level.id}/${next.lesson.id}`);
    } else {
      router.push("/learn");
    }
  }

  // Oct 2026 pSEO/GEO/LLMO audit: this used to swap the ENTIRE lesson
  // out for a 2-line "🔒 still locked" teaser once `progress.hydrated`
  // flipped true — which is also the state Google's indexing renderer
  // (and most answer-engine crawlers) actually captures, since they
  // wait for the client to settle before taking their content
  // snapshot. The practical effect: 16 of this Academy's 20 lessons
  // (everything past Level 1) rendered as a content-free locked teaser
  // to every crawler that ever visited, with zero real lesson text to
  // rank or be cited for — confirmed by the GSC export, where only
  // Rookie-level lessons show any impressions at all.
  //
  // The gamified unlock itself is good retention UX and stays — it's
  // just moved from "hide the content" to "gate the interactive quiz/
  // progression only" (the `locked` banner further down, in place of
  // <QuizModule>). Every visitor and every crawler now sees the real,
  // full lesson body unconditionally; what's actually locked until the
  // previous level is completed is the Checkpoint Quiz and the
  // "mark complete, move on" flow — exactly the parts that only matter
  // to a human working through the course, never to a reader or a
  // citation.
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/learn" className="hover:text-brand-600">
              {t("academy")}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{levelTitle}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {lessonTitle}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>~{lesson.estMinutes} {t("minWord")}</span>
            {alreadyMastered && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                ✓ {t("masteredWord")}
              </span>
            )}
          </div>
        </div>
      </section>

      <LessonTopBar level={level} lesson={lesson} scrollPercent={scrollPercent} />

      {/* Two-column reader: sticky outline sidebar + main content */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <LessonOutlineSidebar level={level} lessonId={lessonId} progress={progress} />
          </aside>

          <main className="space-y-6 lg:col-span-3">
            {localizedLesson.sections.map((section, i) => (
              <Section key={i} section={section} />
            ))}

            {localizedLesson.quiz && (
              <div id="module-quiz" className="pt-4">
                <h2 className="mb-3 text-lg font-bold text-slate-900">{t("checkpointQuizHeading")}</h2>
                {locked ? (
                  // The gamified gate, now scoped to just the quiz/
                  // progression (see the header comment above the main
                  // return below for why) — the lesson content itself,
                  // above this, is never hidden.
                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                    <p className="text-2xl" aria-hidden="true">
                      🔒
                    </p>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">{t("levelStillLockedTitle")}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {t("levelStillLockedDesc", { level: levelTitle })}
                    </p>
                    <Link
                      href="/learn"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] hover:bg-blue-500"
                    >
                      ← {t("backToAcademyLink")}
                    </Link>
                  </div>
                ) : (
                  <QuizModule
                    questions={localizedLesson.quiz.questions}
                    passPercent={localizedLesson.quiz.passPercent}
                    onFinish={handleQuizFinish}
                    onProceed={handleProceed}
                    canProceed
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Sticky lesson navigation — a dark floating bar, consistent with
          the rest of the Academy's dark "component island" accents */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {prev ? (
            <Link
              href={`/learn/${prev.level.id}/${prev.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm hover:border-slate-600 hover:text-white"
            >
              ← {t("previousLabel")}
            </Link>
          ) : (
            <span />
          )}

          {localizedLesson.quiz && (
            <a
              href="#module-quiz"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)] hover:bg-blue-500"
            >
              {t("jumpToQuizLabel")} ↓
            </a>
          )}

          {next ? (
            <Link
              href={`/learn/${next.level.id}/${next.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm hover:border-slate-600 hover:text-white"
            >
              {t("nextLabel")} →
            </Link>
          ) : (
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm hover:border-slate-600 hover:text-white"
            >
              {t("finishLabel")} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
