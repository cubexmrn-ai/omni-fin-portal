"use client";

// hooks/useTrackCalculation.js
//
// Analytics Custom Event Tracking — shared helper for the household
// /tools/* calculators (and any other live-recalculating, no-submit-
// button calculator on this site). These components recompute their
// result on every keystroke via useMemo, so firing a GA4 event
// directly off that result would spam `calculate_*` events dozens of
// times per minute while someone is just typing a number in — the
// opposite of "track when a calculation is executed."
//
// This hook instead watches a caller-supplied `resultKey` (a primitive
// — a string or number — cheap to compare across renders) and fires
// exactly one debounced event per settled value: every change resets a
// short timer, and only the LAST value within that window actually
// reaches GA4. 800ms is comfortably longer than a fast typist's
// keystroke gap but short enough that the event still reads as "this
// calculation" rather than a later, unrelated one.
//
// Non-blocking by construction: the timer runs off the main render
// path, and lib/gtag.js's trackEvent() is itself a safe no-op when GA
// isn't configured/loaded — so this hook costs nothing in local dev or
// for a visitor with an ad blocker.

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/gtag";

const DEBOUNCE_MS = 800;

/**
 * @param {string} eventName   GA4 event name, e.g. "calculate_zakhat"
 * @param {string|number|null|undefined} resultKey
 *        A cheap-to-compare primitive summarizing the current result.
 *        Pass null/undefined while the result isn't meaningful yet
 *        (still loading, invalid input) to skip tracking entirely.
 * @param {object} [params]    Extra GA4 event params (tool name, inputs…)
 */
export function useTrackCalculation(eventName, resultKey, params = {}) {
  const timeoutRef = useRef(null);
  // Keeps the latest params/eventName available to the timeout
  // callback without re-triggering the effect on every param object's
  // new identity (only resultKey settling should restart the timer).
  const latestRef = useRef({ eventName, params });
  latestRef.current = { eventName, params };

  useEffect(() => {
    if (resultKey === null || resultKey === undefined || resultKey === "") return;

    timeoutRef.current = setTimeout(() => {
      const { eventName: name, params: p } = latestRef.current;
      trackEvent(name, p);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
    // Only resultKey should restart the debounce timer — eventName is
    // effectively static per call site, and params is read fresh from
    // latestRef when the timer fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);
}
