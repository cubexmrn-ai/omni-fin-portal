"use client";

// components/academy/TickerAcademyContent.jsx
//
// Split out of components/StickyBottomTicker.jsx and loaded through
// next/dynamic there (ssr: false), rather than imported at the top of
// that file. StickyBottomTicker is mounted once, globally, in
// app/layout.jsx, so anything it imports at module scope ends up in
// EVERY page's client bundle — and lib/academyData.js (pulled in here
// both directly and via useAcademyProgress) is ~2,300 lines of lesson
// content, exactly the kind of weight that shouldn't ship to someone
// browsing /converters or /calculators who never opens the Academy.
// Dynamically importing this component means that chunk is only
// fetched once a visitor actually lands on an Academy route.
//
// Resolves a real "key takeaway" line straight from the CURRENT
// lesson's own authored content — never a generated summary — so this
// never puts words in the curriculum's mouth that aren't already
// there: prefers the lesson's first `proTip` callout, then its first
// `formula` note, then just the lesson title.

import { getLesson } from "@/lib/academyData";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function getLessonTakeaway(lesson) {
  if (!lesson) return null;
  const sections = lesson.sections || [];
  const proTip = sections.find((s) => s.type === "proTip" && s.body);
  if (proTip) return proTip.body;
  const formula = sections.find((s) => s.type === "formula" && s.note);
  if (formula) return formula.note;
  return lesson.title;
}

export default function TickerAcademyContent({ pathname }) {
  const { t } = useLanguage();
  const progress = useAcademyProgress();

  const segments = (pathname || "").split("/").filter(Boolean); // ["learn", level, lesson]
  let line = null;

  if (segments.length >= 3) {
    const resolved = getLesson(segments[1], segments[2]);
    line = resolved ? getLessonTakeaway(resolved.lesson) : null;
  } else if (progress.hydrated && progress.lastActive) {
    const resolved = getLesson(progress.lastActive.levelId, progress.lastActive.lessonId);
    line = resolved ? `${t("continueWord")}: ${resolved.lesson.title}` : null;
  }

  if (!line) line = t("tickerAcademyGenericLine");

  return <p className="truncate text-xs font-medium text-slate-200 sm:text-sm">{line}</p>;
}
