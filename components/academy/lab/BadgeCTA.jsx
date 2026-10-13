"use client";

// components/academy/lab/BadgeCTA.jsx
//
// "Claim Risk Manager Badge" CTA for the Demo Trading Lab. Unlocks
// once the person's trade history (hooks/useDemoTrading.js) shows 3
// profitable trades that were opened with a Stop Loss set — rewarding
// the habit of risk management, not just being profitable. Purely a
// local-account badge (no server/account system behind this project),
// stored the same way as the rest of the Lab's state — localStorage,
// client-side only.

export default function BadgeCTA({ progress, claimed, onClaim }) {
  if (claimed) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <span className="text-2xl" aria-hidden="true">
          🏅
        </span>
        <div>
          <p className="text-sm font-bold text-amber-800">Risk Manager Badge earned</p>
          <p className="text-xs text-amber-700">
            Closed 3 profitable trades using a Stop Loss — a core risk-management habit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">🏅 Risk Manager Badge</p>
          <p className="mt-1 text-xs text-slate-500">
            Close {progress.target} profitable trades that used a Stop Loss to unlock this badge.
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-slate-400">
          {progress.count} / {progress.target}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-amber-500 transition-all"
          style={{ width: `${(progress.count / progress.target) * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={!progress.eligible}
        className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {progress.eligible ? "Claim Risk Manager Badge" : "Keep trading with SL set to unlock"}
      </button>
    </div>
  );
}
