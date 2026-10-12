"use client";

// hooks/useAcademyProgress.js
//
// localStorage-backed progress tracker for the OmniFin Academy (/learn).
// Tracks completed lessons, per-module quiz scores, and derives level
// unlock state and overall completion % from lib/academyData.js's
// curriculum structure — all client-side, no account/server needed.
//
// STORAGE SHAPE (v1):
// {
//   version: 1,
//   completedLessons: { "<levelId>/<lessonId>": true, ... },
//   quizResults: {
//     "<levelId>/<lessonId>": { score, total, percent, passed, attempts, lastAttemptAt }
//   },
//   lastActive: { levelId, lessonId } | null,
// }
//
// A lesson counts as "Mastered" only once its quiz has been PASSED (not
// just attempted) — see PASS_PERCENT in lib/academyData.js (80%, i.e.
// 4 of 5 questions). Level N unlocks once every lesson in Level N-1 has
// been mastered; Level 1 is always unlocked.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ACADEMY_LEVELS, getLevelStats } from "@/lib/academyData";

const STORAGE_KEY = "omnifin.academy.progress.v1";

function emptyState() {
  return {
    version: 1,
    completedLessons: {},
    quizResults: {},
    lastActive: null,
  };
}

function lessonKey(levelId, lessonId) {
  return `${levelId}/${lessonId}`;
}

/** Reads and lightly validates the stored progress blob. Never throws —
 * a corrupted/missing/blocked localStorage just falls back to a fresh
 * empty state, since progress is a nice-to-have, not load-bearing. */
function readStoredProgress() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      version: 1,
      completedLessons:
        parsed.completedLessons && typeof parsed.completedLessons === "object"
          ? parsed.completedLessons
          : {},
      quizResults:
        parsed.quizResults && typeof parsed.quizResults === "object" ? parsed.quizResults : {},
      lastActive: parsed.lastActive || null,
    };
  } catch {
    return emptyState();
  }
}

function writeStoredProgress(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort only (private browsing, storage quota, blocked site
    // data, etc.) — the in-memory React state still works for the rest
    // of this session even if persistence silently fails.
  }
}

/**
 * React hook exposing the person's Academy progress, backed by
 * localStorage. Safe to call from any client component; on the server
 * (or before the client has hydrated) it reads as an empty/default
 * state and syncs from localStorage once mounted.
 */
export function useAcademyProgress() {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once, after mount (avoids SSR/client
  // markup mismatch — the server always renders the empty default).
  useEffect(() => {
    setState(readStoredProgress());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStoredProgress(next);
      return next;
    });
  }, []);

  const isLessonCompleted = useCallback(
    (levelId, lessonId) => Boolean(state.completedLessons[lessonKey(levelId, lessonId)]),
    [state.completedLessons]
  );

  const getQuizResult = useCallback(
    (levelId, lessonId) => state.quizResults[lessonKey(levelId, lessonId)] || null,
    [state.quizResults]
  );

  /** Records which lesson the person is currently viewing, independent
   * of its quiz — just for "Resume where you left off" / the hub's
   * "Level N — X% Completed" banner context. Viewing a lesson alone
   * never marks it complete; only a passed quiz does (see
   * recordQuizResult below). */
  const setLastActive = useCallback(
    (levelId, lessonId) => {
      persist((prev) => ({ ...prev, lastActive: { levelId, lessonId } }));
    },
    [persist]
  );

  /** Records one quiz attempt's result. A passing score (>= the
   * lesson's passPercent, default 80%) marks the lesson "Mastered"
   * (completed) and unlocks progression to the next level once every
   * lesson in the current level is mastered. A failing attempt still
   * updates quizResults (for the score card / retake flow) but does
   * NOT mark the lesson complete. */
  const recordQuizResult = useCallback(
    (levelId, lessonId, { score, total, passPercent = 80 }) => {
      const key = lessonKey(levelId, lessonId);
      const percent = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = percent >= passPercent;

      persist((prev) => {
        const prevResult = prev.quizResults[key];
        const attempts = (prevResult?.attempts || 0) + 1;
        const bestPercent = Math.max(percent, prevResult?.bestPercent || 0);

        return {
          ...prev,
          lastActive: { levelId, lessonId },
          quizResults: {
            ...prev.quizResults,
            [key]: {
              score,
              total,
              percent,
              passed: passed || Boolean(prevResult?.passed),
              bestPercent,
              attempts,
              lastAttemptAt: new Date().toISOString(),
            },
          },
          completedLessons:
            passed || prevResult?.passed
              ? { ...prev.completedLessons, [key]: true }
              : prev.completedLessons,
        };
      });

      return { percent, passed };
    },
    [persist]
  );

  /** Level 1 is always unlocked. Level N (N > 1) unlocks once every
   * lesson in Level N-1 has been completed (quiz passed). */
  const isLevelUnlocked = useCallback(
    (levelId) => {
      const index = ACADEMY_LEVELS.findIndex((l) => l.id === levelId);
      if (index <= 0) return true; // first level, or unknown id (fail open to unlocked)
      const previousLevel = ACADEMY_LEVELS[index - 1];
      return previousLevel.lessons.every((lesson) =>
        Boolean(state.completedLessons[lessonKey(previousLevel.id, lesson.id)])
      );
    },
    [state.completedLessons]
  );

  const isLevelMastered = useCallback(
    (levelId) => {
      const level = ACADEMY_LEVELS.find((l) => l.id === levelId);
      if (!level) return false;
      return level.lessons.every((lesson) =>
        Boolean(state.completedLessons[lessonKey(level.id, lesson.id)])
      );
    },
    [state.completedLessons]
  );

  const getLevelProgressPercent = useCallback(
    (levelId) => {
      const level = ACADEMY_LEVELS.find((l) => l.id === levelId);
      if (!level || level.lessons.length === 0) return 0;
      const completedCount = level.lessons.filter((lesson) =>
        Boolean(state.completedLessons[lessonKey(level.id, lesson.id)])
      ).length;
      return Math.round((completedCount / level.lessons.length) * 100);
    },
    [state.completedLessons]
  );

  const overall = useMemo(() => {
    let totalLessons = 0;
    let completedCount = 0;
    for (const level of ACADEMY_LEVELS) {
      totalLessons += level.lessons.length;
      for (const lesson of level.lessons) {
        if (state.completedLessons[lessonKey(level.id, lesson.id)]) completedCount += 1;
      }
    }
    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Current level = the first level that isn't fully mastered yet
    // (or the last level, if everything is mastered).
    let currentLevel = ACADEMY_LEVELS[ACADEMY_LEVELS.length - 1];
    for (const level of ACADEMY_LEVELS) {
      const allDone = level.lessons.every((lesson) =>
        Boolean(state.completedLessons[lessonKey(level.id, lesson.id)])
      );
      if (!allDone) {
        currentLevel = level;
        break;
      }
    }

    return { totalLessons, completedCount, percent, currentLevel };
  }, [state.completedLessons]);

  const resetProgress = useCallback(() => {
    persist(emptyState());
  }, [persist]);

  return {
    hydrated,
    isLessonCompleted,
    getQuizResult,
    setLastActive,
    recordQuizResult,
    isLevelUnlocked,
    isLevelMastered,
    getLevelProgressPercent,
    overallPercent: overall.percent,
    overallCompletedCount: overall.completedCount,
    overallTotalLessons: overall.totalLessons,
    currentLevel: overall.currentLevel,
    lastActive: state.lastActive,
    resetProgress,
  };
}

// Re-exported so components can compute level metadata without a
// separate import of lib/academyData.js when they already use this hook.
export { getLevelStats };
