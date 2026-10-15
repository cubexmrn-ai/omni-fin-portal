"use client";

import { useEffect, useState } from "react";

/**
 * Social Buzz Tracker — replaces the old "Social Sentiment — Coming
 * soon" placeholder on /ai-news. Fetches /api/social-buzz, backed by
 * lib/socialBuzz.js: real Reddit hot-post data per asset when
 * REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET are configured, falling back to
 * a deterministic simulation per-asset otherwise. There is still no
 * X/Twitter integration anywhere in this deployment, live or otherwise.
 *
 * UI CLEANUP PASS: the long explanatory paragraph ("Simulated — no
 * social data provider... deterministic mock, not real chatter") used
 * to sit under the heading as a permanent public banner. Removed from
 * the visible UI so this reads as clean/authoritative as the rest of
 * the terminal — but the disclosure isn't deleted, just moved from a
 * paragraph to a hover tooltip on the header badge and the disabled
 * toggle's own tooltip right below it. The header badge itself now
 * reflects reality live/partial/simulated instead of always reading
 * "Simulated" (see badgeTone/badgeLabel below), and each asset row gets
 * its own small live-vs-simulated tag so a partial-live response (some
 * subreddits reachable, others not) isn't misrepresented either way.
 */
export default function SocialBuzzTracker() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    fetch("/api/social-buzz", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        setData(body);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveCount = Number.isFinite(data?.liveCount) ? data.liveCount : 0;
  const totalCount = Number.isFinite(data?.totalCount) ? data.totalCount : 0;
  const isFullyLive = totalCount > 0 && liveCount === totalCount;
  const isPartiallyLive = liveCount > 0 && !isFullyLive;
  const badgeLabel = isFullyLive ? "Live (Reddit)" : isPartiallyLive ? "Partially live" : "Simulated";
  const badgeToneClass = isFullyLive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
    : isPartiallyLive
    ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
  const badgeDotClass = isFullyLive ? "bg-emerald-500" : isPartiallyLive ? "bg-sky-500" : "bg-amber-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Social Buzz Tracker</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeToneClass}`}
          title={
            data?.note ||
            "Simulated — no social data provider (X/Twitter, Reddit) is connected yet. These numbers are a deterministic mock, not real chatter."
          }
        >
          <span className={`h-1.5 w-1.5 rounded-full ${badgeDotClass}`} />
          {badgeLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="min-w-0 pr-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isFullyLive || isPartiallyLive ? "Live social API (Reddit)" : "Use live social API"}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isFullyLive
              ? "Reddit is connected and live for every tracked asset. No X/Twitter integration exists in this deployment."
              : isPartiallyLive
              ? `${liveCount} of ${totalCount} assets are live from Reddit right now; the rest are showing the simulated fallback.`
              : "No Reddit API credentials are configured — this stays simulated until REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET are set. No X/Twitter integration exists in this deployment either way."}
          </p>
        </div>
        <span
          title={
            isFullyLive || isPartiallyLive
              ? "Reddit credentials are configured in this deployment."
              : "Configure REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET (see lib/socialBuzz.js) to enable this."
          }
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full ${
            isFullyLive || isPartiallyLive ? "bg-emerald-400" : "bg-slate-300 opacity-70 dark:bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              isFullyLive || isPartiallyLive ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </span>
      </div>

      <div className="mt-4">
        {status === "loading" && (
          <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Loading simulated buzz data…
          </p>
        )}

        {status === "error" && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            Couldn&apos;t load the Social Buzz Tracker right now.
          </p>
        )}

        {/* AUDIT FIX (Phase 3): the route's own catch-all error branch
            returns `assets: []` with a 200 status (see
            app/api/social-buzz/route.js) rather than throwing — without
            this, that case used to render as a silent blank gap below
            the header instead of an explained empty state. */}
        {status === "ready" && Array.isArray(data?.assets) && data.assets.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            {data?.note || "No buzz data available right now — try refreshing the page."}
          </p>
        )}

        {status === "ready" && Array.isArray(data?.assets) && data.assets.length > 0 && (
          <div className="space-y-3">
            {data.assets.map((asset) => (
              <div key={asset.asset}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                    {asset.label}
                    {/* AUDIT FIX (Phase 2): per-asset live/simulated tag — a
                        partially-live response must not read as either
                        fully live or fully simulated. */}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        asset.source === "reddit"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                      }`}
                      title={
                        asset.source === "reddit"
                          ? `Live — derived from r/${asset.subreddit}'s current hot posts (${asset.postsSampled} sampled).`
                          : "Simulated — not pulled from a real provider right now."
                      }
                    >
                      {asset.source === "reddit" ? "Live" : "Sim"}
                    </span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    Buzz {asset.buzzIntensity}/100 · X {asset.platforms.x ?? "—"} · Reddit{" "}
                    {asset.platforms.reddit}
                  </span>
                </div>
                <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${asset.sentiment.bullishPct}%` }}
                    title={`Bullish ${asset.sentiment.bullishPct}%`}
                  />
                  <div
                    className="h-full bg-slate-300 dark:bg-slate-500"
                    style={{ width: `${asset.sentiment.neutralPct}%` }}
                    title={`Neutral ${asset.sentiment.neutralPct}%`}
                  />
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${asset.sentiment.bearishPct}%` }}
                    title={`Bearish ${asset.sentiment.bearishPct}%`}
                  />
                </div>
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>Bullish {asset.sentiment.bullishPct}%</span>
                  <span>Neutral {asset.sentiment.neutralPct}%</span>
                  <span>Bearish {asset.sentiment.bearishPct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
