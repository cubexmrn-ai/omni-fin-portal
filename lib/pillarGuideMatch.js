// lib/pillarGuideMatch.js
//
// Nov 3 2026 traffic-concentration round: GSC showed 83% of all clicks
// concentrated on 2 viral 401(k)/retirement human-interest headlines,
// while every evergreen /blog/ pillar guide sat at 0 clicks — not
// because the guides are bad, but because nothing on the viral
// permalinks themselves pointed at them. This closes that gap the
// same way lib/calculatorCtaMatch.js already closes it for /tools/*
// calculators: a literal, evidence-gated phrase match against the
// headline's own text, never a vague theme/category match (see that
// file's header comment for the full rationale — it applies here
// unchanged). A story has to actually be ABOUT what a guide covers
// before this links to it.
//
// Deliberately a SEPARATE matcher from calculatorCtaMatch.js rather
// than merged into it: that one maps a headline to the single most
// relevant interactive /tools/* calculator; this one maps it to the
// single most relevant evergreen /blog/ deep-dive. A story can
// legitimately earn both — e.g. the "80% of workers make this 401(k)
// mistake" headline gets the 401(k) vs Roth IRA mini-calculator AND
// the Retirement Catch-Up Benchmarks guide, which isn't redundant:
// one is "try it yourself right now," the other is "here's the full
// context and the numbers behind it."
//
// Priority order matters, most-specific first: the two viral stories
// this round is about ("my wife cried... only $80,000 in her
// 401(k)" and "80% of workers make this 401(k) mistake when they
// retire") each get their own exact-phrase matcher pointing at the
// one guide that was written to directly address that exact
// headline (catching-up-401k-50-with-80k-saved's worked example IS
// the $80,000-at-50 scenario; retirement-catch-up-benchmarks-by-age's
// own intro paragraph quotes the "80% of workers" headline by name)
// before falling through to the broader 401(k)/Roth/retirement
// guides for any other headline that's merely on-topic.

const MATCHERS = [
  {
    id: "catching-up-80k",
    href: "/blog/catching-up-401k-50-with-80k-saved",
    label: "Catching Up on 401(k) Savings at 50 With $80,000 Saved",
    blurb: "A worked example for exactly this scenario — $80,000 saved, and how fast a catch-up plan can close the gap.",
    pattern: /only\s+\$?80,?000\b.{0,40}\b(401\(?k\)?|retirement|saved)\b/i,
  },
  {
    id: "retirement-catchup-benchmarks",
    href: "/blog/retirement-catch-up-benchmarks-by-age",
    label: "Retirement Catch-Up Benchmarks by Age",
    blurb: "What the catch-up contribution this story is about actually grows into by 65, at every age it applies.",
    pattern: /\b80%?\s+of\s+workers\b.{0,60}\b401\(?k\)?\s+mistake\b/i,
  },
  {
    id: "401k-benchmarks",
    href: "/blog/401k-benchmarks-by-age",
    label: "401(k) Benchmarks by Age",
    blurb: "See the widely-cited salary-multiple savings targets for your own age, and where you stand against them.",
    pattern: /\b401\(?k\)?\b/i,
  },
  {
    id: "roth-decision-matrix",
    href: "/blog/roth-ira-vs-401k-decision-matrix",
    label: "Roth IRA vs. 401(k) Decision Matrix",
    blurb: "A step-by-step order for prioritizing employer match, Traditional vs. Roth, and income limits.",
    pattern: /\broth\s+(ira|401\(?k\)?)\b/i,
  },
  {
    id: "net-worth-plan",
    href: "/blog/bulletproof-financial-plan-net-worth-guide",
    label: "Building a Bulletproof Financial Plan",
    blurb: "Emergency funds, debt payoff, and net worth tracking — the fundamentals behind stories like this one.",
    pattern: /\bnet\s+worth\b/i,
  },
];

/**
 * @param {{title?:string, summary?:string, excerpt?:string}} item
 * @returns {{id:string, href:string, label:string, blurb:string}|null}
 */
export function matchPillarGuide(item) {
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
