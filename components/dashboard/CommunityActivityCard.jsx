"use client";

// components/dashboard/CommunityActivityCard.jsx
//
// "Community Activity" snapshot for the Dashboard: how many trade
// setups and sentiment votes THIS browser has actually posted/cast in
// the Trader Community & Setup Hub (/community), reading the exact
// same localStorage-backed hooks that page uses — hooks/useTradeSetups.js
// and hooks/useSentimentVotes.js — plus one simple, genuinely-computed
// "Active Contributor" badge.
//
// HONESTY NOTE: there's no account system in this project, so "Active
// Contributor" isn't a server-awarded badge — it's a client-side
// threshold (setups shared + votes cast >= ACTIVE_CONTRIBUTOR_TARGET)
// computed from real local counts, same convention as the Demo Trading
// Lab's Risk Manager badge. It unlocks automatically; there's nothing
// to fabricate or claim.

import Link from "next/link";

const ACTIVE_CONTRIBUTOR_TARGET = 3;

function ActivityStat({ label, value, href }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 text-center transition-colors hover:border-blue-500/40 hover:bg-slate-800/70"
    >
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </Link>
  );
}

export default function CommunityActivityCard({ setupsShared, votesCast, hydrated }) {
  const activityTotal = setupsShared + votesCast;
  const contributorEarned = activityTotal >= ACTIVE_CONTRIBUTOR_TARGET;

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Trader Community & Setup Hub
      </p>
      <h3 className="mt-0.5 text-lg font-extrabold text-white">Community Activity</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ActivityStat
          label="Setups Shared"
          value={hydrated ? setupsShared : "—"}
          href="/community?view=mine#setup-board"
        />
        <ActivityStat
          label="Sentiment Votes Cast"
          value={hydrated ? votesCast : "—"}
          href="/community#sentiment-gauge"
        />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Community Badges
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
              contributorEarned
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-slate-700 bg-slate-800/60 text-slate-500"
            }`}
            title={
              contributorEarned
                ? "Earned: 3+ setups shared and/or sentiment votes cast"
                : `${activityTotal}/${ACTIVE_CONTRIBUTOR_TARGET} setups + votes toward this badge`
            }
          >
            🏆 Active Contributor
          </span>
          {!contributorEarned && hydrated && (
            <span className="text-[11px] text-slate-500">
              {activityTotal}/{ACTIVE_CONTRIBUTOR_TARGET}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Open Community Hub →
        </Link>
      </div>
    </div>
  );
}
