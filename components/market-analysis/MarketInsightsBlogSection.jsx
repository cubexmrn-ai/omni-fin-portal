"use client";

// components/market-analysis/MarketInsightsBlogSection.jsx
//
// "Market Insights & Economic Summaries" — the public-facing half of
// the YouTube-to-Financial-Blog pipeline (see lib/youtubeBlogPipeline.js
// and app/admin/youtube-importer/page.jsx for the admin side). Renders
// 4-6 clean cards for the most recently published articles, each
// opening a full-article reading drawer on click.
//
// `posts` is passed down from app/market-analysis/page.jsx, already
// fetched server-side via getPublishedBlogPosts() — this component
// never fetches on its own, so the full article Markdown is already
// in hand for the drawer with no second round-trip needed.
//
// MARKDOWN RENDERING: no markdown library dependency — this project
// generally prefers dependency-free code where the actual need is
// small (see e.g. the calculators), and the Gemini prompt in
// lib/youtubeBlogPipeline.js constrains the output to a small known
// subset (##/### headings, **bold**, "- " bullet lists, plain
// paragraphs). renderMarkdownLite() below handles exactly that subset
// as real React elements (never dangerouslySetInnerHTML — this is
// AI-generated content served to every visitor, so it's rendered as
// text/elements, not raw HTML).

import { useState } from "react";

function renderInlineBold(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{part}</strong> : <span key={`${keyPrefix}-t${i}`}>{part}</span>
  );
}

function renderMarkdownLite(markdown) {
  if (!markdown) return null;
  const lines = markdown.split("\n");
  const blocks = [];
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="ml-5 list-disc space-y-1">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInlineBold(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3 key={idx} className="mt-5 text-base font-bold text-slate-900">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2 key={idx} className="mt-6 text-lg font-bold text-slate-900">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.slice(2));
    } else {
      flushList();
      blocks.push(
        <p key={idx} className="mt-3 text-sm leading-relaxed text-slate-700">
          {renderInlineBold(line, `p-${idx}`)}
        </p>
      );
    }
  });
  flushList();

  return blocks;
}

const TAG_STYLES = "inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700";

function BlogCard({ post, onOpen }) {
  const excerptLines = (post.excerpt || "").split("\n").filter(Boolean).slice(0, 4);
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {post.thumbnail_url ? (
          // Real video thumbnail from the source video's own oEmbed
          // metadata — not a generated/stock image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs font-semibold text-slate-400">
            Market Insight
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {(post.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className={TAG_STYLES}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-sm font-bold leading-snug text-slate-900">{post.blog_title}</h3>
        <div className="text-xs leading-relaxed text-slate-500">
          {excerptLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <p className="mt-auto pt-2 text-[11px] text-slate-400">{post.source_credit}</p>
      </div>
    </button>
  );
}

function ArticleDrawer({ post, onClose }) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" role="dialog" aria-modal="true">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap gap-1.5">
            {(post.tags || []).map((tag) => (
              <span key={tag} className={TAG_STYLES}>
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6">
          <h2 className="text-xl font-extrabold leading-tight text-slate-900">{post.blog_title}</h2>
          <p className="mt-2 text-xs font-medium text-slate-400">{post.source_credit}</p>
          <div className="mt-4">{renderMarkdownLite(post.article_markdown)}</div>
        </div>
      </div>
    </div>
  );
}

export default function MarketInsightsBlogSection({ posts }) {
  const [activePost, setActivePost] = useState(null);

  if (!Array.isArray(posts) || posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-sm font-bold text-slate-900">Market Insights &amp; Economic Summaries</h2>
      <p className="mt-1 text-sm text-slate-500">
        Layman-friendly takeaways distilled from real finance YouTube videos — tap a card to read the
        full article.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 6).map((post) => (
          <BlogCard key={post.id} post={post} onOpen={setActivePost} />
        ))}
      </div>

      <ArticleDrawer post={activePost} onClose={() => setActivePost(null)} />
    </section>
  );
}
