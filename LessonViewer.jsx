"use client";

// components/academy/LessonViewer.jsx
//
// The interactive body of a lesson page (app/learn/[level]/[lesson]/page.jsx):
// a sticky stepper/progress top bar, a sticky Course Sidebar for
// jumping between lessons in the current level, the lesson's typed
// content sections (text / proTip / risk / formula / visual / tool), a
// sticky prev/next + "Jump to Quiz" bottom nav bar, and the
// end-of-lesson Checkpoint Quiz (components/academy/QuizModule.jsx)
// wired to hooks/useAcademyProgress so a passing score marks the
// lesson Mastered and unlocks the next level.
//
// THEME: the page body (header, breadcrumb, plain paragraph text) uses
// the site's normal light theme (bg-slate-50 / #f8fafc) for proper
// contrast — ONLY the callout cards (pro-tip/risk/formula), the
// sidebar, the top progress bar, the embedded tool frames, the
// diagrams, and the quiz are dark/glassmorphic (solid
// bg-slate-900/#0f172a cards with colored borders — NOT translucent
// color tints, which would wash out against a light page instead of
// reading as a dark card), so they pop against the light body around
// them. See components/academy/AcademyHub.jsx's header comment for the
// fuller rationale.
//
// ACCENT SYSTEM (unchanged): Electric Blue (blue-500/#3b82f6) for
// primary CTAs/formula cards, Emerald (emerald-500/#10b981) for
// pro-tips and mastered/correct states, Soft Rose (rose-500/#f43f5e)
// for risk warnings and incorrect/failing states.
//
// LAYOUT: the main content area is a two-column layout once a level is
// unlocked — a sticky left-column CourseSidebar (level header,
// progress bar, clickable lesson list, active-lesson highlight) and
// the right-column lesson reader (content, callouts, mini-tools,
// quiz). See components/academy/CourseSidebar.jsx.
//
// Split out as "use client" (same pattern as components/academy/AcademyHub.jsx)
// so the page.jsx route itself can stay a server component with its own
// generateStaticParams/metadata — progress lives in localStorage, which
// only exists client-side.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLesson, getAdjacentLessons } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import LessonVisualCard from "@/components/academy/LessonVisualCard";
import EmbeddedTool from "@/components/academy/EmbeddedTool";
import QuizModule from "@/components/academy/QuizModule";
import CourseSidebar from "@/components/academy/CourseSidebar";

const LEVEL_TAG_THEME = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

function ProTip({ body }) {
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-500/40 bg-slate-900 p-4 shadow-xl shadow-black/20">
      <span className="text-xl" aria-hidden="true">
        💡
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-400">Pro Tip</p>
        <p className="mt-1 text-sm text-slate-200">{body}</p>
      </div>
    </div>
  );
}

function RiskWarning({ body }) {
  return (
    <div className="flex gap-3 rounded-xl border border-rose-500/40 bg-slate-900 p-4 shadow-xl shadow-black/20">
      <span className="text-xl" aria-hidden="true">
        ⚠️
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-rose-400">Risk Warning</p>
        <p className="mt-1 text-sm text-slate-200">{body}</p>
      </div>
    </div>
  );
}

function FormulaBadge({ label, formula, note }) {
  return (
    <div className="rounded-xl border border-blue-500/40 bg-slate-900 p-4 shadow-xl shadow-black/20">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
        Key Formula / Concept — {label}
      </p>
      <p className="mt-1.5 rounded-lg bg-black/40 px-3 py-2 font-mono text-sm font-semibold text-slate-100">
        {formula}
      </p>
      {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
    </div>
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
              <span className="mt-0.5 text-blue-600" aria-hidden="true">
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
    default:
      return null;
  }
}

/** Sticky top bar: a stepper-style reading-progress bar (how far down
 * the lesson you've scrolled), the level tag, and the estimated read
 * time. A dark, floating widget — deliberately solid (not a page-body
 * element) so it stays legible and "pops" sitting over the light page
 * as you scroll. Sits right below the site's own global header (which
 * is `sticky top-0`), so the two sticky bars never overlap. */
function LessonTopBar({ level, lesson, scrollPercent }) {
  const tagTheme = LEVEL_TAG_THEME[level.theme] || LEVEL_TAG_THEME.blue;
  return (
    <div className="sticky top-16 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className={`shrink-0 rounded-full border px-2 py-0.5 font-bold ${tagTheme}`}>
            Level {level.order} · {level.title}
          </span>
          <span className="shrink-0 text-slate-500">~{lesson.estMinutes} min read</span>
          <span className="shrink-0 font-semibold text-slate-300">{scrollPercent}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-blue-500 transition-[width] duration-150"
            style={{ width: `${scrollPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LessonViewer({ levelId, lessonId }) {
  const router = useRouter();
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

  function handleQuizFinish({ score, total }) {
    progress.recordQuizResult(levelId, lessonId, {
      score,
      total,
      passPercent: lesson.quiz?.passPercent ?? 80,
    });
  }

  function handleProceed() {
    if (next) {
      router.push(`/learn/${next.level.id}/${next.lesson.id}`);
    } else {
      router.push("/learn");
    }
  }

  if (locked) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-4xl" aria-hidden="true">
            🔒
          </p>
          <h1 className="mt-3 text-xl font-bold text-slate-900">This level is still locked</h1>
          <p className="mt-2 text-sm text-slate-500">
            Finish and pass every quiz in the previous level to unlock {level.title} on the
            Master Path — or browse this topic&apos;s free overview from the Academy&apos;s
            category tracks.
          </p>
          <Link
            href="/learn"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] hover:bg-blue-500"
          >
            ← Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/learn" className="hover:text-brand-600">
              Academy
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{level.title}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {lesson.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>~{lesson.estMinutes} min read</span>
            {alreadyMastered && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                ✓ Mastered
              </span>
            )}
          </div>
        </div>
      </section>

      <LessonTopBar level={level} lesson={lesson} scrollPercent={scrollPercent} />

      {/* Two-column lesson reader: a sticky left-column Course Sidebar
          (1 of 4 grid columns — level header, progress bar, clickable
          lesson list) and the right-column reader (3 of 4 columns —
          content, callouts, mini-tools, quiz). Stacks to one column
          below the lg breakpoint. */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:items-start">
          <CourseSidebar levelId={levelId} currentLessonId={lessonId} />

          <div className="min-w-0 lg:col-span-3">
            <div className="mx-auto max-w-3xl space-y-6">
              {lesson.sections.map((section, i) => (
                <Section key={i} section={section} />
              ))}

              {lesson.quiz && (
                <div id="module-quiz" className="pt-4">
                  <h2 className="mb-3 text-lg font-bold text-slate-900">Checkpoint Quiz</h2>
                  <QuizModule
                    questions={lesson.quiz.questions}
                    passPercent={lesson.quiz.passPercent}
                    onFinish={handleQuizFinish}
                    onProceed={handleProceed}
                    canProceed
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky lesson navigation */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {prev ? (
            <Link
              href={`/learn/${prev.level.id}/${prev.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 shadow-sm hover:border-slate-700 hover:text-slate-100"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          {lesson.quiz && (
            <a
              href="#module-quiz"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)] hover:bg-blue-500"
            >
              Jump to Quiz ↓
            </a>
          )}

          {next ? (
            <Link
              href={`/learn/${next.level.id}/${next.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 shadow-sm hover:border-slate-700 hover:text-slate-100"
            >
              Next →
            </Link>
          ) : (
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 shadow-sm hover:border-slate-700 hover:text-slate-100"
            >
              Finish →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
