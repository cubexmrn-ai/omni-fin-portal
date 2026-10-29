"use client";

// components/TrackedCtaLink.jsx
//
// Thin client wrapper so a Server Component page (e.g. app/ai-news/
// [slug]/page.jsx) can still fire a GA4 click event on an outbound CTA
// without itself becoming a Client Component — Next.js doesn't allow
// passing an onClick handler to an element rendered from a Server
// Component, so this one small island is the standard escape hatch,
// same pattern already used elsewhere in this project for interactive
// bits embedded in a server-rendered page.
//
// `external` picks a real <a target="_blank"> (for a third-party URL,
// e.g. the original news outlet) vs. a Next <Link> (for an internal
// route) — same two shapes the pages using this already hand-wrote
// before this existed, just with trackEvent() wired on click. Never
// blocks or delays navigation: trackEvent() itself is already a safe,
// synchronous, swallow-all-errors no-op when GA isn't configured (see
// lib/gtag.js), so this never risks breaking a click.

import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

export default function TrackedCtaLink({
  href,
  external = false,
  eventName,
  eventParams,
  className,
  children,
}) {
  function handleClick() {
    if (eventName) trackEvent(eventName, eventParams);
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
