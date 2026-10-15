"use client";

// components/market-analysis/VideoInsightDrawer.jsx
//
// The slide-over detail panel opened by a compact video card (see
// AutomatedVideoInsights.jsx). Everything long-form that used to sit
// directly on the card — the full AI-written breakdown, every key
// level, every fundamental/"market impact" point, and the honest
// provenance disclosure (AI vs. template, real transcript vs.
// metadata, mock vs. real video) — lives in here instead, one click
// away rather than cluttering the card grid.
//
// Embeds the real YouTube player when a real (non-mock) video ID can
// be parsed out of `post.sourceVideoUrl`; mock sample videos (no live
// YOUTUBE_API_KEY configured) have no real video to embed, so this
// shows a plain "sample video" notice and a link to the channel
// instead of faking a player.

import { useEffect, useRef } from "react";

function extractYoutubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.replace("/", "") || null;
  } catch {
    return null;
  }
  return null;
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VideoInsightDrawer({ post, onClose }) {
  const closeButtonRef = useRef(null);

  // ESC to dismiss, and move focus to the close button on open so
  // keyboard users land somewhere sensible inside the panel.
  useEffect(() => {
    if (!post) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [post, onClose]);

  if (!post) return null;

  const videoId = post.isMock ? null : extractYoutubeVideoId(post.sourceVideoUrl);
  const paragraphs = (post.body || "").split("\n\n").filter(Boolean);
  const realKeyLevels = Array.isArray(post.keyLevels) ? post.keyLevels : [];
  const impactPoints = Array.isArray(post.fundamentalInsights) ? post.fundamentalInsights : [];

  const provenanceLabel = post.isMock
    ? "Sample video — no live YOUTUBE_API_KEY is configured, so this is a deterministic sample, not a real upload."
    : post.aiProvider === "gemini"
    ? "Written by the Gemini API from this video's real caption transcript or, if no captions were available, its title/description."
    : post.aiProvider === "claude"
    ? "Written by the Claude API from this video's real caption transcript or, if no captions were available, its title/description."
    : post.aiSkippedForQuota
    ? "Template summary — this video was outside this run's AI batch cap (Gemini's free-tier rate limit), not a failed AI call. It will get a real AI breakdown on a later run."
    : "Template summary — no AI provider is configured, or the AI call didn't succeed for this video.";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={post.title}>
      {/* Backdrop — click to dismiss */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl sm:max-w-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-400">{post.sourceLabel}</p>
            <h2 className="mt-0.5 text-base font-bold leading-snug text-slate-900">{post.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close analysis panel"
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {videoId ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={post.sourceVideoTitle || post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={post.sourceVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-900 text-slate-300 transition-colors hover:text-white"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10 9L15 12L10 15V9Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12A9 9 0 113 12A9 9 0 0121 12Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium">
                {post.isMock ? "Sample video — open the channel instead" : "Open on YouTube"}
              </span>
            </a>
          )}

          {realKeyLevels.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Key levels
              </h3>
              <ul className="mt-2 space-y-1.5">
                {realKeyLevels.map((level, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span aria-hidden="true">🎯</span>
                    <span className="font-mono text-[13px] leading-relaxed tracking-tight">
                      {level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {paragraphs.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                AI breakdown
              </h3>
              <div className="mt-2 space-y-3">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-slate-700">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}

          {impactPoints.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Market impact
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-700">
                {impactPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <svg
              width="14"
              height="14"
              className="mt-0.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{provenanceLabel}</span>
          </div>

          <a
            href={post.sourceVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Watch full video on YouTube
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H9M17 7V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
