"use client";

// components/dashboard/PresetsCard.jsx
//
// "Saved Conversion & Calculator Presets" dashboard tile. Shows the
// one real site-wide preference that already existed (Base Currency —
// lib/baseCurrencyContext.js, set from the header dropdown) plus three
// new quick presets (favorited currency pair, default lot size,
// preferred metal) that the person sets right here and which persist
// via hooks/useDashboardPresets.js — there was no prior favorites/
// presets system anywhere in the project to merely surface, so these
// are genuinely the person's own saved choices, not invented defaults.

import { useState } from "react";
import Link from "next/link";
import { METAL_ASSETS } from "@/lib/metals";

/** "EUR/USD" -> "eur-to-usd", matching app/converters/[pair]/page.jsx's
 * slug format — only when the input actually looks like a pair;
 * otherwise falls back to the plain /converters hub. */
function pairToConverterHref(pair) {
  const match = /^([a-zA-Z]{2,5})\s*\/\s*([a-zA-Z]{2,5})$/.exec(pair || "");
  if (!match) return "/converters";
  return `/converters/${match[1].toLowerCase()}-to-${match[2].toLowerCase()}`;
}

function PresetRow({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 py-2.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children || <span className="text-sm font-bold text-white">{value}</span>}
    </div>
  );
}

export default function PresetsCard({ baseCurrency, presets }) {
  const [pairInput, setPairInput] = useState("");
  const [lotInput, setLotInput] = useState("");

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Quick Access</p>
      <h3 className="mt-0.5 text-lg font-extrabold text-white">Saved Presets</h3>

      <div className="mt-3">
        <PresetRow label="Base Currency" value={baseCurrency} />

        <PresetRow label="Favorite Pair">
          {presets.favoritePair ? (
            <Link
              href={pairToConverterHref(presets.favoritePair)}
              className="text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              {presets.favoritePair} →
            </Link>
          ) : (
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (pairInput.trim()) presets.setFavoritePair(pairInput.trim().toUpperCase());
              }}
            >
              <input
                type="text"
                value={pairInput}
                onChange={(e) => setPairInput(e.target.value)}
                placeholder="EUR/USD"
                className="w-24 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
              >
                Save
              </button>
            </form>
          )}
        </PresetRow>

        <PresetRow label="Default Lot Size">
          {presets.defaultLotSize ? (
            <button
              type="button"
              onClick={() => presets.setDefaultLotSize(null)}
              title="Click to change"
              className="text-sm font-bold text-white hover:text-blue-300"
            >
              {presets.defaultLotSize}
            </button>
          ) : (
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (lotInput.trim()) presets.setDefaultLotSize(lotInput.trim());
              }}
            >
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={lotInput}
                onChange={(e) => setLotInput(e.target.value)}
                placeholder="0.10"
                className="w-20 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
              >
                Save
              </button>
            </form>
          )}
        </PresetRow>

        <PresetRow label="Preferred Metal">
          {presets.preferredMetal ? (
            <button
              type="button"
              onClick={() => presets.setPreferredMetal(null)}
              title="Click to change"
              className="text-sm font-bold text-white hover:text-blue-300"
            >
              {METAL_ASSETS.find((m) => m.code === presets.preferredMetal)?.name || presets.preferredMetal}
            </button>
          ) : (
            <select
              defaultValue=""
              onChange={(e) => e.target.value && presets.setPreferredMetal(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                Choose…
              </option>
              {METAL_ASSETS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </PresetRow>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/converters"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Converters →
        </Link>
        <Link
          href="/calculators"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:border-slate-600 hover:bg-slate-700"
        >
          Calculators →
        </Link>
      </div>
    </div>
  );
}
