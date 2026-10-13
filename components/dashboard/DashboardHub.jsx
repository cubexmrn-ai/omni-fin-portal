"use client";

// components/dashboard/DashboardHub.jsx
//
// The interactive body of the User Dashboard (app/dashboard/page.jsx):
// a single-page rollup of the person's OmniFin Ecosystem activity —
// Demo Trading Lab account, Academy curriculum progress, and saved
// conversion/calculator presets — each card reading the exact same
// localStorage-backed hooks their own feature pages use, so nothing
// shown here is a separate or fabricated snapshot. Split out as its
// own "use client" component (same pattern as components/academy/
// AcademyHub.jsx and components/academy/TradingLab.jsx) so app/
// dashboard/page.jsx itself can stay a plain server component with
// its own metadata export.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchRates } from "@/lib/fetchRates";
import { resolveInstrumentPrice } from "@/lib/technicalAnalysis";
import { DEMO_LAB_INSTRUMENTS } from "@/lib/demoTradingInstruments";
import { useDemoTrading } from "@/hooks/useDemoTrading";
import { useAcademyProgress } from "@/hooks/useAcademyProgress";
import { useDashboardPresets } from "@/hooks/useDashboardPresets";
import { useTradeSetups } from "@/hooks/useTradeSetups";
import { useSentimentVotes } from "@/hooks/useSentimentVotes";
import { useBaseCurrency } from "@/lib/baseCurrencyContext";
import TradingLabSummaryCard from "@/components/dashboard/TradingLabSummaryCard";
import AcademyProgressCard from "@/components/dashboard/AcademyProgressCard";
import PresetsCard from "@/components/dashboard/PresetsCard";
import CommunityActivityCard from "@/components/dashboard/CommunityActivityCard";

// A single live-price snapshot is enough for the dashboard's Floating
// PnL figure (unlike the Lab itself, this page doesn't need a live
// chart) — refreshed periodically so the figure doesn't go stale on a
// long-open tab, on the same cadence as the Lab's own poll.
const POLL_INTERVAL_MS = 30_000;

export default function DashboardHub() {
  const [livePrices, setLivePrices] = useState({});
  const { baseCurrency } = useBaseCurrency();
  const academyProgress = useAcademyProgress();
  const presets = useDashboardPresets();
  const { hydrated: setupsHydrated, allSetups } = useTradeSetups();
  const { hydrated: sentimentHydrated, castVotesCount } = useSentimentVotes();

  const pollPrices = useCallback(async () => {
    try {
      const ratesData = await fetchRates({ noStore: true });
      const resolved = {};
      for (const instrument of DEMO_LAB_INSTRUMENTS) {
        const price = resolveInstrumentPrice(instrument, ratesData);
        if (Number.isFinite(price)) resolved[instrument.code] = price;
      }
      setLivePrices(resolved);
    } catch {
      // Best-effort — Floating PnL just falls back to "—" via
      // useDemoTrading's own Number.isFinite guards until the next poll.
    }
  }, []);

  useEffect(() => {
    pollPrices();
    const interval = setInterval(pollPrices, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollPrices]);

  const tradingAccount = useDemoTrading(livePrices);

  // Real, local counts of this browser's own Community Hub activity —
  // see components/dashboard/CommunityActivityCard.jsx's header note.
  const setupsShared = allSetups.filter((s) => s.isUserSubmitted).length;
  const communityHydrated = setupsHydrated && sentimentHydrated;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            {/* "Home", not "Dashboard" — this breadcrumb points to "/",
                and this page itself is the Dashboard, so reusing that
                label here would be doubly confusing (same fix as the
                header nav's Home/My Dashboard split). */}
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A single-page view of your Demo Trading Lab account, Academy progress, saved presets,
            and Community Hub activity across OmniFin Portal — all stored locally in this browser.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TradingLabSummaryCard account={tradingAccount} />
          <AcademyProgressCard progress={academyProgress} />
          <PresetsCard baseCurrency={baseCurrency} presets={presets} />
          <CommunityActivityCard
            setupsShared={setupsShared}
            votesCast={castVotesCount}
            hydrated={communityHydrated}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-600">
            Track your trades, stock holdings, and rental income in the Trading &amp; Asset Journal.
          </p>
          <Link
            href="/journal"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Open Journal →
          </Link>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-slate-400">
          Everything on this page is read from this browser&apos;s own local storage — the same
          data the Trading Lab, Academy, Converters, and Journal pages themselves use — so
          there&apos;s no separate account or sign-in behind it, and nothing here syncs across
          devices.
        </p>
      </section>
    </div>
  );
}
