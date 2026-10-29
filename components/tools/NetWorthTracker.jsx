"use client";

// components/tools/NetWorthTracker.jsx
//
// Phase 1 of the pSEO calculator-corridor roadmap (Oct 30 2026),
// scoped down deliberately: NOT a full history/journal feature with
// server-side storage and a time series (that would duplicate what
// app/journal already does for trades/assets) — this is a simple,
// one-page snapshot calculator. Add asset and liability line items,
// see assets minus liabilities as net worth, and optionally save the
// snapshot to this browser's localStorage so it's there next visit.
//
// localStorage is used here for exactly the "light per-viewer
// convenience" case the project's artifact/browser-storage guidance
// describes: it belongs to one visitor's one browser, can come back
// empty, and throws in some contexts (private windows, blocked site
// data) — so every read/write is wrapped in try/catch and the
// calculator works correctly even if storage is unavailable (it just
// won't remember between visits). Nothing here is shared between
// visitors or read back by the server; the on-page numbers are always
// the live source of truth, not whatever's in storage.

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateNetWorth } from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const STORAGE_KEY = "omnifin_net_worth_snapshot_v1";

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

function makeId() {
  return `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_ASSETS = [
  { id: makeId(), label: "Cash & Savings", amount: 5000 },
  { id: makeId(), label: "Investments", amount: 10000 },
];
const DEFAULT_LIABILITIES = [{ id: makeId(), label: "Credit Card / Loans", amount: 2000 }];

function RowList({ title, rows, setRows, addLabel }) {
  function updateRow(id, field, value) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }
  function removeRow(id) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }
  function addRow() {
    setRows((prev) => [...prev, { id: makeId(), label: "", amount: "" }]);
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-600">{title}</h3>
      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Label"
              value={row.label}
              onChange={(e) => updateRow(row.id, "label", e.target.value)}
              className="w-1/2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="number"
              step="any"
              placeholder="Amount"
              value={row.amount}
              onChange={(e) => updateRow(row.id, "amount", e.target.value)}
              className="w-1/3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600"
              aria-label={`Remove ${row.label || "row"}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
      >
        {addLabel}
      </button>
    </div>
  );
}

export default function NetWorthTracker() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState(DEFAULT_LIABILITIES);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saved" | "error"
  const hasHydrated = useRef(false);

  // Load any previously-saved snapshot once, on mount only.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.assets) && Array.isArray(parsed?.liabilities)) {
          setAssets(parsed.assets);
          setLiabilities(parsed.liabilities);
          setLoadedFromStorage(true);
        }
      }
    } catch {
      // Storage unavailable or corrupted — silently fall back to defaults.
    }
    hasHydrated.current = true;
  }, []);

  const result = useMemo(() => calculateNetWorth({ assets, liabilities }), [assets, liabilities]);

  useTrackCalculation(
    "calculate_net_worth",
    hasHydrated.current ? `${result.totalAssets}:${result.totalLiabilities}` : null,
    { tool_name: "net_worth_tracker" }
  );

  function handleSave() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ assets, liabilities }));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 2500);
  }

  return (
    <div className="space-y-6">
      {loadedFromStorage && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-700">
          Loaded your previously-saved snapshot from this browser.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Assets &amp; Liabilities</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Add every account, asset, or debt you want included.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2">
          <RowList title="Assets" rows={assets} setRows={setAssets} addLabel="+ Add asset" />
          <RowList
            title="Liabilities"
            rows={liabilities}
            setRows={setLiabilities}
            addLabel="+ Add liability"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Your Net Worth</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Assets
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatNumber(result.totalAssets)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Liabilities
            </p>
            <p className="mt-1 text-xl font-bold text-rose-600">
              {formatNumber(result.totalLiabilities)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Net Worth</p>
            <p
              className={`mt-1 text-2xl font-extrabold ${
                result.netWorth >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {formatNumber(result.netWorth)}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Save snapshot to this browser
          </button>
          {saveStatus === "saved" && (
            <span className="ml-3 text-xs font-semibold text-emerald-700">Saved ✓</span>
          )}
          {saveStatus === "error" && (
            <span className="ml-3 text-xs font-semibold text-rose-600">
              Couldn&apos;t save — your browser may be blocking storage.
            </span>
          )}
          <p className="mt-2 text-[11px] text-slate-400">
            Saved only in this browser, on this device — nothing is sent to OmniFin Portal or
            shared anywhere else. Clearing your browser data will remove it.
          </p>
        </div>
      </div>
    </div>
  );
}
