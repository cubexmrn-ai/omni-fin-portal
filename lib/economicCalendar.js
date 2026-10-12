// lib/economicCalendar.js
//
// Economic calendar data for the homepage "High-Impact Economic Events"
// strip and /ai-news's "Economic Calendar" tab.
//
// HONESTY NOTE (same bar as every other "live" feature in this
// project — see the "AI-generated summaries are coming soon" banner on
// app/ai-news/page.jsx, or CurrencyConverter's TrendBadge): there is no
// live ForexFactory/economic-calendar API wired into this project, and
// scraping ForexFactory's own calendar is against its terms of service.
// Rather than fabricate specific dates/forecast numbers and present
// them as a real confirmed feed, this module projects each event's
// NEXT typical release slot from well-known, genuinely recurring
// release patterns (NFP is always the first Friday of the month, the
// Fed's FOMC decision is always a Wednesday on a ~6-week cycle, etc.)
// relative to the current date. The UI built on top of this always
// labels it "Illustrative schedule" and never claims to be a confirmed
// live feed — swap EVENT_TEMPLATES' `nextOccurrence` for a real
// calendar API response shape whenever one is wired up, and nothing
// else needs to change.

export const IMPACT_LEVELS = ["high", "medium", "low"];

export const CALENDAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** The nth occurrence of `weekday` (0=Sun..6=Sat) in `month` (0-11) of
 * `year`, at hour:minute UTC. */
function nthWeekdayOfMonth(year, month, weekday, n, hour, minute) {
  const d = new Date(Date.UTC(year, month, 1, hour, minute));
  const firstWeekday = d.getUTCDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  d.setUTCDate(1 + offset + (n - 1) * 7);
  return d;
}

/** The next date (today or later) on which `weekday` falls, counting
 * forward in steps of `intervalWeeks` from `anchor`. Used for policy
 * decisions (ECB/BoE/SNB) that run on a fixed multi-week cadence. */
function nextOnCadence(fromDate, anchorIso, intervalWeeks, hour, minute) {
  const anchor = new Date(anchorIso);
  const msPerCycle = intervalWeeks * 7 * 24 * 60 * 60 * 1000;
  const diff = fromDate.getTime() - anchor.getTime();
  const cyclesPassed = Math.floor(diff / msPerCycle);
  let candidate = new Date(anchor.getTime() + cyclesPassed * msPerCycle);
  candidate.setUTCHours(hour, minute, 0, 0);
  while (candidate.getTime() <= fromDate.getTime()) {
    candidate = new Date(candidate.getTime() + msPerCycle);
    candidate.setUTCHours(hour, minute, 0, 0);
  }
  return candidate;
}

/** The next occurrence (today or later) of the Nth `weekday` of any
 * month, searching forward month by month. */
function nextNthWeekday(fromDate, weekday, n, hour, minute) {
  let year = fromDate.getUTCFullYear();
  let month = fromDate.getUTCMonth();
  for (let i = 0; i < 6; i++) {
    const candidate = nthWeekdayOfMonth(year, month, weekday, n, hour, minute);
    if (candidate.getTime() > fromDate.getTime()) return candidate;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return fromDate;
}

/** The next occurrence (today or later) of a fixed day-of-month, at a
 * given UTC hour:minute, searching forward month by month. */
function nextDayOfMonth(fromDate, day, hour, minute) {
  let year = fromDate.getUTCFullYear();
  let month = fromDate.getUTCMonth();
  for (let i = 0; i < 6; i++) {
    const candidate = new Date(Date.UTC(year, month, day, hour, minute));
    if (candidate.getTime() > fromDate.getTime()) return candidate;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return fromDate;
}

// Each template describes ONE recurring macro release and how to
// project its next typical slot. `nextOccurrence(fromDate)` always
// returns a Date >= fromDate.
export const EVENT_TEMPLATES = [
  {
    id: "usd-nfp",
    currency: "USD",
    impact: "high",
    title: "Non-Farm Payrolls (NFP)",
    note: "US Bureau of Labor Statistics jobs report — typically the first Friday of the month.",
    nextOccurrence: (from) => nextNthWeekday(from, 5, 1, 13, 30), // Fri, 8:30am ET ≈ 13:30 UTC
  },
  {
    id: "usd-cpi",
    currency: "USD",
    impact: "high",
    title: "CPI (Inflation Rate)",
    note: "US Consumer Price Index — typically released mid-month.",
    nextOccurrence: (from) => nextDayOfMonth(from, 13, 13, 30),
  },
  {
    id: "usd-fomc",
    currency: "USD",
    impact: "high",
    title: "Fed Interest Rate Decision (FOMC)",
    note: "Federal Reserve policy decision — roughly every 6 weeks, Wednesdays.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-01-28T19:00:00Z", 6, 19, 0),
  },
  {
    id: "usd-retail-sales",
    currency: "USD",
    impact: "medium",
    title: "Retail Sales m/m",
    note: "US Census Bureau retail sales — typically mid-month.",
    nextOccurrence: (from) => nextDayOfMonth(from, 15, 13, 30),
  },
  {
    id: "eur-rate",
    currency: "EUR",
    impact: "high",
    title: "ECB Interest Rate Decision",
    note: "European Central Bank policy decision — every ~6 weeks, Thursdays.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-01-29T13:15:00Z", 6, 13, 15),
  },
  {
    id: "eur-cpi-flash",
    currency: "EUR",
    impact: "high",
    title: "CPI Flash Estimate y/y",
    note: "Eurostat flash inflation estimate — typically released at month-end.",
    nextOccurrence: (from) => nextDayOfMonth(from, 28, 10, 0),
  },
  {
    id: "eur-zew",
    currency: "EUR",
    impact: "medium",
    title: "German ZEW Economic Sentiment",
    note: "ZEW Institute survey — typically mid-month.",
    nextOccurrence: (from) => nextNthWeekday(from, 2, 3, 10, 0), // 3rd Tuesday
  },
  {
    id: "gbp-rate",
    currency: "GBP",
    impact: "high",
    title: "BoE Interest Rate Decision",
    note: "Bank of England policy decision — roughly every 6 weeks, Thursdays.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-02-05T12:00:00Z", 6, 12, 0),
  },
  {
    id: "gbp-gdp",
    currency: "GBP",
    impact: "high",
    title: "GDP q/q",
    note: "UK Office for National Statistics quarterly growth figure.",
    nextOccurrence: (from) => nextDayOfMonth(from, 12, 7, 0),
  },
  {
    id: "gbp-pmi",
    currency: "GBP",
    impact: "medium",
    title: "Manufacturing PMI",
    note: "S&P Global/CIPS UK manufacturing survey — typically the 1st business day of the month.",
    nextOccurrence: (from) => nextDayOfMonth(from, 1, 9, 30),
  },
  {
    id: "jpy-rate",
    currency: "JPY",
    impact: "high",
    title: "BoJ Interest Rate Decision",
    note: "Bank of Japan policy decision — roughly every 6-7 weeks.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-01-23T03:00:00Z", 7, 3, 0),
  },
  {
    id: "aud-rate",
    currency: "AUD",
    impact: "high",
    title: "RBA Cash Rate Decision",
    note: "Reserve Bank of Australia policy decision — typically the first Tuesday of the month.",
    nextOccurrence: (from) => nextNthWeekday(from, 2, 1, 3, 30),
  },
  {
    id: "aud-trade-balance",
    currency: "AUD",
    impact: "medium",
    title: "Trade Balance",
    note: "Australian Bureau of Statistics monthly trade figures.",
    nextOccurrence: (from) => nextDayOfMonth(from, 6, 1, 30),
  },
  {
    id: "cad-employment",
    currency: "CAD",
    impact: "high",
    title: "Employment Change",
    note: "Statistics Canada jobs report — typically the first Friday of the month.",
    nextOccurrence: (from) => nextNthWeekday(from, 5, 1, 13, 30),
  },
  {
    id: "chf-rate",
    currency: "CHF",
    impact: "medium",
    title: "SNB Policy Rate",
    note: "Swiss National Bank quarterly policy decision.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-03-19T08:30:00Z", 13, 8, 30),
  },
  {
    id: "nzd-rate",
    currency: "NZD",
    impact: "high",
    title: "RBNZ Official Cash Rate",
    note: "Reserve Bank of New Zealand policy decision — roughly every 6-7 weeks.",
    nextOccurrence: (from) => nextOnCadence(from, "2026-02-18T21:00:00Z", 6, 21, 0),
  },
  {
    id: "cny-gdp",
    currency: "CNY",
    impact: "medium",
    title: "GDP y/y",
    note: "China National Bureau of Statistics quarterly growth figure.",
    nextOccurrence: (from) => nextDayOfMonth(from, 17, 2, 0),
  },
  {
    id: "usd-ppi",
    currency: "USD",
    impact: "low",
    title: "PPI m/m",
    note: "US Producer Price Index — typically released mid-month, a day or two after CPI.",
    nextOccurrence: (from) => nextDayOfMonth(from, 14, 13, 30),
  },
];

/** Builds the list of upcoming events (one per template, projected
 * from `from`), sorted soonest-first, each a plain serializable object
 * (ISO timestamp, not a Date) so it can cross the server/client
 * component boundary as a prop. */
export function getUpcomingEvents(from = new Date()) {
  return EVENT_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    currency: tpl.currency,
    impact: tpl.impact,
    title: tpl.title,
    note: tpl.note,
    timeIso: tpl.nextOccurrence(from).toISOString(),
  })).sort((a, b) => new Date(a.timeIso) - new Date(b.timeIso));
}

/** Only the highest-signal events (High + Medium impact), capped, for
 * the homepage strip — a Low-impact release isn't "high-impact" news
 * by definition, so it's left out there even though the full
 * calendar page still shows it. */
export function getHighImpactUpcomingEvents(from = new Date(), limit = 8) {
  return getUpcomingEvents(from)
    .filter((e) => e.impact === "high" || e.impact === "medium")
    .slice(0, limit);
}

/** Formats the time remaining until an ISO timestamp as a compact
 * "in 2d 4h" / "in 45m" string. Returns "Just released" for anything
 * in the past (shouldn't normally happen since templates always
 * project forward, but keeps the UI sane if a page is left open). */
export function formatCountdown(timeIso, now = new Date()) {
  const diffMs = new Date(timeIso).getTime() - now.getTime();
  if (diffMs <= 0) return "Just released";
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `in ${hours}h ${remMins}m` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `in ${days}d ${remHours}h` : `in ${days}d`;
}

export function formatEventClock(timeIso) {
  const d = new Date(timeIso);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} UTC`;
}
