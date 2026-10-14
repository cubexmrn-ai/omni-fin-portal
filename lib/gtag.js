// lib/gtag.js
//
// Thin GA4 helper around `window.gtag`, the global the gtag.js
// bootstrap snippet (loaded by components/GoogleAnalytics.jsx) attaches
// to `window`. Kept framework-light on purpose — no React, no Next.js
// imports — so it can be called from any client component or hook
// without pulling in anything beyond the browser's own `window`.
//
// GA_MEASUREMENT_ID is read once here from the public env var so every
// caller (this file, GoogleAnalytics.jsx) shares one source of truth
// instead of each re-reading process.env directly. NEXT_PUBLIC_-
// prefixed env vars are inlined at build time by Next.js, so this is
// safe to read at module scope in a file imported by a Client
// Component — it's just a build-time constant, not a runtime lookup.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Sends a GA4 page_view event for a client-side (App Router) route
 * change. The gtag.js bootstrap's own `config` call already fires one
 * page_view on first load; this is for every SPA navigation after
 * that, which the App Router does without a full page load/reload —
 * so without this, GA4 would only ever see the first page view of a
 * visit and the dashboard would look like near-zero traffic even with
 * the tag firing correctly.
 *
 * No-ops safely (never throws, never queues a fake/partial event) if
 * GA hasn't loaded yet — an ad blocker, a slow network, or
 * NEXT_PUBLIC_GA_MEASUREMENT_ID simply not being configured in this
 * environment are all normal, expected states for this function to run
 * in silently.
 */
export function pageview(url) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

/**
 * Sends an arbitrary GA4 event (e.g. a converter calculation, a
 * calculator submit) — not currently called anywhere, but kept here as
 * the one place future event tracking should go through, rather than
 * every component reaching for `window.gtag` directly. Same
 * no-op-on-missing-gtag safety as pageview() above.
 */
export function event({ action, category, label, value }) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}
