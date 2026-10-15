"use client";

// components/market-analysis/AutomatedVideoInsights.jsx
//
// Compact card grid of generated video-insight posts (see
// lib/youtubeAutomation.js's getYoutubeAutomationFeed()). Redesigned
// from a text-wall card (paragraph summary + bullet list + up to 4
// provenance badges, always visible) into a scannable tile: channel +
// time, a 2-line title, and 2-3 derived signal pills — clicking the
// tile opens VideoInsightDrawer with the full breakdown, embedded
// player, and the honest provenance disclosure that used to live on
// the card itself.
//
// Now a client component (it owns which card's drawer is open), but
// still just takes the same `posts` prop both app/market-analysis/
// page.jsx and app/ai-news/page.jsx already pass in — no prop-shape
// change for either caller.

import { useState } from "react";
import { computeKeywordSentiment } from "@/lib/sentimentKeywords";
import { classifyTopic } from "@/lib/topicTags";
import VideoInsightDrawer from "./VideoInsightDrawer";

const TOPIC_PILL = {
  Forex: { icon: "💱", label: "Forex" },
  Crypto: { icon: "₿", label: "Crypto" },
  "Metals & Commodities": { icon: "🪙", label: "Metals" },
  Macro: { icon: "📊", label: "Macro" },
};

const BIAS_PILL = {
  Bullish: { icon: "🟢", label: "Bullish Bias", className: "bg-emerald-50 text-emerald-700" },
  Bearish: { icon: "🔴", label: "Bearish Bias", className: "bg-rose-50 text-rose-700" },
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

function VideoInsightCard({ post, onOpen }) {
  // The analysis text itself (headline + body) is scanned with the same
  // deterministic keyword sentiment used for news headlines — these
  // generated posts have no separate numeric score to read instead.
  const bias = BIAS_PILL[computeKeywordSentiment(post.title, post.body)];
  const levelText = extractLevelPill(post.keyLevels);
  const topic = TOPIC_PILL[classifyTopic(`${post.title} ${post.body}`)];

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-400">
        <span className="truncate">{post.sourceLabel}</span>
        {post.publishedAt && <span className="shrink-0 font-mono">{timeAgo(post.publishedAt)}</span>}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
        {post.title}
      </h3>

      <div className="mt-3 flex flex-1 flex-wrap items-start gap-1.5">
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
        {topic && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            <span aria-hidden="true">{topic.icon}</span>
            {topic.label}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpen(post)}
        className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
      >
        <span aria-hidden="true">▶</span> Watch &amp; Read Analysis
      </button>
    </article>
  );
}

export default function AutomatedVideoInsights({ posts }) {
  const items = Array.isArray(posts) ? posts : [];
  const [openPost, setOpenPost] = useState(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No video insights available right now — please check back shortly.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <VideoInsightCard key={post.id} post={post} onOpen={setOpenPost} />
        ))}
      </div>
      <VideoInsightDrawer post={openPost} onClose={() => setOpenPost(null)} />
    </>
  );
}
