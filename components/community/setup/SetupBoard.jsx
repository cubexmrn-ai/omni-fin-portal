"use client";

// components/community/setup/SetupBoard.jsx
//
// "Trade Setup Sharing Board" section of the Trader Community & Setup
// Hub: filter tabs (All / Forex / Metals & Commodities / Crypto /
// High R:R Setups), the "Post a Setup" trigger, and the card feed
// itself. Backed by hooks/useTradeSetups.js.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTradeSetups } from "@/hooks/useTradeSetups";
import {
  SETUP_FILTER_TABS,
  HIGH_RR_THRESHOLD,
  getAssetClass,
  computeRiskReward,
} from "@/lib/tradeSetupsData";
import SetupCard from "@/components/community/setup/SetupCard";
import PostSetupModal from "@/components/community/setup/PostSetupModal";

export default function SetupBoard() {
  const { hydrated, allSetups, addSetup } = useTradeSetups();
  const [activeTab, setActiveTab] = useState("all");
  // Supports a "?view=mine" link (e.g. the Dashboard's "Setups Shared"
  // tile) that jumps straight to this board filtered to only the
  // setups this browser has posted — read from window.location
  // directly in an effect rather than next/navigation's
  // useSearchParams, so this component never forces the page out of
  // static rendering / needs a Suspense boundary just for this link.
  const [viewMineOnly, setViewMineOnly] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setViewMineOnly(params.get("view") === "mine");
  }, []);

  const setupsWithRR = useMemo(
    () =>
      allSetups.map((setup) => ({
        ...setup,
        rr: computeRiskReward(setup.entry, setup.stopLoss, setup.takeProfit),
        assetClass: getAssetClass(setup.instrumentCode),
      })),
    [allSetups]
  );

  const filteredSetups = useMemo(() => {
    const base = viewMineOnly ? setupsWithRR.filter((s) => s.isUserSubmitted) : setupsWithRR;
    if (activeTab === "all") return base;
    if (activeTab === "highRR") {
      return base.filter((s) => Number.isFinite(s.rr) && s.rr >= HIGH_RR_THRESHOLD);
    }
    return base.filter((s) => s.assetClass === activeTab);
  }, [setupsWithRR, activeTab, viewMineOnly]);

  return (
    <section id="setup-board">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900">Trade Setup Sharing Board</h2>
        <PostSetupModal onSubmit={addSetup} />
      </div>

      {viewMineOnly && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <span>Showing only the setups you&apos;ve posted from this browser.</span>
          <Link href="/community#setup-board" className="font-semibold underline hover:text-blue-900">
            View all setups
          </Link>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Setup filters">
        {SETUP_FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)]"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!hydrated ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-card">
            Loading setups…
          </div>
        ) : filteredSetups.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-card">
            No setups match this filter yet.
          </div>
        ) : (
          filteredSetups.map((setup) => <SetupCard key={setup.id} setup={setup} rr={setup.rr} />)
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Seeded setups above are illustrative demo content, not real trader activity — anything you
        post yourself is real and stored locally in this browser. Nothing here is investment advice.
      </p>
    </section>
  );
}
