"use client";

// components/market-analysis/CorrelationMatrix.jsx
//
// PHASE 3 ADDITION — client-side asset correlation card (Gold vs. DXY
// vs. Crude Oil vs. Bitcoin).
//
// HONESTY NOTE (same bar as everywhere else in this project — see
// AiTechnicalAnalysis's RSI/Moving Averages sections, or
// EconomicHeatmapDashboard's header comment): a real Pearson
// correlation needs a TIME SERIES of returns, and this project has no
// historical price database — every other live figure on the site is
// a single current snapshot (see lib/technicalAnalysis.js's own notes
// on why RSI/Moving Averages are marked "unavailable" rather than
// faked for the exact same reason). So rather than invent a plausible-
// looking correlation table from nothing, this card BUILDS ONE FOR
// REAL: every time this component is mounted (a page visit), it
// fetches one live snapshot from this project's own /api/rates feed
// and appends it to a rolling, localStorage-persisted sample buffer
// (capped at 60 samples) — a genuine, growing history made entirely
// from this browser's own real visits, with zero new API/scraping
// infrastructure (just the same /api/rates call every converter and
// calculator on the site already makes). Once there are enough
// samples, real Pearson correlation is computed on their period-over-
// period % returns. Until then, the card says exactly how many more
// samples it needs — never a placeholder number.
//
// This is deliberately labeled "Live Session Correlation," not
// "Historical Correlation" — it reflects actual price co-movement
// this browser has actually observed, but over a much shorter and
// patchier window than an institutional correlation desk would use.

import { useEffect, useState } from "react";
import { fetchRates } from "@/lib/fetchRates";
import { computeDxyProxy } from "@/lib/dxyProxy";

const STORAGE_KEY = "omnifin.correlation.samples.v1";
const MAX_SAMPLES = 60;
const MIN_SAMPLES_FOR_CORRELATION = 8; // -> 7 period-over-period returns per pair
const POLL_INTERVAL_MS = 90_000; // a new sample every 90s while this page stays open

const ASSETS = [
  { key: "XAU", label: "Gold" },
  { key: "DXY", label: "DXY (proxy)" },
  { key: "WTI", label: "Oil (WTI)" },
  { key: "BTC", label: "Bitcoin" },
];

function readSamples() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSamples(samples) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch {
    // Best-effort only — the in-memory state for this visit still works.
  }
}

function sampleFromRates(ratesData) {
  if (!ratesData) return null;
  const xau = ratesData.metals?.XAU;
  const wti = ratesData.commodities?.WTI;
  const btc = ratesData.crypto?.BTC;
  const dxy = computeDxyProxy(ratesData);
  if (![xau, wti, btc, dxy].every((v) => Number.isFinite(v))) return null;
  return { t: Date.now(), XAU: xau, WTI: wti, BTC: btc, DXY: dxy };
}

/** Pearson correlation of two equal-length numeric arrays. */
function pearson(a, b) {
  const n = a.length;
  if (n < 2) return null;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA === 0 || varB === 0) return null;
  return cov / Math.sqrt(varA * varB);
}

/** Period-over-period % returns for one asset across the sample buffer. */
function returnsFor(samples, key) {
  const out = [];
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1][key];
    const curr = samples[i][key];
    if (Number.isFinite(prev) && Number.isFinite(curr) && prev !== 0) {
      out.push((curr - prev) / prev);
    }
  }
  return out;
}

function cellTone(value) {
  if (value === null) return "bg-slate-800/40 text-slate-500";
  if (value >= 0.6) return "bg-emerald-500/30 text-emerald-200";
  if (value >= 0.2) return "bg-emerald-500/10 text-emerald-300";
  if (value <= -0.6) return "bg-rose-500/30 text-rose-200";
  if (value <= -0.2) return "bg-rose-500/10 text-rose-300";
  return "bg-white/5 text-slate-300";
}

export default function CorrelationMatrix({ initialRatesData }) {
  const [samples, setSamples] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = readSamples();
    const firstSample = sampleFromRates(initialRatesData);
    const next = firstSample ? [...existing, firstSample].slice(-MAX_SAMPLES) : existing;
    writeSamples(next);
    setSamples(next);
    setHydrated(true);

    const interval = setInterval(async () => {
      try {
        const rates = await fetchRates({ noStore: true });
        const sample = sampleFromRates(rates);
        if (!sample) return;
        setSamples((prev) => {
          const updated = [...prev, sample].slice(-MAX_SAMPLES);
          writeSamples(updated);
          return updated;
        });
      } catch {
        // Best-effort live polling — a failed refresh just means no new
        // sample this cycle, never a crash or a dropped existing sample.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) return null;

  const ready = samples.length >= MIN_SAMPLES_FOR_CORRELATION;

  const returnsByAsset = ready
    ? ASSETS.reduce((acc, a) => {
        acc[a.key] = returnsFor(samples, a.key);
        return acc;
      }, {})
    : null;

  return (
    <div className="rounded-xl border border-white/10 bg-ink/60 p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">Live Session Correlation</h2>
        <span
          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          title="Built entirely from real price samples this browser has collected on actual visits to this page (localStorage), not an invented or historical-database correlation. See the explanation below."
        >
          {samples.length} sample{samples.length === 1 ? "" : "s"} collected
        </span>
      </div>

      {!ready ? (
        <p className="mt-3 text-sm text-slate-400">
          Gathering live samples — {samples.length} of {MIN_SAMPLES_FOR_CORRELATION} needed before a
          real correlation can be computed. Keep this page open (a new sample is taken every 90
          seconds) or revisit later; samples persist in this browser across visits.
        </p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[380px] border-collapse text-center text-xs">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {ASSETS.map((a) => (
                    <th key={a.key} className="p-1.5 font-semibold text-slate-400">
                      {a.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((rowAsset) => (
                  <tr key={rowAsset.key}>
                    <th className="p-1.5 text-right font-semibold text-slate-400">{rowAsset.label}</th>
                    {ASSETS.map((colAsset) => {
                      const value =
                        rowAsset.key === colAsset.key
                          ? 1
                          : pearson(returnsByAsset[rowAsset.key], returnsByAsset[colAsset.key]);
                      return (
                        <td
                          key={colAsset.key}
                          className={`rounded-md p-1.5 font-mono font-bold ${cellTone(value)}`}
                        >
                          {value === null ? "—" : value.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Pearson correlation of period-over-period % price changes across{" "}
            {samples.length} live samples collected in this browser (not an official, long-window
            historical correlation). +1.00 = moves together; −1.00 = moves opposite; near 0 = little
            relationship so far.
          </p>
        </>
      )}
    </div>
  );
}
