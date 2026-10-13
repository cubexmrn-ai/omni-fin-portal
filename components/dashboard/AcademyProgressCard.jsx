"use client";

// components/dashboard/AcademyProgressCard.jsx
//
// Dashboard tile summarizing Level 1-5 Academy curriculum completion,
// reading the exact same hooks/useAcademyProgress.js hook (and
// localStorage key) that drives components/academy/AcademyHub.jsx —
// so "completed" here always means a quiz was actually passed there,
// never a fabricated progress number.

import Link from "next/link";
import { ACADEMY_LEVELS } from "@/lib/academyData";

export default function AcademyProgressCard({ progress }) {
  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">OmniFin Academy</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-white">Curriculum Progress</h3>
        </div>
        <p className="shrink-0 text-xs text-slate-400">
          {progress.hydrated ? `${progress.overallPercent}% overall` : "—"}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {ACADEMY_LEVELS.map((level) => {
          const unlocked = progress.hydrated ? progress.isLevelUnlocked(level.id) : level.order === 1;
          const mastered = progress.hydrated ? progress.isLevelMastered(level.id) : false;
          const percent = progress.hydrated ? progress.getLevelProgressPercent(level.id) : 0;
          return (
            <div key={level.id}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${unlocked ? "text-slate-200" : "text-slate-500"}`}>
                  Level {level.order} — {level.title}
                </span>
                <span className="text-slate-500">
                  {mastered ? "✓ Mastered" : !unlocked ? "Locked 🔒" : `${percent}%`}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full ${mastered ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${unlocked ? percent : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Continue in Academy →
        </Link>
      </div>
    </div>
  );
}
