"use client";

// components/market-analysis/AutomatedVideoInsights.jsx
//
// Compact card grid of generated video-insight posts (see
// lib/youtubeAutomation.js's getYoutubeAutomationFeed()). Each card:
// channel + topic + time header, a 2-line title, and exactly 2 signal
// pills (Bullish/Bearish bias + a real extracted price level, when one
// exists) — everything else (the full AI breakdown, every key level,
// the honest provenance disclosure) lives one click away in
// VideoInsightDrawer, not on the tile.
//
// The grid itself caps to MAX_DEFAULT_VISIBLE cards with a "View all"
// expand (no refetch — the full list is already in `posts`), and a
// Compact/Comfortable density toggle, so a long filtered result never
// reads as a 15+ card wall by default.

import { useEffect, useState } from "react";
import { computeKeywordSentiment } from "@/lib/sentimentKeywords";
import { classifyTopic } from "@/lib/topicTags";
import VideoInsightDrawer from "./VideoInsightDrawer";

const MAX_DEFAULT_VISIBLE = 6;

const SHORT_TOPIC = {
  Forex: "Forex",
  Crypto: "Crypto",
  "Metals & Commodities": "Metals",
  Macro: "Macro",
};

const BIAS_PILL = {
  Bullish: { icon: "🟢", label: "Bullish", className: "bg-emerald-50 text-emerald-700" },
  Bearish: { icon: "🔴", label: "Bearish", className: "bg-rose-50 text-rose-700" },
  Neutral: { icon: "⚪", label: "Neutral", className: "bg-slate-100 text-slate-500" },
};

// A video's own keyLevels array sometimes holds an honest disclaimer
// line instead of a real level ("Key levels not available…", "This
// video was outside the 6-video AI batch cap…", "Configure
// GEMINI_API_KEY…") — see lib/youtubeAutomation.js's
// templatedExtraction(). Those must never be mistaken for an actual
// price level pill.
const PLACEHOLDER_LEVEL_PATTERNS = [
  /^key levels not available/i,
  /^this video was outside/i,
  /^configure gemini/i,
];

function extractLevelPill(keyLevels) {
  if (!Array.isArray(keyLevels)) return null;
  for (const line of keyLevels) {
    if (typeof line !== "string") continue;
    if (PLACEHOLDER_LEVEL_PATTERNS.some((re) => re.test(line))) continue;
    const match = line.match(/\$[\d,]+(?:\.\d+)?/);
    if (match) return match[0];
  }
  return null;
}

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

function VideoInsightCard({ post, onOpen, compact }) {
  // The analysis text itself (headline + body) is scanned with the same
  // deterministic keyword sentiment used for news headlines — these
  // generated posts have no separate numeric score to read instead.
  const bias = BIAS_PILL[computeKeywordSentiment(post.title, post.body)];
  const levelText = extractLevelPill(post.keyLevels);
  const topicLabel = SHORT_TOPIC[classifyTopic(`${post.title} ${post.body}`)];

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-400">
        <span className="truncate">
          {post.sourceLabel}
          {topicLabel && <span className="text-slate-300"> · {topicLabel}</span>}
        </span>
        {post.publishedAt && <span className="shrink-0 font-mono">{timeAgo(post.publishedAt)}</span>}
      </div>

      <h3
        className={`mt-2 font-semibold leading-snug text-slate-900 ${
          compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-sm"
        }`}
      >
        {post.title}
      </h3>

      <div className={`flex flex-1 flex-wrap items-start gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${bias.className}`}>
          <span aria-hidden="true">{bias.icon}</span>
          {bias.label}
        </span>
        {levelText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
            <span aria-hidden="true">🎯</span>
            <span className="font-mono tracking-tight">{levelText}</span>
          </span>
        )}
      </div>

      {!compact && (
        <button
          type="button"
          onClick={() => onOpen(post)}
          className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
        >
          <span aria-hidden="true">▶</span> Watch &amp; Read Analysis
        </button>
      )}
      {compact && (
        <button
          type="button"
          onClick={() => onOpen(post)}
          className="mt-2.5 inline-flex items-center gap-1 self-start text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <span aria-hidden="true">▶</span> Watch &amp; Read
        </button>
      )}
    </article>
  );
}

function DensityToggle({ compact, onChange }) {
  return (
    <div
      className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold"
      role="tablist"
      aria-label="Card density"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!compact}
        onClick={() => onChange(false)}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          !compact ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Comfortable
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={compact}
        onClick={() => onChange(true)}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          compact ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Compact
      </button>
    </div>
  );
}

export default function AutomatedVideoInsights({ posts }) {
  const items = Array.isArray(posts) ? posts : [];
  const [openPost, setOpenPost] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);

  // A filtered list (fewer items) should start collapsed again, rather
  // than silently staying "expanded" from a previous, longer list.
  useEffect(() => {
    setExpanded(false);
  }, [items]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No video insights available right now — please check back shortly.
      </p>
    );
  }

  const visible = expanded ? items : items.slice(0, MAX_DEFAULT_VISIBLE);
  const hasMore = items.length > MAX_DEFAULT_VISIBLE;

  return (
    <>
      {hasMore && (
        <div className="mb-3 flex items-center justify-end">
          <DensityToggle compact={compact} onChange={setCompact} />
        </div>
      )}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
          compact ? "gap-2.5" : "gap-3.5"
        }`}
      >
        {visible.map((post) => (
          <VideoInsightCard key={post.id} post={post} onOpen={setOpenPost} compact={compact} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            {expanded ? "Show less" : `View all ${items.length} videos`}
          </button>
        </div>
      )}

      <VideoInsightDrawer post={openPost} onClose={() => setOpenPost(null)} />
    </>
  );
}
