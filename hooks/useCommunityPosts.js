"use client";

// hooks/useCommunityPosts.js
//
// Community Forum data — now with real cross-device/cross-user cloud
// persistence for posts and comments.
//
// RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit's
// structural roadmap item: "give the Community Forum a real backend +
// accounts"): this hook used to be a single-player simulation of
// lib/communityData.js's seed data — every "new" post only ever
// existed in the posting browser's own localStorage, so no two
// visitors ever actually saw each other's posts. When Supabase is
// configured AND the person is signed in
// (hooks/useSupabaseAuth.js), new posts now go to the real
// `community_posts` table (see SUPABASE_SETUP.md), so every signed-in
// visitor sees the same feed. Guests (not signed in), or any
// deployment without Supabase configured, keep the exact same
// localStorage-only behavior this hook always had — a guest can still
// read everything (seed posts + whatever real cloud posts exist), just
// can't publish one until they sign in.
//
// SCOPE NOTE — votes/Bullseye stay per-browser, on purpose: migrating
// those to a real per-user ledger needs a dedicated table with a
// unique (post_id, user_id) constraint to stop one account voting
// twice, which is a bigger schema than this pass's budget covers.
// They're left exactly as they were (base count + this browser's own
// toggle), which was already honestly scoped as "this browser's own
// choice," not a claim of being a tallied global vote.
//
// Comments are new in this pass: minimal cloud-only — read-only count/
// list when Supabase is configured (any visitor, including guests, can
// read other people's comments), write requires sign-in. No comments
// feature existed before this file, so there's no local-storage
// fallback to preserve for them; see fetchComments/addComment below.

import { useCallback, useEffect, useState } from "react";
import { SEED_POSTS } from "@/lib/communityData";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const STORAGE_KEY = "omnifin.community.v1";
const POSTS_TABLE = "community_posts";
const COMMENTS_TABLE = "community_comments";

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
    userPosts: [], // posts this browser has submitted while a guest (never synced)
    voteState: {}, // { [postId]: "up" | "down" } — this browser's own choice, see SCOPE NOTE above
    bullseyeState: {}, // { [postId]: true }
  };
}

function fromRow(row) {
  return {
    id: row.id,
    authorHandle: row.author_handle,
    category: row.category,
    assetTags: row.asset_tags || [],
    title: row.title,
    body: row.body,
    bias: row.bias,
    entry: row.entry,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    createdAt: row.created_at,
    baseUpvotes: 0,
    baseDownvotes: 0,
    baseBullseyeCount: 0,
    isUserSubmitted: true,
    isCloudPost: true,
  };
}

function handleFromEmail(email) {
  return email ? `@${email.split("@")[0]}` : "@you";
}

export function useCommunityPosts() {
  const { user } = useSupabaseAuth();
  const cloudReady = isSupabaseConfigured();
  const cloudActive = cloudReady && Boolean(user);

  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [cloudPosts, setCloudPosts] = useState([]);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setState({
        userPosts: Array.isArray(stored.userPosts) ? stored.userPosts : [],
        voteState: stored.voteState && typeof stored.voteState === "object" ? stored.voteState : {},
        bullseyeState:
          stored.bullseyeState && typeof stored.bullseyeState === "object" ? stored.bullseyeState : {},
      });
    }
    setHydrated(true);
  }, []);

  // Persist local (guest) state on every change, but only after
  // hydration — otherwise the very first render (before we've read
  // storage) would overwrite whatever was already saved.
  useEffect(() => {
    if (!hydrated) return;
    writeStorage(state);
  }, [state, hydrated]);

  // Cloud posts are PUBLIC-READABLE — fetched whenever Supabase is
  // configured at all, regardless of sign-in state, so a guest still
  // sees everyone else's real posts, same as the seed set.
  useEffect(() => {
    if (!cloudReady) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from(POSTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setSyncError("Couldn't load community posts from the cloud right now.");
          return;
        }
        setCloudPosts((data || []).map(fromRow));
      });

    return () => {
      cancelled = true;
    };
  }, [cloudReady]);

  const addPost = useCallback(
    async (post) => {
      if (cloudActive) {
        const supabase = getSupabaseClient();
        const row = {
          id: `cloud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: user.id,
          author_handle: handleFromEmail(user.email),
          category: post.category,
          asset_tags: post.assetTags || [],
          title: post.title,
          body: post.body,
          bias: post.bias,
          entry: post.entry,
          stop_loss: post.stopLoss,
          take_profit: post.takeProfit,
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase?.from(POSTS_TABLE).insert(row) || {};
        if (error) {
          setSyncError("Couldn't publish to the cloud — try again shortly.");
          return null;
        }
        const newPost = fromRow(row);
        setCloudPosts((prev) => [newPost, ...prev]);
        return newPost;
      }

      // Guest fallback — identical to this hook's original behavior.
      const newPost = {
        ...post,
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        authorHandle: "@you",
        createdAt: new Date().toISOString(),
        baseUpvotes: 0,
        baseDownvotes: 0,
        baseBullseyeCount: 0,
        isUserSubmitted: true,
      };
      setState((prev) => ({ ...prev, userPosts: [newPost, ...prev.userPosts] }));
      return newPost;
    },
    [cloudActive, user]
  );

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

  // All posts = this browser's own guest submissions (if any) + real
  // cloud posts (if Supabase is configured) + the seed set — newest
  // first within each group, so a freshly-submitted post always leads.
  const allPosts = [...state.userPosts, ...cloudPosts, ...SEED_POSTS];

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

  /** Comments — cloud-only, public read, sign-in required to write. See header comment's SCOPE NOTE. */
  const fetchComments = useCallback(async (postId) => {
    if (!cloudReady) return [];
    const supabase = getSupabaseClient();
    const { data, error } = (await supabase
      ?.from(COMMENTS_TABLE)
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })) || {};
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      authorHandle: row.author_handle,
      body: row.body,
      createdAt: row.created_at,
    }));
  }, [cloudReady]);

  const addComment = useCallback(
    async (postId, body) => {
      if (!cloudActive) return { error: "Sign in to comment." };
      const supabase = getSupabaseClient();
      const row = {
        post_id: postId,
        user_id: user.id,
        author_handle: handleFromEmail(user.email),
        body,
        created_at: new Date().toISOString(),
      };
      const { error } = (await supabase?.from(COMMENTS_TABLE).insert(row)) || {};
      if (error) return { error: "Couldn't post your comment — try again shortly." };
      return { error: null, comment: row };
    },
    [cloudActive, user]
  );

  return {
    hydrated,
    allPosts,
    addPost,
    setVote,
    toggleBullseye,
    getDisplayCounts,
    fetchComments,
    addComment,
    // New — cloud sync status, additive to the existing API above so
    // every current call site keeps working unchanged.
    cloudReady,
    cloudActive,
    syncError,
  };
}
