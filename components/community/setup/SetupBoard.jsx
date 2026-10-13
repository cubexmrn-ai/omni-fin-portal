"use client";

// components/community/setup/SetupBoard.jsx
//
// "Trade Setup Sharing Board" section of the Trader Community & Setup
// Hub: filter tabs (All / Forex / Metals & Commodities / Crypto /
// High R:R Setups), the "Post a Setup" trigger, and the card feed
// itself. Backed by hooks/useTradeSetups.js.

import { useMemo, useState } from "react";
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
    if (activeTab === "all") return setupsWithRR;
    if (activeTab === "highRR") {
      return setupsWithRR.filter((s) => Number.isFinite(s.rr) && s.rr >= HIGH_RR_THRESHOLD);
    }
    return setupsWithRR.filter((s) => s.assetClass === activeTab);
  }, [setupsWithRR, activeTab]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900">Trade Setup Sharing Board</h2>
        <PostSetupModal onSubmit={addSetup} />
      </div>

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
