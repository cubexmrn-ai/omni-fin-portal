"use client";

// components/academy/TradingLab.jsx
//
// The Academy's Interactive Demo Trading Lab (app/learn/lab/page.jsx):
// a client-side-only paper-trading simulator covering Gold (XAU/USD),
// Bitcoin (BTC/USD), EUR/USD and Crude Oil (WTI). Assembles:
//   - a $10,000 virtual account (hooks/useDemoTrading.js, localStorage)
//   - a live line chart per instrument (components/academy/lab/LiveChartPanel.jsx)
//   - a Buy/Sell execution panel (components/academy/lab/ExecutionPanel.jsx)
//   - an open-positions grid + trade history (PositionsTable/TradeHistory)
//   - the "Claim Risk Manager Badge" CTA (BadgeCTA.jsx)
//
// LIVE PRICES: polled from the same getUnifiedRates()-backed /api/rates
// endpoint every other page on the site reads, via lib/fetchRates.js's
// fetchRates({ noStore: true }) — real live prices, not fabricated
// ticks. That endpoint is only cache-refreshed roughly hourly (see
// RATES_REVALIDATE_SECONDS), so this component discloses that cadence
// directly rather than implying a faster, tick-by-tick feed; polling
// client-side every POLL_INTERVAL_MS just catches each real refresh as
// soon as it lands instead of waiting for a full page reload.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchRates } from "@/lib/fetchRates";
import { resolveInstrumentPrice } from "@/lib/technicalAnalysis";
import { DEMO_LAB_INSTRUMENTS, getDemoLabInstrument } from "@/lib/demoTradingInstruments";
import { useDemoTrading } from "@/hooks/useDemoTrading";
import LiveChartPanel from "@/components/academy/lab/LiveChartPanel";
import ExecutionPanel from "@/components/academy/lab/ExecutionPanel";
import PositionsTable from "@/components/academy/lab/PositionsTable";
import TradeHistory from "@/components/academy/lab/TradeHistory";
import AccountSummaryBar from "@/components/academy/lab/AccountSummaryBar";
import BadgeCTA from "@/components/academy/lab/BadgeCTA";

const POLL_INTERVAL_MS = 30_000;
const MAX_CHART_POINTS = 500; // caps session memory for a long-open tab

function resolveAllPrices(ratesData) {
  const prices = {};
  for (const instrument of DEMO_LAB_INSTRUMENTS) {
    const price = resolveInstrumentPrice(instrument, ratesData);
    if (Number.isFinite(price)) prices[instrument.code] = price;
  }
  return prices;
}

export default function TradingLab() {
  const [selectedCode, setSelectedCode] = useState(DEMO_LAB_INSTRUMENTS[0].code);
  const [livePrices, setLivePrices] = useState({});
  const [priceError, setPriceError] = useState(null);
  const [activeView, setActiveView] = useState("positions"); // "positions" | "history"
  // Per-instrument accumulated session price history, for the chart —
  // never fabricated/backfilled, only ever appended to as real polls land.
  const priceHistoryRef = useRef({});
  const [priceHistoryVersion, setPriceHistoryVersion] = useState(0);

  const selectedInstrument = getDemoLabInstrument(selectedCode);

  const account = useDemoTrading(livePrices);

  const pollPrices = useCallback(async () => {
    try {
      const ratesData = await fetchRates({ noStore: true });
      const resolved = resolveAllPrices(ratesData);
      setLivePrices(resolved);
      setPriceError(null);

      const nowSeconds = Math.floor(Date.now() / 1000);
      for (const [code, price] of Object.entries(resolved)) {
        const history = priceHistoryRef.current[code] || [];
        const last = history[history.length - 1];
        // Skip duplicate points at the same second (lightweight-charts
        // requires strictly increasing time values per series).
        if (last && last.time >= nowSeconds) continue;
        const nextHistory = [...history, { time: nowSeconds, value: price }];
        if (nextHistory.length > MAX_CHART_POINTS) nextHistory.shift();
        priceHistoryRef.current[code] = nextHistory;
      }
      setPriceHistoryVersion((v) => v + 1);
    } catch {
      setPriceError("Couldn't refresh live prices right now — will retry automatically.");
    }
  }, []);

  useEffect(() => {
    pollPrices();
    const interval = setInterval(pollPrices, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollPrices]);

  // Auto-close any open position whose SL/TP has been touched, every
  // time a fresh price lands — mirrors a real broker's order engine.
  useEffect(() => {
    account.checkStopsAndTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrices]);

  const selectedPrice = livePrices[selectedCode];
  const selectedHistory = useMemo(
    () => priceHistoryRef.current[selectedCode] || [],
    // priceHistoryVersion is the dependency that actually changes on
    // each poll; selectedCode re-derives the slice when switching tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCode, priceHistoryVersion]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/learn" className="hover:text-brand-600">
              Academy
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Trading Lab</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Interactive Demo Trading Lab
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Practice opening and closing trades with a $10,000 virtual balance against real live
            prices — zero real-money risk. Not a real brokerage account, and not investment advice.
          </p>
          {priceError && (
            <p className="mt-3 inline-block rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
              {priceError}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <AccountSummaryBar account={account} onReset={account.resetAccount} />

        {/* Instrument switcher */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Instrument">
          {DEMO_LAB_INSTRUMENTS.map((instrument) => {
            const active = instrument.code === selectedCode;
            return (
              <button
                key={instrument.code}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCode(instrument.code)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {instrument.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LiveChartPanel
              instrument={selectedInstrument}
              price={selectedPrice}
              priceHistory={selectedHistory}
            />
          </div>
          <div className="lg:col-span-2">
            <ExecutionPanel
              instrument={selectedInstrument}
              price={selectedPrice}
              onOpenPosition={account.openPosition}
            />
          </div>
        </div>

        <BadgeCTA
          progress={account.riskManagerProgress}
          claimed={account.riskManagerBadgeClaimed}
          onClaim={account.claimRiskManagerBadge}
        />

        {/* Positions / History tabs */}
        <div>
          <div className="flex gap-2 border-b border-slate-200">
            {[
              { id: "positions", label: `Active Positions (${account.positions.length})` },
              { id: "history", label: `Trade History (${account.history.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  activeView === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {activeView === "positions" ? (
              <PositionsTable
                positions={account.positions}
                onClosePosition={(id) => account.closePosition(id)}
              />
            ) : (
              <TradeHistory history={account.history} stats={account.historyStats} />
            )}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Simulation only: starting balance, contract sizes, and leverage (1:100 flat across all
          instruments here) are simplified teaching conventions, not quoted real-broker terms. Live
          prices refresh roughly hourly via OmniFin&apos;s own rates feed, not tick-by-tick. Progress
          and badges are stored locally in this browser only.
        </p>
      </section>
    </div>
  );
}
