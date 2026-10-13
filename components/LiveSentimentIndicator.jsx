// components/LiveSentimentIndicator.jsx
//
// Tier 1 of app/ai-news/page.jsx: a live Buy/Sell (Bullish/Bearish)
// sentiment snapshot for Gold (XAU/USD), EUR/USD and Bitcoin (BTC/USD).
// A plain Server Component — `ratesData` is a getUnifiedRates() payload
// the page already fetched, and the score/label for each instrument is
// computed with the exact same rule-based engine
// (lib/technicalAnalysis.js's buildAnalysis()) that powers the
// on-demand AI Technical Analysis tool on /market-analysis, so this
// "live" sentiment is a real computation from real live prices, not a
// separate invented number. "Bullish"/"Bearish" below are a plain-
// English relabeling of that engine's Buy/Sell bands — see
// lib/technicalAnalysis.js's header comment for the full honesty note
// on what is and isn't genuinely computable here.

import {
  INSTRUMENT_BY_CODE,
  resolveInstrumentPrice,
  buildAnalysis,
  getAnalysisType,
} from "@/lib/technicalAnalysis";
import SentimentMeter from "@/components/SentimentMeter";

const TRACKED_CODES = ["XAU", "EURUSD", "BTC"];

const BAND_TO_SENTIMENT = {
  strong_sell: { label: "Bearish", tone: "text-rose-600 bg-rose-50 border-rose-200" },
  sell: { label: "Bearish", tone: "text-rose-600 bg-rose-50 border-rose-200" },
  neutral: { label: "Neutral", tone: "text-slate-500 bg-slate-100 border-slate-200" },
  buy: { label: "Bullish", tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  strong_buy: { label: "Bullish", tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

function scoreToBandKey(score) {
  if (score <= -60) return "strong_sell";
  if (score <= -20) return "sell";
  if (score < 20) return "neutral";
  if (score < 60) return "buy";
  return "strong_buy";
}

function SentimentCard({ instrument, ratesData }) {
  if (!instrument) return null;
  const price = resolveInstrumentPrice(instrument, ratesData);
  if (!Number.isFinite(price)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-slate-900">{instrument.label}</p>
        <p className="mt-2 text-xs text-slate-400">Live price unavailable right now.</p>
      </div>
    );
  }

  const analysisType = getAnalysisType("full_report");
  const analysis = buildAnalysis(instrument, analysisType, price, ratesData);
  const bandKey = scoreToBandKey(analysis.overallSentiment.score);
  const sentiment = BAND_TO_SENTIMENT[bandKey];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{instrument.label}</p>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${sentiment.tone}`}>
          {sentiment.label}
        </span>
      </div>
      <div className="mt-3">
        <SentimentMeter score={analysis.overallSentiment.score} compact />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        Overall Market Sentiment: {analysis.overallSentiment.label} — a rule-based blend of
        Technical Bias (range positioning) and Fundamental Bias (a simplified USD-strength
        proxy), not a trading recommendation.
      </p>
    </div>
  );
}

export default function LiveSentimentIndicator({ ratesData }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Live Market Sentiment</h2>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-500">
          Rule-based · Live prices
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        A live Bullish/Bearish read for Gold, EUR/USD and Bitcoin, computed from today&apos;s actual
        prices — see{" "}
        <a href="/market-analysis" className="underline hover:text-slate-600">
          Market Analysis
        </a>{" "}
        for the full report on any instrument.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TRACKED_CODES.map((code) => (
          <SentimentCard key={code} instrument={INSTRUMENT_BY_CODE[code]} ratesData={ratesData} />
        ))}
      </div>
    </section>
  );
}
