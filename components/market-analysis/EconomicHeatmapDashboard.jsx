// components/market-analysis/EconomicHeatmapDashboard.jsx
//
// "Macro Economic Heatmap & Impact Dial Dashboard" — replaces
// MacroSentimentEnginePanel on /market-analysis with an institutional-
// style terminal panel: an economic-release heatmap table, two impact
// gauge dials, and two compact asset-ranking tables.
//
// A DISCLOSED COMPROMISE, not a literal implementation of every
// requested label — read this before changing the data behind it:
//
//   1. Economic Data Heatmap Table: 5 of 7 rows (GDP, CPI YoY, PPI YoY,
//      Unemployment, Non-Farm Payrolls) are now real FRED (Federal
//      Reserve Economic Data) figures when FRED_API_KEY is configured
//      — see lib/economicHeatmap.js. The remaining two (Manufacturing/
//      Services PMI) stay PERMANENTLY illustrative: ISM doesn't
//      publish PMI data through FRED or any other free API, so
//      there's no live source for those two regardless of API key.
//      Without a key (or if a given row's fetch fails), every row
//      falls back to the original seeded, deterministic simulation
//      around realistic baselines, stable for a full UTC day. Each row
//      carries its own small "Live (FRED)"/"Illustrative" tag rather
//      than one blanket label for the whole table, since a deployment
//      can genuinely be in a mixed state.
//
//   2. Impact Gauge Dials: "USD Index Impact" is REAL — it's
//      computeUsdStrengthScore() (lib/technicalAnalysis.js), the same
//      live EUR/USD, GBP/USD, AUD/USD positioning math already used
//      elsewhere on the site. The second dial was requested as "Macro
//      Stocks / Gold Impact", but this codebase has no stock-index
//      data source at all (see lib/technicalAnalysis.js's
//      INSTRUMENT_OPTIONS — no SPX500/equity feed exists here), so
//      it's honestly relabeled "Commodities & Gold Impact" and driven
//      by the real average score across Gold/Silver/Crude Oil,
//      instead of fabricating a stock-market number with nothing
//      behind it.
//
//   3. Asset Macro Scores tables: SPX500 and USDCHF were requested but
//      have no live feed in this deployment either (no equity-index
//      data, and USDCHF isn't one of the tracked FX pairs). Rather
//      than drop them silently (which would look broken against the
//      requested layout) or fake a number, they're shown as explicit
//      "No live feed" rows — honest, and still reads as a complete,
//      intentional table rather than a gap.
//
// Every other figure here — the 7 asset rankings, both gauge scores —
// is the exact same real buildAnalysis() overallSentiment.score used
// everywhere else on the site (lib/marketPulse.js's getInstrumentPulses(),
// just called with a different instrument list than the 5-instrument
// pulse bar).

import { getEconomicHeatmapSnapshot } from "@/lib/economicHeatmap";
import { getInstrumentPulses, formatFetchedAt } from "@/lib/marketPulse";
import { computeUsdStrengthScore } from "@/lib/technicalAnalysis";
import SentimentGaugeDial from "@/components/market-pulse/SentimentGaugeDial";

const SURPRISE_TONE = {
  up: "text-emerald-600",
  down: "text-rose-600",
  flat: "text-slate-500",
};

const IMPACT_BADGE = {
  Bullish: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Bearish: "bg-rose-50 text-rose-700 border-rose-200",
  Neutral: "bg-slate-100 text-slate-500 border-slate-200",
};

function ImpactBadge({ impact }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        IMPACT_BADGE[impact] || IMPACT_BADGE.Neutral
      }`}
    >
      {impact}
    </span>
  );
}

function RowSourceTag({ row }) {
  const isLive = row.source === "fred";
  return (
    <span
      className={`ml-2 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
        isLive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-slate-400"
      }`}
      title={
        isLive
          ? `Live — ${row.impactBasis}.`
          : row.fredError
          ? `Illustrative — FRED fetch failed (${row.fredError}); showing the deterministic simulation instead.`
          : `Illustrative — ${row.impactBasis}.`
      }
    >
      {isLive ? "Live · FRED" : "Illustrative"}
    </span>
  );
}

function EconomicHeatmapTable({ rows, asOf, liveCount, totalCount }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink/60 p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Economic Data Heatmap</h3>
        <span
          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          title={`${liveCount} of ${totalCount} rows are live FRED figures right now; the rest are an illustrative dataset generated daily (as of ${asOf}). Manufacturing/Services PMI stay illustrative permanently — see the TradingView Economic Calendar below for real scheduled releases.`}
        >
          {liveCount} of {totalCount} live
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Economic Data Metric</th>
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Surprise</th>
              <th className="py-2 pr-3">Actual</th>
              <th className="py-2 pr-3">Forecast</th>
              <th className="py-2 pr-3">Previous</th>
              <th className="py-2 pr-3">USD Impact</th>
              <th className="py-2">Stocks/Gold Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-3 font-semibold text-slate-200">
                  {row.metric}
                  <RowSourceTag row={row} />
                </td>
                <td className="py-2 pr-3 font-mono text-slate-400">{row.date}</td>
                <td className={`py-2 pr-3 font-mono font-semibold ${SURPRISE_TONE[row.surpriseDirection]}`}>
                  {row.surprise}
                </td>
                <td className="py-2 pr-3 font-mono text-slate-200">{row.actual}</td>
                <td className="py-2 pr-3 font-mono text-slate-400">{row.forecast}</td>
                <td className="py-2 pr-3 font-mono text-slate-500">{row.previous}</td>
                <td className="py-2 pr-3">
                  <ImpactBadge impact={row.usdImpact} />
                </td>
                <td className="py-2">
                  <ImpactBadge impact={row.stocksGoldImpact} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Rows tagged <span className="font-semibold text-emerald-400">Live · FRED</span> are
        real Federal Reserve Economic Data releases — Forecast reads
        &quot;—&quot; on those rows because FRED publishes actual figures, not a
        consensus forecast, so Surprise/Impact there compare against the
        previous release instead. Rows tagged{" "}
        <span className="font-semibold text-slate-400">Illustrative</span> (always
        Manufacturing/Services PMI, and any other row without FRED_API_KEY
        configured or whose fetch failed) are a deterministic daily
        simulation around realistic baselines, not real releases. For real
        scheduled releases regardless of source, see the TradingView
        Economic Calendar further down this page.
      </p>
    </div>
  );
}

function ImpactDial({ label, score }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-ink/60 p-4 shadow-card">
      <SentimentGaugeDial score={score} size={176} instrumentLabel={label} />
    </div>
  );
}

const RANKING_TONE = (score) => {
  if (score >= 60) return "text-emerald-400";
  if (score >= 20) return "text-emerald-300";
  if (score > -20) return "text-slate-300";
  if (score > -60) return "text-rose-300";
  return "text-rose-400";
};

function RankingTable({ title, entries }) {
  const ranked = [...entries].sort((a, b) => {
    if (a.score == null) return 1;
    if (b.score == null) return -1;
    return b.score - a.score;
  });

  return (
    <div className="rounded-xl border border-white/10 bg-ink/60 p-4 shadow-card">
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h4>
      <ul className="mt-3 space-y-2">
        {ranked.map((entry) => (
          <li key={entry.code} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-200">{entry.displayLabel}</span>
            {entry.score == null ? (
              <span
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                title="No live price feed for this instrument in this deployment."
              >
                No live feed
              </span>
            ) : (
              <span className={`font-mono text-sm font-bold ${RANKING_TONE(entry.score)}`}>
                {entry.score > 0 ? "+" : ""}
                {Math.round(entry.score)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Real-instrument-code -> the requested display ticker for this
// dashboard (e.g. WTI's real code maps to "USOIL" here, matching how
// the request named it) — presentation only, not a second data source.
const DISPLAY_LABEL = {
  XAU: "GOLD",
  XAG: "SILVER",
  WTI: "USOIL",
  EURUSD: "EURUSD",
  GBPUSD: "GBPUSD",
  USDJPY: "USDJPY",
};

export default async function EconomicHeatmapDashboard({ ratesData }) {
  const heatmap = await getEconomicHeatmapSnapshot();

  const usdImpactScore = computeUsdStrengthScore(ratesData);

  const commodityPulses = getInstrumentPulses(ratesData, ["XAU", "XAG", "WTI"]);
  const commoditiesImpactScore =
    commodityPulses.length > 0
      ? commodityPulses.reduce((sum, p) => sum + p.score, 0) / commodityPulses.length
      : 0;

  const commodityRows = ["XAU", "XAG", "WTI"].map((code) => {
    const pulse = commodityPulses.find((p) => p.code === code);
    return { code, displayLabel: DISPLAY_LABEL[code], score: pulse ? pulse.score : null };
  });
  commodityRows.push({ code: "SPX500", displayLabel: "SPX500", score: null });

  const fxPulses = getInstrumentPulses(ratesData, ["USDJPY", "EURUSD", "GBPUSD"]);
  const fxRows = ["EURUSD", "GBPUSD", "USDJPY"].map((code) => {
    const pulse = fxPulses.find((p) => p.code === code);
    return { code, displayLabel: DISPLAY_LABEL[code], score: pulse ? pulse.score : null };
  });
  fxRows.push({ code: "USDCHF", displayLabel: "USDCHF", score: null });

  // AUDIT FIX: the heatmap table above already carries its own daily
  // "Illustrative" asOf tag — a different concept (a once-a-day
  // simulated bucket). This is the real rates payload's own fetch
  // timestamp, covering everything below that's actually live
  // (both dials, both ranking tables).
  const freshnessLabel = formatFetchedAt(ratesData?.fetchedAt);

  return (
    <div className="space-y-5">
      <EconomicHeatmapTable
        rows={heatmap.rows}
        asOf={heatmap.asOf}
        liveCount={heatmap.liveCount}
        totalCount={heatmap.totalCount}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RankingTable title="Asset Macro Scores · Commodities" entries={commodityRows} />
          <RankingTable title="Asset Macro Scores · FX" entries={fxRows} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImpactDial label="USD Index Impact" score={usdImpactScore} />
          <ImpactDial label="Commodities & Gold Impact" score={commoditiesImpactScore} />
        </div>
      </div>

      {freshnessLabel && (
        <p className="text-right text-[11px] text-slate-500">
          Live data (dials & rankings) as of {freshnessLabel}
        </p>
      )}
    </div>
  );
}
