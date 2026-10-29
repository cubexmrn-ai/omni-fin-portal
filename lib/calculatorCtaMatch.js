// lib/calculatorCtaMatch.js
//
// Phase 1 roadmap item (Oct 30 2026): matches an AI News headline to
// one of the 4 new /tools/* calculators (Retirement, 401(k) vs Roth
// IRA, Compound Interest, Net Worth) — but ONLY when the headline's
// own text genuinely names that exact topic. This deliberately
// mirrors the project's existing evidence-gated discipline (see
// GoDeeperStrip.jsx's header comment, and the Oct 28 round's declined
// AI-News-to-blog mapping): a loose, "sort of related" category match
// is worse than no match at all, because it trains visitors to expect
// irrelevant CTAs and erodes the one that already works (the
// evergreen Academy CTA right below this one in app/ai-news/[slug]/
// page.jsx stays — this is a SUPPLEMENT for headlines specific enough
// to earn a sharper link, not a replacement).
//
// Every pattern below requires the literal topic phrase, not a vague
// theme — e.g. a Fed-rate-hike story does NOT match "interest rate"
// alone (that's a different kind of interest rate entirely from
// personal compound interest), and a "Musk's net worth hits $X"
// headline DOES match "net worth" because that literal phrase is
// genuinely present and genuinely about net worth as a concept, not
// a stretch. Checked against the real visible headline + summary/
// excerpt text only — never against category or source, which carry
// no topical signal of their own.
//
// Priority order matters when a headline could plausibly match more
// than one (rare, but e.g. a "retirement and 401k" headline): the
// array order below is the match priority, most-specific first.

const MATCHERS = [
  {
    id: "401k-vs-roth-ira",
    href: "/tools/401k-vs-roth-ira-calculator",
    label: "401(k) vs Roth IRA Calculator",
    blurb: "See whether a Traditional or Roth account comes out ahead after tax, at the same paycheck cost.",
    pattern: /\b(roth ira|roth 401\(?k\)?|401\(?k\)?|traditional ira)\b/i,
  },
  {
    id: "retirement",
    href: "/tools/retirement-calculator",
    label: "Retirement Savings Calculator",
    blurb: "Check your own projected balance and retirement-income estimate against your target.",
    pattern: /\b(retire(ment|e|ing)?|pension|social security|nest egg)\b/i,
  },
  {
    id: "compound-interest",
    href: "/tools/compound-interest-calculator",
    label: "Compound Interest Calculator",
    blurb: "See exactly how compounding would grow a starting amount and monthly contributions over time.",
    pattern: /\bcompound(ing)?\s+interest\b|\bcompounding\s+returns\b/i,
  },
  {
    id: "net-worth",
    href: "/tools/net-worth-tracker",
    label: "Net Worth Tracker",
    blurb: "Add up your own assets and liabilities to see where you stand, in the same spirit as this story.",
    pattern: /\bnet\s+worth\b/i,
  },
];

/**
 * @param {{title?:string, summary?:string, excerpt?:string}} item
 * @returns {{id:string, href:string, label:string, blurb:string}|null}
 */
export function matchCalculatorCta(item) {
  const haystack = [item?.title, item?.summary, item?.excerpt].filter(Boolean).join(" \n ");
  if (!haystack) return null;

  for (const matcher of MATCHERS) {
    if (matcher.pattern.test(haystack)) {
      const { id, href, label, blurb } = matcher;
      return { id, href, label, blurb };
    }
  }
  return null;
}
