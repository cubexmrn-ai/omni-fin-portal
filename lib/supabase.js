// lib/supabase.js
//
// Thin, defensive wrapper around @supabase/supabase-js — the free-tier
// cloud database + auth backing the Trading Journal
// (hooks/useTradingJournal.js) and Community Forum
// (hooks/useCommunityPosts.js) cloud sync. Mirrors the honesty-bar/
// graceful-degradation convention used everywhere else in this project
// (lib/marketData.js's provider chains, lib/candleData.js): when
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY aren't both
// set (this deployment hasn't configured a Supabase project yet, or is
// running locally without them), every function here returns `null`
// instead of throwing — callers already know how to fall back to
// localStorage-only guest mode when that happens, so a missing/
// misconfigured Supabase project degrades the exact same way a missing
// TWELVE_DATA_API_KEY does: real features switch off cleanly, nothing
// crashes, nothing silently pretends to be synced when it isn't.
//
// Browser-only by design (the publishable anon key + Supabase's own
// Row Level Security policies are what makes this safe to ship to the
// client — see SUPABASE_SETUP.md for the required RLS policies on
// `trading_journal` and `community_posts`/`community_comments`). This
// file is imported only from "use client" hooks/components.

import { createClient } from "@supabase/supabase-js";

let cachedClient; // undefined = not yet attempted; null = attempted and unavailable; object = ready client.

/**
 * Returns a singleton Supabase client, or `null` if
 * NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY aren't both
 * set. Safe to call from anywhere client-side — never throws.
 */
export function getSupabaseClient() {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

/** True when a Supabase project is actually configured for this deployment. */
export function isSupabaseConfigured() {
  return getSupabaseClient() !== null;
}
