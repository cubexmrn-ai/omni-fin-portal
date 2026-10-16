"use client";

// components/auth/AuthModal.jsx
//
// Sign In / Sign Up modal for the Trading Journal and Community Forum
// cloud sync (RETENTION UPGRADE — Multi-Persona UX & Retention Gap
// Audit's "give the Journal/Community real accounts" structural
// roadmap item). Reuses components/community/Modal.jsx's generic
// overlay shell rather than building a second one.
//
// Deliberately minimal: email + password only (Supabase's own built-in
// auth, no third-party OAuth wired up here). When Supabase isn't
// configured for this deployment, hooks/useSupabaseAuth.js's signIn/
// signUp already return a clear "not configured" error, shown inline
// below rather than this modal pretending the attempt could succeed.
// Either way, closing this modal (or never opening it) is always a
// valid path — every feature that uses it keeps working in
// localStorage-only guest mode without an account.

import { useState } from "react";
import Modal from "@/components/community/Modal";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function AuthModal({ open, onClose }) {
  const { signIn, signUp, authError } = useSupabaseAuth();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setNotice("");

    const action = mode === "signin" ? signIn : signUp;
    const { error } = await action(email, password);

    setSubmitting(false);
    if (!error) {
      if (mode === "signup") {
        setNotice("Account created — check your email to confirm, then sign in.");
      } else {
        onClose?.();
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "signin" ? "Sign In" : "Create Account"} widthClassName="max-w-sm">
      <p className="mb-4 text-sm text-slate-500">
        Sign in to sync your Journal entries and Community posts across devices. You can keep using
        this browser only, without an account — nothing here is required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        {authError && <p className="text-xs text-rose-600">{authError}</p>}
        {notice && <p className="text-xs text-emerald-600">{notice}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        {mode === "signin" ? "Don&apos;t have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setNotice("");
          }}
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </Modal>
  );
}
