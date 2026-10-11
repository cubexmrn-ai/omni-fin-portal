// lib/formatNumber.js
//
// Single shared, defensively-clamped wrapper around
// `value.toLocaleString()` for every number formatter in this project.
//
// THE BUG THIS FIXES: Intl.NumberFormat throws a RangeError
// ("maximumFractionDigits value is out of range") whenever
// minimumFractionDigits ends up greater than maximumFractionDigits, OR
// either one falls outside the valid 0-20 range, OR either one is
// NaN/undefined. Several formatters in this project called
// `toLocaleString` with one of those two options hardcoded and the
// other passed through from a caller-supplied `decimals` argument —
// which worked until a caller passed a `decimals` smaller than the
// hardcoded one (e.g. components/calculators/PipValueCalculator.jsx's
// `formatContractSize()` called `formatNumber(units, 0)` against a
// local helper that hardcoded `minimumFractionDigits: 2`). That specific
// combination only renders for whole-number contract sizes (100,000;
// 10,000; …), which happens during Next.js's static-generation render
// pass for /calculators and any /converters/[pair] page that embeds
// the Pip Value mini-widget (any pair involving a fiat currency) —
// a server-side render, so the thrown RangeError failed the build
// outright instead of just showing "—" to one client.
//
// GoldCalculator.jsx and CurrencyConverter.jsx had already hit and
// fixed a sibling version of this same bug once before (see their own
// header comments), each with its own local clamp. This file is that
// fix generalized into one place so every formatter in the project —
// present and future — shares it instead of re-deriving it.
//
// @param {number} value
// @param {{ maximumFractionDigits?: number, minimumFractionDigits?: number, locale?: string }} [options]
// @returns {string} the formatted number, or "—" if `value` isn't a finite number
export function formatNumber(value, options = {}) {
  if (!Number.isFinite(value)) return "—";

  const { maximumFractionDigits, minimumFractionDigits, locale } = options;

  // Intl.NumberFormat only accepts integers 0-20 for either fraction-
  // digits option. Clamp first, then round (a stray 2.5 or 2.9 passed
  // in by mistake should never itself cause a RangeError).
  const safeMax = Number.isFinite(maximumFractionDigits)
    ? Math.max(0, Math.min(20, Math.round(maximumFractionDigits)))
    : 2;

  // minimumFractionDigits must never exceed maximumFractionDigits —
  // this is the exact constraint the bug above violated — so it's
  // clamped against safeMax (the already-clamped max), not against
  // the raw, un-clamped input.
  const safeMin = Number.isFinite(minimumFractionDigits)
    ? Math.max(0, Math.min(safeMax, Math.round(minimumFractionDigits)))
    : 0;

  return value.toLocaleString(locale, {
    maximumFractionDigits: safeMax,
    minimumFractionDigits: safeMin,
  });
}
