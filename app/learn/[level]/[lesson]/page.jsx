// app/learn/[level]/[lesson]/page.jsx
//
// One Academy lesson page, e.g. /learn/apprentice/candlestick-anatomy.
// A server component shell (so it can export generateStaticParams +
// generateMetadata and call notFound() for an unknown level/lesson pair)
// wrapping components/academy/LessonViewer.jsx, the "use client"
// component that renders the actual lesson content, sticky nav, and
// quiz engine — progress tracking lives in localStorage, which only
// exists client-side (same split as app/learn/page.jsx + AcademyHub.jsx).

import { notFound } from "next/navigation";
import { ACADEMY_LEVELS, getLesson } from "@/lib/academyData";
import LessonViewer from "@/components/academy/LessonViewer";

export function generateStaticParams() {
  const params = [];
  for (const level of ACADEMY_LEVELS) {
    for (const lesson of level.lessons) {
      params.push({ level: level.id, lesson: lesson.id });
    }
  }
  return params;
}

export function generateMetadata({ params }) {
  const resolved = getLesson(params.level, params.lesson);
  if (!resolved) {
    return { title: "Lesson Not Found | OmniFin Academy" };
  }
  const { level, lesson } = resolved;
  const title = `${lesson.title} — Level ${level.order} ${level.title} | OmniFin Academy`;
  const description = `A ${lesson.estMinutes}-minute OmniFin Academy lesson on ${lesson.title.toLowerCase()}, part of Level ${level.order} (${level.title}): ${level.subtitle}. Includes a 5-question end-of-module quiz.`;
  return { title, description };
}

export default function LessonPage({ params }) {
  const resolved = getLesson(params.level, params.lesson);
  if (!resolved) notFound();

  return <LessonViewer levelId={params.level} lessonId={params.lesson} />;
}
