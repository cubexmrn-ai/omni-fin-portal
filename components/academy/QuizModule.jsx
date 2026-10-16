"use client";

// components/academy/QuizModule.jsx
//
// The Academy's end-of-lesson Checkpoint Quiz engine. Walks through a
// lesson's multiple-choice questions (lib/academyData.js) one at a time,
// gives instant visual feedback (emerald for correct, rose for
// incorrect) with an explanation the moment an option is selected, then
// shows a score card: pass/fail against the lesson's passPercent (80%
// by default), a correct-answer recap, and "Retake Quiz" / "Proceed to
// Next Chapter" actions.
//
// This component is deliberately decoupled from hooks/useAcademyProgress —
// it just reports the finished result via onFinish({ score, total,
// percent, passed }); the parent (components/academy/LessonViewer.jsx)
// is responsible for persisting that via the progress hook. This keeps
// the quiz UI reusable/testable without a localStorage dependency.
//
// DARK THEME + ACCENT SYSTEM: styled to match the rest of the Academy's
// dark redesign — electric blue for the active/primary state, emerald
// for correct answers and a passing score, soft rose for incorrect
// answers and a failing score (see components/academy/LessonViewer.jsx's
// header comment for the full 3-color accent system this page uses).

import { useState } from "react";

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
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 bg-black/20 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-100">Checkpoint Quiz</h3>
        <span className="text-xs font-semibold text-gray-400">{progressLabel}</span>
      </div>

      <div className="h-1.5 w-full bg-gray-800">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${((step + (hasAnsweredCurrent ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="p-5">
        <p className="text-base font-semibold text-gray-50">{currentQuestion.prompt}</p>

        <div className="mt-4 space-y-2.5">
          {currentQuestion.options.map((option) => {
            const isSelected = currentAnswer === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;

            let style =
              "border-gray-800 bg-gray-900 text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10";
            if (hasAnsweredCurrent) {
              if (isCorrectOption) {
                style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
              } else if (isSelected) {
                style = "border-rose-500/40 bg-rose-500/10 text-rose-300";
              } else {
                style = "border-gray-800 bg-gray-900 text-gray-500";
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
                  <span className="shrink-0 text-emerald-400" aria-hidden="true">
                    ✓
                  </span>
                )}
                {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                  <span className="shrink-0 text-rose-400" aria-hidden="true">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {hasAnsweredCurrent && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              currentAnswer === currentQuestion.correctOptionId
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            <p className="font-semibold">
              {currentAnswer === currentQuestion.correctOptionId ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={goNext}
            disabled={!hasAnsweredCurrent}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)] transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div
        className={`px-5 py-6 text-center ${
          passed
            ? "bg-gradient-to-br from-emerald-500/15 to-transparent"
            : "bg-gradient-to-br from-rose-500/15 to-transparent"
        }`}
      >
        <p className="text-4xl" aria-hidden="true">
          {passed ? "🎉" : "📘"}
        </p>
        <h3 className="mt-2 text-lg font-extrabold text-gray-50">
          {passed ? "Module Mastered!" : "Almost there"}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          You scored <span className="font-bold text-gray-100">{score} / {total}</span> ({percent}%)
          {" — "}
          {passed
            ? "you've cleared the pass threshold for this module."
            : "a higher score is needed to master this module. Review the recap below and try again."}
        </p>
      </div>

      <div className="divide-y divide-gray-800 border-t border-gray-800">
        {questions.map((q, i) => {
          const givenAnswerId = answers[i];
          const wasCorrect = givenAnswerId === q.correctOptionId;
          const correctOption = q.options.find((o) => o.id === q.correctOptionId);
          return (
            <div key={q.id} className="px-5 py-3">
              <p className="flex items-start gap-2 text-sm font-medium text-gray-200">
                <span className={wasCorrect ? "text-emerald-400" : "text-rose-400"} aria-hidden="true">
                  {wasCorrect ? "✓" : "✕"}
                </span>
                {q.prompt}
              </p>
              <p className="mt-1 pl-5 text-xs text-gray-500">
                Correct answer: <span className="font-semibold text-gray-300">{correctOption?.text}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-800 bg-black/20 px-5 py-4">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-300 shadow-sm transition-colors hover:border-gray-600 hover:text-gray-100"
        >
          Retake Quiz
        </button>
        {passed && onProceed && (
          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)] transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Proceed to Next Chapter →
          </button>
        )}
      </div>
    </div>
  );
}
