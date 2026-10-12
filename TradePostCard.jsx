"use client";

// components/community/TradePostCard.jsx
//
// One trade-setup / discussion post in the Community Forum feed.
// Renders: avatar + handle + relative time badge + asset tag(s),
// a Long/Short direction badge with Entry/Target/Stop Loss (for posts
// that have them), an illustrative chart-preview placeholder with an
// "Expand Setup" modal, and Upvote/Downvote/Bullseye counters wired to
// hooks/useCommunityPosts.js.
//
// HONESTY NOTE: there is no real uploaded chart image anywhere in this
// app, so the "preview" below is an explicitly-labeled illustrative
// placeholder (a deterministic, seeded squiggle — same post always
// renders the same squiggle, so it doesn't flicker on every re-render,
// but it is never presented as a real chart). This mirrors the
// project's established no-fabrication convention (see the Social Buzz
// Tracker's persistent "Simulated" badge and the Market Analysis page's
// "illustrative, not a real detected swing" labels).

import { useMemo, useState } from "react";
import Modal from "@/components/community/Modal";
import { getAssetTag, getCategory } from "@/lib/communityData";

// Small local seeded-hash utility (deliberately duplicated rather than
// imported from lib/socialBuzz.js, whose hashString/mulberry32 helpers
// are not exported — see that file). Deterministic string -> [0,1).
function hashToUnit(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  // Scale into [0, 1)
  return (h % 100000) / 100000;
}

const AVATAR_PALETTE = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-cyan-100 text-cyan-700",
];

function getAvatarStyle(handle) {
  const idx = Math.floor(hashToUnit(handle) * AVATAR_PALETTE.length);
  return AVATAR_PALETTE[Math.min(idx, AVATAR_PALETTE.length - 1)];
}

function getInitials(handle) {
  const clean = handle.replace(/^@/, "");
  const parts = clean.split(/[_\-\s]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatRelativeTime(isoString) {
  const then = new Date(isoString).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  return `${diffMonth}mo ago`;
}

// Deterministic illustrative "chart" squiggle — an SVG polyline whose
// points are derived from a seeded hash of the post id, so it's stable
// across re-renders but is NOT a real price chart.
function buildIllustrativePoints(seed, bias) {
  const points = [];
  const pointCount = 24;
  let y = 50;
  const drift = bias === "long" ? -0.6 : bias === "short" ? 0.6 : 0;
  for (let i = 0; i < pointCount; i++) {
    const n = hashToUnit(`${seed}-${i}`);
    const step = (n - 0.5) * 18 + drift * 2;
    y = Math.max(8, Math.min(92, y + step));
    const x = (i / (pointCount - 1)) * 100;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function DirectionBadge({ bias }) {
  if (bias === "long") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        ▲ Long / Bullish
      </span>
    );
  }
  if (bias === "short") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
        ▼ Short / Bearish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Discussion
    </span>
  );
}

function TradeParams({ entry, stopLoss, takeProfit }) {
  if (entry == null && stopLoss == null && takeProfit == null) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Entry
        </div>
        <div className="mt-0.5 text-sm font-semibold text-slate-800">
          {entry != null ? entry : "—"}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Target
        </div>
        <div className="mt-0.5 text-sm font-semibold text-emerald-600">
          {takeProfit != null ? takeProfit : "—"}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Stop Loss
        </div>
        <div className="mt-0.5 text-sm font-semibold text-rose-600">
          {stopLoss != null ? stopLoss : "—"}
        </div>
      </div>
    </div>
  );
}

function ChartPreview({ post, large }) {
  const points = useMemo(
    () => buildIllustrativePoints(post.id, post.bias),
    [post.id, post.bias]
  );
  const strokeColor =
    post.bias === "long"
      ? "#10b981"
      : post.bias === "short"
      ? "#f43f5e"
      : "#94a3b8";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 ${
        large ? "h-56" : "h-28"
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute bottom-1.5 right-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
        Illustrative only — not a real chart
      </span>
    </div>
  );
}

export default function TradePostCard({ post, counts, onVote, onToggleBullseye }) {
  const [expanded, setExpanded] = useState(false);
  const category = getCategory(post.category);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarStyle(
            post.authorHandle
          )}`}
          aria-hidden="true"
        >
          {getInitials(post.authorHandle)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {post.authorHandle}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600">
                {category.label}
              </span>
            )}
            {post.assetTags.map((tagId) => {
              const tag = getAssetTag(tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                >
                  {tag.hashtag}
                </span>
              );
            })}
            {post.isUserSubmitted && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Your post
              </span>
            )}
          </div>
        </div>
        <DirectionBadge bias={post.bias} />
      </div>

      <h3 className="mt-3 text-base font-bold text-slate-900">
        {post.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {post.body}
      </p>

      <TradeParams
        entry={post.entry}
        stopLoss={post.stopLoss}
        takeProfit={post.takeProfit}
      />

      <div className="mt-3">
        <ChartPreview post={post} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onVote(post.id, "up")}
            aria-pressed={counts.myVote === "up"}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              counts.myVote === "up"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
            }`}
          >
            ▲ {counts.upvotes}
          </button>
          <button
            type="button"
            onClick={() => onVote(post.id, "down")}
            aria-pressed={counts.myVote === "down"}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              counts.myVote === "down"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600"
            }`}
          >
            ▼ {counts.downvotes}
          </button>
          <button
            type="button"
            onClick={() => onToggleBullseye(post.id)}
            aria-pressed={counts.myBullseye}
            title="Tag this as a &apos;Bullseye Setup&apos; — a community call-out for a setup that played out well"
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              counts.myBullseye
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600"
            }`}
          >
            🎯 {counts.bullseyeCount}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          Expand Setup →
        </button>
      </div>

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={post.title}
        widthClassName="max-w-xl"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {post.authorHandle}
          </span>
          <span>·</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>
        <div className="mt-2">
          <DirectionBadge bias={post.bias} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {post.body}
        </p>
        <TradeParams
          entry={post.entry}
          stopLoss={post.stopLoss}
          takeProfit={post.takeProfit}
        />
        <div className="mt-3">
          <ChartPreview post={post} large />
        </div>
      </Modal>
    </article>
  );
}
