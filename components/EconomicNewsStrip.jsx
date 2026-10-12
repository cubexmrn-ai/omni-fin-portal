// components/EconomicNewsStrip.jsx
//
// Homepage "High-Impact Economic Events" ticker — a sleek, high-
// visibility dark strip showing upcoming High/Medium impact releases
// (NFP, CPI, rate decisions, GDP, …) with currency badges, impact
// badges, and a live-feeling "in Xh Ym" countdown.
//
// A plain Server Component (no "use client"): the countdown text is
// computed once per request/ISR revalidation from lib/economicCalendar
// .js's EVENT_TEMPLATES, which is honest about what it is — see that
// file's header comment on why this projects typical release slots
// rather than claiming to be a confirmed live feed. The homepage links
// through to /ai-news's full "Economic Calendar" tab for the real,
// filterable version.
//
// Pure-CSS infinite marquee: the event list is rendered twice back to
// back inside a flex row twice the content's width, animated with a
// CSS keyframe translateX — no client JS needed, and it degrades to a
// normal (if long) scrollable row if animation is disabled.

import Link from "next/link";
import { getHighImpactUpcomingEvents, formatCountdown } from "@/lib/economicCalendar";

const IMPACT_BADGE = {
  high: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  low: "bg-slate-500/15 text-slate-300 border-slate-400/30",
};

function EventChip({ event }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white">
        {event.currency}
      </span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${IMPACT_BADGE[event.impact]}`}
      >
        {event.impact === "high" ? "High" : event.impact === "medium" ? "Med" : "Low"}
      </span>
      <span className="text-sm font-medium text-slate-100">{event.title}</span>
      <span className="text-xs font-semibold text-blue-300">{formatCountdown(event.timeIso)}</span>
    </div>
  );
}

export default function EconomicNewsStrip() {
  const events = getHighImpactUpcomingEvents(new Date(), 8);
  if (events.length === 0) return null;

  return (
    <div className="border-b border-slate-800 bg-slate-900 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/ai-news"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-300 transition-colors hover:bg-blue-500/20 sm:flex"
        >
          High-Impact Events
        </Link>

        <div className="group relative flex-1 overflow-hidden">
          <div className="flex w-max animate-[ticker-scroll_45s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
            {[...events, ...events].map((event, i) => (
              <EventChip key={`${event.id}-${i}`} event={event} />
            ))}
          </div>
          {/* Edge fades so the ticker reads as "scrolling off", not clipped */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
        </div>

        <Link
          href="/ai-news"
          className="hidden shrink-0 text-xs font-semibold text-slate-400 hover:text-white sm:block"
        >
          Full Calendar →
        </Link>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
