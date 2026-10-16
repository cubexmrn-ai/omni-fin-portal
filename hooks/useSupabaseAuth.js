"use client";

// hooks/useSupabaseAuth.js
//
// Shared auth state for the Trading Journal and Community Forum cloud
// sync (components/auth/AuthModal.jsx, hooks/useTradingJournal.js,
// hooks/useCommunityPosts.js). When lib/supabase.js's client isn't
// configured for this deployment, every function here is a safe no-op
// and `user` stays `null` forever — the calling UI already treats
// "no user" as "guest / localStorage mode", so an unconfigured
// Supabase project and a logged-out visitor look identical to callers,
// by design.

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setUser(data?.session?.user || null);
        setAuthLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      cancelled = true;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthError("Cloud sync isn't configured on this deployment yet.");
      return { error: "not-configured" };
    }
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    return { error: error?.message || null };
  }, []);

  const signUp = useCallback(async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthError("Cloud sync isn't configured on this deployment yet.");
      return { error: "not-configured" };
    }
    setAuthError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    return { error: error?.message || null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return { user, authLoading, authError, signIn, signUp, signOut };
}
