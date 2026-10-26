"use client";

// components/community/CommentsThread.jsx
//
// Minimal comment thread for a Community post's expanded view
// (TradePostCard.jsx) — new in this pass, cloud-only (no feature or
// localStorage fallback existed to preserve; see
// hooks/useCommunityPosts.js's header comment). Only mounted at all
// when Supabase is configured for this deployment — on an
// unconfigured deployment this component simply isn't rendered, so
// there's no half-working comment box to disclose around.
//
// Reading comments needs no sign-in (public community discussion).
// Posting one used to require it too — Oct 2026: a guest can now
// comment with just their display handle
// (hooks/useGuestIdentity.js), via addComment()'s server-route guest
// path (app/api/community/comments, lib/communityStore.js). Signing in
// (AuthModal) stays available as a separate, optional upgrade — never
// required just to reply.

import { useEffect, useState } from "react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthModal from "@/components/auth/AuthModal";

function formatRelativeTime(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function CommentsThread({ postId }) {
  const { user } = useSupabaseAuth();
  const { fetchComments, addComment } = useCommunityPosts();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchComments(postId).then((data) => {
      if (!cancelled) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [postId, fetchComments]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    setSubmitting(true);
    setError("");
    const { error: submitError, comment } = await addComment(postId, draft.trim());
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }
    setComments((prev) => [...prev, { ...comment, id: `local-${Date.now()}` }]);
    setDraft("");
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <p className="text-xs font-semibold text-slate-700">
        Comments {comments.length > 0 && `(${comments.length})`}
      </p>

      {loading ? (
        <p className="mt-2 text-xs text-slate-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">No comments yet — be the first to reply.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">{c.authorHandle}</span>
                <span>·</span>
                <span>{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          Post
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {!user && (
        <p className="mt-1 text-[11px] text-slate-400">
          Commenting as a guest.{" "}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Sign in
          </button>{" "}
          to tie your comments to an account.
        </p>
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
