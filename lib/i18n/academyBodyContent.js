// lib/i18n/academyBodyContent.js
//
// FULL lesson-BODY localization — the pipeline that overlays translated
// paragraph/bullet/callout/quiz TEXT onto the English lesson data from
// lib/academyData.js, language by language, with a safe per-section and
// per-question fallback to English wherever a translation doesn't exist
// yet. This is a separate, additive layer on top of
// lib/i18n/academyLocalized.js (which only ever translated level/lesson
// METADATA — the hub's titles/subtitles/descriptions) — that file is
// untouched by this one.
//
// SCOPE OF THIS PHASE (documented honestly, same as this project's other
// "here's exactly what is and isn't covered" notes — e.g. hooks/
// useTradingJournal.js's cloud-sync note): full body translation is
// live for the five languages explicitly prioritized for this rollout —
// Spanish (es), Hindi (hi), Arabic (ar), French (fr), Roman Urdu
// (ur-Latn), and Urdu (ur) — across all 20 lessons. The other 11
// supported languages intentionally render the English lesson body
// (their level/lesson METADATA — titles/subtitles — is still fully
// localized via academyLocalized.js) until a later pass translates
// their bodies too; getLocalizedLessonContent() below falls back to
// the English lesson object whenever a language has no body pack, so
// nothing breaks or shows a half-translated page for those languages.
//
// WHAT GETS TRANSLATED PER SECTION (and what deliberately doesn't):
//   - "text"     -> heading, body, list[]            (fully translated)
//   - "proTip"   -> body                             (fully translated)
//   - "risk"     -> body                             (fully translated)
//   - "formula"  -> label, note                       (translated) —
//                   the `formula` string itself (e.g. "Real Return ≈
//                   Nominal Return − Inflation Rate") is deliberately
//                   LEFT IN ENGLISH, same bracket-convention reasoning
//                   used elsewhere in this project for specialized
//                   trading terms: a formula is effectively notation,
//                   and a learner who later reads English broker/
//                   trading material benefits from recognizing the
//                   exact term rather than a translated paraphrase of it.
//   - "visual"   -> caption only                      (translated) —
//                   the diagram's own internal data (steps/columns/
//                   labels that drive the actual SVG) is left as-is so
//                   LessonVisualCard's rendering logic never has to
//                   branch on language; the caption around it carries
//                   the explanation.
//   - "tool"     -> caption only                      (translated) —
//                   `toolId` is never touched, so EmbeddedTool resolves
//                   the exact same live calculator regardless of language.
//   - "relatedLink" -> label, note                    (translated) —
//                   `href` is never touched.
//   - quiz questions -> prompt, options[].text, explanation (translated)
//                   — `id` and `correctOptionId` are never touched, so
//                   scoring logic in QuizModule is 100% unaffected by
//                   language.
//
// Per-language packs live in ./academyBody/<lang>.js, each keyed by
// lessonId -> { sections: [ {..partial fields..} | null, ... ], quiz:
// { questions: [ { id, prompt?, options?, explanation? }, ... ] } },
// with the `sections` array in the exact same order as the lesson's
// own `sections` array in lib/academyData.js (matched by index) and
// quiz questions matched by their stable `id` (so the packs don't need
// to list every question if only some have strings worth overriding —
// though in practice every question here is fully translated).

import { ACADEMY_BODY_ES } from "./academyBody/es";
import { ACADEMY_BODY_HI } from "./academyBody/hi";
import { ACADEMY_BODY_AR } from "./academyBody/ar";
import { ACADEMY_BODY_FR } from "./academyBody/fr";
import { ACADEMY_BODY_UR_LATN } from "./academyBody/urLatn";
import { ACADEMY_BODY_UR } from "./academyBody/ur";

export const ACADEMY_BODY_I18N = {
  es: ACADEMY_BODY_ES,
  hi: ACADEMY_BODY_HI,
  ar: ACADEMY_BODY_AR,
  fr: ACADEMY_BODY_FR,
  "ur-Latn": ACADEMY_BODY_UR_LATN,
  ur: ACADEMY_BODY_UR,
};

/** Languages with a full lesson-body translation pack today — exported
 * so UI (e.g. a "body translated" badge, or the compliance disclaimer)
 * can tell a fully-localized lesson apart from an English-body fallback
 * without re-deriving that list elsewhere. */
export const ACADEMY_BODY_LOCALIZED_LANGUAGES = Object.keys(ACADEMY_BODY_I18N);

/** Overlays this language's translated section/quiz TEXT onto a clone
 * of the English `lesson` object from lib/academyData.js. Falls back
 * gracefully at three levels, so a partial or missing pack never
 * breaks the page or shows `undefined`:
 *   1. No pack at all for this language -> the whole lesson stays English.
 *   2. No translated entry for this lessonId -> that lesson stays English.
 *   3. A section/question has no translated entry -> that one section
 *      or question stays English while its siblings are translated.
 * `toolId`, `diagram`, `href`, `id`, and `correctOptionId` are never
 * touched by this function (the spread only ever adds the keys present
 * on the translated entry), so embeds/calculators/quiz-scoring logic
 * are structurally guaranteed to be unaffected by language. */
export function getLocalizedLessonContent(language, lesson) {
  if (!lesson || language === "en") return lesson;
  const pack = ACADEMY_BODY_I18N[language];
  const translated = pack?.[lesson.id];
  if (!translated) return lesson;

  const sections = lesson.sections.map((section, i) => {
    const t = translated.sections?.[i];
    return t ? { ...section, ...t } : section;
  });

  const quiz = lesson.quiz
    ? {
        ...lesson.quiz,
        questions: lesson.quiz.questions.map((q) => {
          const tq = translated.quiz?.questions?.find((x) => x.id === q.id);
          if (!tq) return q;
          return {
            ...q,
            prompt: tq.prompt || q.prompt,
            explanation: tq.explanation || q.explanation,
            options: tq.options
              ? q.options.map((opt) => {
                  const to = tq.options.find((x) => x.id === opt.id);
                  return to ? { ...opt, text: to.text } : opt;
                })
              : q.options,
          };
        }),
      }
    : lesson.quiz;

  return { ...lesson, sections, quiz };
}
