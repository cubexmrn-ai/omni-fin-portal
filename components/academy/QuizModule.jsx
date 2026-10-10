"use client";

// components/academy/QuizModule.jsx
//
// End-of-module quiz engine. Walks through a lesson's 4-5 multiple
// choice questions (lib/academyData.js) one at a time, gives instant
// green/red visual feedback with an explanation the moment an option is
// selected, then shows a score card: pass/fail against the lesson's
// passPercent (80% = 4 of 5 correct by default), a correct-answer
// recap, and "Retake Quiz" / "Proceed to Next Chapter" actions.
//
// This component is deliberately decoupled from hooks/useAcademyProgress —
// it just reports the finished result via onFinish({ score, total,
// percent, passed }); the parent (components/academy/LessonViewer.jsx)
// is responsible for persisting that via the progress hook. This keeps
// the quiz UI reusable/testable without a localStorage dependency.

import { useMemo, useState } from "react";

function buildInitialAnswers(questions) {
  return questions.map(() => null);
}

export default function QuizModule({ questions, passPercent = 80, onFinish, onProceed, canProceed = true }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => buildInitialAnswers(questions));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const total = questions.length;
  const currentQuestion = questions[step];
  const currentAnswer = answers[step];
  const hasAnsweredCurrent = currentAnswer !== null;
  const isLastQuestion = step === total - 1;

  function selectOption(optionId) {
    if (hasAnsweredCurrent) return; // lock the choice once made, like a real quiz
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optionId;
      return next;
    });
  }

  function goNext() {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setStep((s) => s + 1);
    }
  }

  function finishQuiz() {
    const score = questions.reduce(
      (count, q, i) => (answers[i] === q.correctOptionId ? count + 1 : count),
      0
    );
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percent >= passPercent;
    const finalResult = { score, total, percent, passed };
    setResult(finalResult);
    setSubmitted(true);
    onFinish?.(finalResult);
  }

  function retake() {
    setStep(0);
    setAnswers(buildInitialAnswers(questions));
    setSubmitted(false);
    setResult(null);
  }

  const progressLabel = `Question ${step + 1} of ${total}`;

  if (submitted && result) {
    return <ScoreCard result={result} questions={questions} answers={answers} onRetake={retake} onProceed={onProceed} canProceed={canProceed} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Module Quiz</h3>
        <span className="text-xs font-semibold text-slate-500">{progressLabel}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100">
        <div
          className="h-full bg-brand-600 transition-all"
          style={{ width: `${((step + (hasAnsweredCurrent ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="p-5">
        <p className="text-base font-semibold text-slate-900">{currentQuestion.prompt}</p>

        <div className="mt-4 space-y-2.5">
          {currentQuestion.options.map((option) => {
            const isSelected = currentAnswer === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;

            let style =
              "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50";
            if (hasAnsweredCurrent) {
              if (isCorrectOption) {
                style = "border-emerald-400 bg-emerald-50 text-emerald-800";
              } else if (isSelected) {
                style = "border-rose-400 bg-rose-50 text-rose-800";
              } else {
                style = "border-slate-200 bg-white text-slate-400";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option.id)}
                disabled={hasAnsweredCurrent}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${style} ${
                  hasAnsweredCurrent ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span>{option.text}</span>
                {hasAnsweredCurrent && isCorrectOption && (
                  <span className="shrink-0 text-emerald-600" aria-hidden="true">✓</span>
                )}
                {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                  <span className="shrink-0 text-rose-600" aria-hidden="true">✕</span>
                )}
              </button>
            );
          })}
        </div>

        {hasAnsweredCurrent && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              currentAnswer === currentQuestion.correctOptionId
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <p className="font-semibold">
              {currentAnswer === currentQuestion.correctOptionId ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-slate-600">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={goNext}
            disabled={!hasAnsweredCurrent}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastQuestion ? "See Results" : "Next Question →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ result, questions, answers, onRetake, onProceed, canProceed }) {
  const { score, total, percent, passed } = result;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className={`px-5 py-6 text-center ${
          passed ? "bg-gradient-to-br from-emerald-50 to-white" : "bg-gradient-to-br from-rose-50 to-white"
        }`}
      >
        <p className="text-4xl" aria-hidden="true">{passed ? "🎉" : "📘"}</p>
        <h3 className="mt-2 text-lg font-extrabold text-slate-900">
          {passed ? "Module Mastered!" : "Almost there"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          You scored <span className="font-bold text-slate-900">{score} / {total}</span> ({percent}%)
          {" — "}
          {passed
            ? "you've cleared the 80% threshold for this module."
            : "80% (4 of 5) is needed to master this module. Review the recap below and try again."}
        </p>
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {questions.map((q, i) => {
          const givenAnswerId = answers[i];
          const wasCorrect = givenAnswerId === q.correctOptionId;
          const correctOption = q.options.find((o) => o.id === q.correctOptionId);
          return (
            <div key={q.id} className="px-5 py-3">
              <p className="flex items-start gap-2 text-sm font-medium text-slate-800">
                <span className={wasCorrect ? "text-emerald-600" : "text-rose-600"} aria-hidden="true">
                  {wasCorrect ? "✓" : "✕"}
                </span>
                {q.prompt}
              </p>
              <p className="mt-1 pl-5 text-xs text-slate-500">
                Correct answer: <span className="font-semibold text-slate-700">{correctOption?.text}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Retake Quiz
        </button>
        {passed && onProceed && (
          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to Next Chapter →
          </button>
        )}
      </div>
    </div>
  );
}
