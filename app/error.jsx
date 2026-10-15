"use client";

// app/error.jsx
//
// Root-level error boundary (Next.js App Router convention — must be a
// Client Component). Catches any render-time error thrown by a page or
// component under the root layout that wasn't already caught closer to
// its source, so a single unexpected bug white-screens nothing: the
// visitor gets this recovery card with a "Try again" button (which
// re-renders the failed segment via reset()) instead of a blank tab.
//
// This is deliberately a second line of defense, not the primary one —
// every page's own data-fetching (getCachedYoutubeAutomationFeed(),
// getCachedAggregatedNews(), getUnifiedRates(), etc.) is already
// wrapped in its own try/catch with a safe fallback value (see each
// page.jsx's own comments), so this boundary should only ever fire on a
// genuinely unexpected bug, not a routine upstream API failure.
//
// Does NOT catch errors thrown inside the root layout itself (header,
// footer, providers) — that needs app/global-error.jsx, added
// alongside this file.
import { useEffect } from "react";
import Link from "next/link";

export default function RootError({ error, reset }) {
  useEffect(() => {
    // Logged to the server/function console (Vercel logs) so a real
    // bug here is visible in production monitoring, not just silently
    // shown to the one visitor who hit it.
    console.error("[app/error.jsx] Unhandled render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl" aria-hidden="true">
        ⚠️
      </p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">
        This page hit an unexpected error. It's been logged — try again, or
        head back to the homepage.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
