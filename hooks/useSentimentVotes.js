"use client";

// hooks/useSentimentVotes.js
//
// localStorage-backed hook for the Live Community Sentiment Gauge
// (components/community/setup/SentimentGaugeSection.jsx). Same "base
// count + this browser's own current choice" pattern as
// hooks/useCommunityPosts.js's vote/Bullseye state:
//   voteState[assetCode] -> "bullish" | "bearish" | undefined
// The displayed tally is always SENTIMENT_SEED_BASE + (this browser's
// current vote), so casting a vote never double-counts on reload, and
// switching sides moves your one vote from one bucket to the other
// rather than adding to both.

import { useCallback, useEffect, useState } from "react";
import { SENTIMENT_SEED_BASE } from "@/lib/tradeSetupsData";

const STORAGE_KEY = "omnifin.community.sentiment.v1";

function readStorage() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(voteState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(voteState));
  } catch {
    // Best-effort only.
  }
}

export function useSentimentVotes() {
  const [voteState, setVoteState] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVoteState(readStorage());
    setHydrated(true);
  }, []);

  /** Casts (or clears, if clicking your current vote again) a
   * Bullish/Bearish vote for one instrument code. */
  const castVote = useCallback((assetCode, side) => {
    setVoteState((prev) => {
      const current = prev[assetCode];
      const next = { ...prev };
      if (current === side) {
        delete next[assetCode];
      } else {
        next[assetCode] = side;
      }
      writeStorage(next);
      return next;
    });
  }, []);

  const getCounts = useCallback(
    (assetCode) => {
      const base = SENTIMENT_SEED_BASE[assetCode] || { bullish: 0, bearish: 0 };
      const myVote = voteState[assetCode] || null;
      const bullish = base.bullish + (myVote === "bullish" ? 1 : 0);
      const bearish = base.bearish + (myVote === "bearish" ? 1 : 0);
      const total = bullish + bearish;
      return {
        bullish,
        bearish,
        total,
        bullishPercent: total > 0 ? Math.round((bullish / total) * 100) : 50,
        bearishPercent: total > 0 ? Math.round((bearish / total) * 100) : 50,
        myVote,
      };
    },
    [voteState]
  );

  // How many of the tracked assets THIS browser has cast a vote on —
  // a real count of voteState's own keys, read by
  // components/dashboard/CommunityActivityCard.jsx's "Sentiment Votes
  // Cast" tile. Not memoized with useMemo since voteState is a small
  // object and this hook already re-renders on every vote.
  const castVotesCount = Object.keys(voteState).length;

  return { hydrated, castVote, getCounts, castVotesCount };
}
