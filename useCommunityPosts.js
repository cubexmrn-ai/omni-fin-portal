"use client";

// hooks/useCommunityPosts.js
//
// localStorage-backed hook for the Community Forum (components/community/*).
// Follows the same SSR-safe hydration pattern as hooks/useAcademyProgress.js:
// state starts at a safe empty default on the server, is hydrated from
// localStorage only after mount (so server-rendered HTML never depends on
// browser storage), and every localStorage access is wrapped in try/catch.
//
// WHY VOTES/BULLSEYE ARE STORED AS *STATE*, NOT ACCUMULATED COUNTS:
// Each seed post already has a baseUpvotes/baseDownvotes/baseBullseyeCount
// (lib/communityData.js). If we persisted "the new total" every time a
// button was clicked, re-opening the page and clicking again would keep
// adding +1 forever — the same browser could inflate a post's count
// without limit just by revisiting. Instead this hook stores only the
// *current browser's own* choice per post:
//   voteState[postId]     -> "up" | "down" | undefined
//   bullseyeState[postId] -> true | undefined
// The displayed count (see getDisplayCounts below) is always computed as
// base + (this browser's current state), so clicking the same button
// twice toggles it off instead of double-counting, and a page reload
// shows the same count it showed before, not an incremented one.

import { useCallback, useEffect, useState } from "react";
import { SEED_POSTS } from "@/lib/communityData";

const STORAGE_KEY = "omnifin.community.v1";

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort only (private browsing, storage quota, etc.) — the UI
    // still works for the current render, it just won't persist.
  }
}

function emptyState() {
  return {
    userPosts: [], // posts this browser has submitted via CreatePostModal
    voteState: {}, // { [postId]: "up" | "down" }
    bullseyeState: {}, // { [postId]: true }
  };
}

export function useCommunityPosts() {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setState({
        userPosts: Array.isArray(stored.userPosts) ? stored.userPosts : [],
        voteState:
          stored.voteState && typeof stored.voteState === "object"
            ? stored.voteState
            : {},
        bullseyeState:
          stored.bullseyeState && typeof stored.bullseyeState === "object"
            ? stored.bullseyeState
            : {},
      });
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after hydration — otherwise the
  // very first render (before we've read storage) would overwrite
  // whatever was already saved with the empty default.
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(state);
  }, [state, hydrated]);

  const addPost = useCallback((post) => {
    const newPost = {
      ...post,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      baseUpvotes: 0,
      baseDownvotes: 0,
      baseBullseyeCount: 0,
      isUserSubmitted: true,
    };
    setState((prev) => ({
      ...prev,
      userPosts: [newPost, ...prev.userPosts],
    }));
    return newPost;
  }, []);

  const setVote = useCallback((postId, direction) => {
    // direction is "up" | "down"; clicking the same direction again
    // clears the vote (toggle off) instead of re-applying it.
    setState((prev) => {
      const current = prev.voteState[postId];
      const next = { ...prev.voteState };
      if (current === direction) {
        delete next[postId];
      } else {
        next[postId] = direction;
      }
      return { ...prev, voteState: next };
    });
  }, []);

  const toggleBullseye = useCallback((postId) => {
    setState((prev) => {
      const next = { ...prev.bullseyeState };
      if (next[postId]) {
        delete next[postId];
      } else {
        next[postId] = true;
      }
      return { ...prev, bullseyeState: next };
    });
  }, []);

  // All posts = this browser's own submissions (newest first) + the seed
  // set, so a freshly-submitted idea appears at the top of the feed
  // immediately (the "in-memory/local storage submission fallback" the
  // spec asked for) without needing any backend.
  const allPosts = [...state.userPosts, ...SEED_POSTS];

  const getDisplayCounts = useCallback(
    (post) => {
      const vote = state.voteState[post.id];
      const bullseye = Boolean(state.bullseyeState[post.id]);
      return {
        upvotes: post.baseUpvotes + (vote === "up" ? 1 : 0),
        downvotes: post.baseDownvotes + (vote === "down" ? 1 : 0),
        bullseyeCount: post.baseBullseyeCount + (bullseye ? 1 : 0),
        myVote: vote || null,
        myBullseye: bullseye,
      };
    },
    [state.voteState, state.bullseyeState]
  );

  return {
    hydrated,
    allPosts,
    addPost,
    setVote,
    toggleBullseye,
    getDisplayCounts,
  };
}
