// app/api/market-ai/route.js
//
// On-demand technical analysis for the Market Analysis page's "AI
// Technical Analysis" panel. GET /api/market-ai?symbol=XAU&analysisType=full_report
//
// Always returns the full rule-based report (Buy/Sell/Neutral meter,
// Technical/Fundamental/Overall bias, Price Action, Support/Resistance,
// Pivot Points, Oscillators) — `analysisType` of "fibonacci" or "gann"
// additionally includes that one extra deep-dive section. See the big
// comment at the top of lib/technicalAnalysis.js for exactly what's
// genuinely computed vs. explicitly labeled illustrative/unavailable.
//
// DELIBERATELY NOT WIRED TO AN LLM, even though GEMINI_API_KEY and/or
// ANTHROPIC_API_KEY may be configured for this deployment's other
// features (YouTube video insights, the macro sentiment engine,
// headline summaries). Those features ask an LLM to write prose
// around numbers that are already computed elsewhere; this endpoint's
// job is the numbers themselves (support/resistance, pivots,
// oscillator reads) — asking an LLM to produce those directly risks it
// fabricating a specific price level that was never actually computed
// from live data, which is a materially different (and worse) kind of
// mistake than a stale cache or a mock badge. generateAiAnalysis()
// below is a documented, intentionally-not-implemented hook for a
// future design (e.g. an LLM writing color commentary ONLY around
// numbers buildAnalysis() already computed, never inventing its own)
// rather than a real API call: this route always falls through to the
// rule-based analysis below, regardless of which keys are configured,
// so a key being set never breaks this route or produces a
// silently-wrong response.
//
// The rule-based path (lib/technicalAnalysis.js) computes a genuinely
// live, structured summary from the SAME unified rates payload
// (lib/marketData.js's getUnifiedRates(), called directly — no
// self-fetch, same architectural lesson as lib/newsAggregator.js) used
// everywhere else in this project. It is explicit in the response about
// what it could and couldn't honestly calculate from a single live
// price with no stored historical series — see the big comment at the
// top of lib/technicalAnalysis.js.

import { getUnifiedRates } from "@/lib/marketData";
import {
  getInstrument,
  getAnalysisType,
  resolveInstrumentPrice,
  buildAnalysis,
  INSTRUMENT_OPTIONS,
  ANALYSIS_TYPES,
} from "@/lib/technicalAnalysis";
import { fetchCandles } from "@/lib/candleData";

// TODO (once ANTHROPIC_API_KEY is configured and this feature is
// scoped in): call the Claude API (Messages API) here with the live
// price + instrument/analysisType context and return a genuinely
// AI-written technical read, with `usingAi: true` in the response.
// Until then this always throws, so GET() below falls through to the
// rule-based path every time — a configured key changes nothing yet,
// it's just the integration point this is left ready for.
async function generateAiAnalysis() {
  throw new Error("AI analysis not implemented yet");
}

// Already dynamic in practice (reads request.url's searchParams below),
// but declared explicitly for consistency with every other route in
// app/api after /api/sentiment-engine's build-time timeout.
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get("symbol") || "XAU";
    const analysisTypeParam = searchParams.get("analysisType") || "full_report";

    const instrument = getInstrument(symbolParam);
    const analysisType = getAnalysisType(analysisTypeParam);

    if (!instrument) {
      return Response.json(
        {
          error: `Unknown symbol "${symbolParam}".`,
          supportedSymbols: INSTRUMENT_OPTIONS.map((i) => i.code),
        },
        { status: 400 }
      );
    }
    if (!analysisType) {
      return Response.json(
        {
          error: `Unknown analysisType "${analysisTypeParam}".`,
          supportedAnalysisTypes: ANALYSIS_TYPES.map((a) => a.key),
        },
        { status: 400 }
      );
    }

    const ratesData = await getUnifiedRates();
    const price = resolveInstrumentPrice(instrument, ratesData);

    if (!Number.isFinite(price)) {
      return Response.json(
        {
          error: `No live price available for ${instrument.label} right now.`,
          symbol: instrument.code,
        },
        { status: 503 }
      );
    }

    // Real intraday OHLC candles (lib/candleData.js: Twelve Data →
    // Alpha Vantage → null), fetched here (the one place this route's
    // async-ness can actually be used) and passed into buildAnalysis()
    // as a plain optional argument — never awaited inside that
    // function, which stays synchronous for its other callers (see
    // buildAnalysis()'s own header comment). A failed/unavailable fetch
    // resolves to `null`, and buildAnalysis() already treats `null`
    // exactly like "no candle data" — never a thrown error reaching
    // this route's try/catch.
    const candles = await fetchCandles(instrument);

    // See the header comment above generateAiAnalysis(): this always
    // throws by design, so `analysis` is always the rule-based path —
    // regardless of which AI provider keys happen to be configured for
    // this deployment's other features.
    let usingAi = false;
    let analysis;
    try {
      analysis = await generateAiAnalysis({ instrument, analysisType, price, ratesData });
      usingAi = true;
    } catch {
      analysis = buildAnalysis(instrument, analysisType, price, ratesData, candles);
    }

    return Response.json(
      {
        symbol: instrument.code,
        label: instrument.label,
        analysisType: analysisType.key,
        analysisLabel: analysisType.label,
        price,
        generatedAt: new Date().toISOString(),
        usingLiveCandles: Boolean(candles),
        candleSource: candles?.source || null,
        usingAi,
        engineNote: usingAi
          ? "Generated by an AI provider."
          : "Rule-based summary computed directly from the current live price — this calculator intentionally never asks an AI model to generate price levels, to avoid any risk of a fabricated number.",
        ...analysis,
      },
      { status: 200 }
    );
  } catch (err) {
    // Last-resort guarantee this route always returns valid JSON, never
    // Next.js's default HTML error page — same pattern as
    // app/api/rates/route.js and app/api/news-ai/route.js.
    return Response.json(
      { error: `market-ai route failed unexpectedly: ${err.message || "unknown error"}` },
      { status: 200 }
    );
  }
}
