"use client";

// components/academy/LessonViewer.jsx
//
// The interactive body of a lesson page (app/learn/[level]/[lesson]/page.jsx):
// renders the lesson's typed content sections (text / proTip / formula /
// visual / tool), a sticky prev/next + "Jump to Quiz" nav bar, and the
// end-of-module QuizModule wired to hooks/useAcademyProgress so a
// passing score marks the lesson Mastered and unlocks the next level.
//
// Split out as "use client" (same pattern as components/academy/AcademyHub.jsx)
// so the page.jsx route itself can stay a server component with its own
// generateStaticParams/metadata — progress lives in localStorage, which
// only exists client-side.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLesson, getAdjacentLessons } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import LessonVisualCard from "@/components/academy/LessonVisualCard";
import EmbeddedTool from "@/components/academy/EmbeddedTool";
import QuizModule from "@/components/academy/QuizModule";

function ProTip({ body }) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <span className="text-xl" aria-hidden="true">💡</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Pro Tip</p>
        <p className="mt-1 text-sm text-blue-900">{body}</p>
      </div>
    </div>
  );
}

function FormulaBadge({ label, formula, note }) {
  return (
    <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gold-700">
        Key Formula / Concept — {label}
      </p>
      <p className="mt-1.5 rounded-lg bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-800">
        {formula}
      </p>
      {note && <p className="mt-2 text-xs text-gold-800">{note}</p>}
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
              <span className="mt-0.5 text-brand-500" aria-hidden="true">•</span>
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

export default function LessonViewer({ levelId, lessonId }) {
  const router = useRouter();
  const progress = useAcademyProgress();
  const resolved = getLesson(levelId, lessonId);

  useEffect(() => {
    if (resolved) progress.setLastActive(levelId, lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-4xl" aria-hidden="true">🔒</p>
        <h1 className="mt-3 text-xl font-bold text-slate-900">This level is still locked</h1>
        <p className="mt-2 text-sm text-slate-500">
          Finish and pass every quiz in the previous level to unlock {level.title}.
        </p>
        <Link
          href="/learn"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          ← Back to Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/learn" className="hover:text-brand-600">Academy</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{level.title}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {lesson.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>~{lesson.estMinutes} min read</span>
            {alreadyMastered && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                ✓ Mastered
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {lesson.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}

        {lesson.quiz && (
          <div id="module-quiz" className="pt-4">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Test Your Understanding</h2>
            <QuizModule
              questions={lesson.quiz.questions}
              passPercent={lesson.quiz.passPercent}
              onFinish={handleQuizFinish}
              onProceed={handleProceed}
              canProceed
            />
          </div>
        )}
      </section>

      {/* Sticky lesson navigation */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {prev ? (
            <Link
              href={`/learn/${prev.level.id}/${prev.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          {lesson.quiz && (
            <a
              href="#module-quiz"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Jump to Quiz ↓
            </a>
          )}

          {next ? (
            <Link
              href={`/learn/${next.level.id}/${next.lesson.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Next →
            </Link>
          ) : (
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Finish →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
