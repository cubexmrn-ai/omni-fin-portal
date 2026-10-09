"use client";

import { useEffect, useState } from "react";

/**
 * Social Buzz Tracker — replaces the old "Social Sentiment — Coming
 * soon" placeholder on /ai-news. Fetches /api/social-buzz, which is
 * ENTIRELY simulated data (see lib/socialBuzz.js) — no X/Twitter or
 * Reddit API is connected in this deployment. Every render keeps that
 * fact unmissable: a persistent "Simulated" badge, a disabled "Use
 * live social API" toggle with an explanatory tooltip, and the
 * backend's own note text surfaced verbatim, rather than silently
 * presenting these numbers as real chatter.
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Social Buzz Tracker</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Simulated
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        {data?.note ||
          "Simulated — no social data provider (X/Twitter, Reddit) is connected yet. These numbers are a deterministic mock, not real chatter."}
      </p>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="min-w-0 pr-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Use live social API
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            No X/Twitter or Reddit API key is configured — this stays off until one is connected.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="No live social-listening provider is connected in this deployment yet. Configure a SOCIAL_API_KEY and wire it up in lib/socialBuzz.js to enable this."
          aria-disabled="true"
          className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full bg-slate-300 opacity-70 dark:bg-slate-600"
        >
          <span className="inline-block h-3.5 w-3.5 translate-x-1 rounded-full bg-white shadow" />
        </button>
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

        {status === "ready" && Array.isArray(data?.assets) && (
          <div className="space-y-3">
            {data.assets.map((asset) => (
              <div key={asset.asset}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {asset.label}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    Buzz {asset.buzzIntensity}/100 · X {asset.platforms.x} · Reddit{" "}
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
