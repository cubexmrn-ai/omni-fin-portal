"use client";

// components/UniversalSmartSearch.jsx
//
// Universal natural-language smart search bar for the homepage hero
// (components/HomeSections.jsx's <Hero/>) — a single input that
// recognizes three kinds of real queries people actually type and
// shows an instant, actionable result panel, without a server round
// trip for the parsing itself:
//
//   1. Currency/amount queries ("2000 AED to PKR", "100 usd in pkr")
//      -> live converted estimate + a button straight to that exact
//      pSEO page (/converters/<amount>-<from>-to-<to>, see
//      lib/pairSlugs.js's parseAmountPairSlug/buildAmountPairSlug).
//   2. Zakat/gold queries ("Zakat on 10 Tola Gold")
//      -> a live gold-nisab quick reference + a button to that exact
//      Zakat Gold pSEO page (/converters/zakat-on-<N>-tola-gold).
//   3. Tool-intent queries ("compress image", "json formatter")
//      -> fuzzy keyword match against every /tools/* page, shown as
//      launcher buttons.
//
// RATES: fetched once on mount via the exact same lib/fetchRates.js +
// lib/assetConversion.js pattern components/CurrencyConverter.jsx
// already uses (ZERO new data source) — every currency estimate here
// is `convertBetweenAssets()` against that one payload, never a
// fabricated or hardcoded number. If the fetch hasn't resolved yet (or
// failed), the currency result panel still shows the parsed intent and
// the direct link to the full pSEO page — it just omits the live
// estimate rather than showing a wrong one.
//
// INTENT PARSING: deliberately a handful of small, readable regexes
// rather than a fuzzy NLP library (there's no npm registry access in
// this project's sandbox — see app/converters/[pair]/opengraph-image.jsx's
// header comment for the same constraint hitting next/og) — this
// covers the three query shapes the person actually asked for without
// a new dependency.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchRates } from "@/lib/fetchRates";
import { convertBetweenAssets, getAssetMeta } from "@/lib/assetConversion";
import { CURRENCY_CODES } from "@/lib/currencies";
import { CRYPTO_CODES } from "@/lib/crypto";
import { METAL_CODES } from "@/lib/metals";
import { buildAmountPairSlug, buildZakatGoldSlug } from "@/lib/pairSlugs";
import { formatNumber } from "@/lib/formatNumber";
import { calculateZakat, NISAB_GOLD_GRAMS } from "@/lib/zakatCalculator";
import { WEIGHT_UNITS } from "@/lib/conversionMath";
import { trackEvent } from "@/lib/gtag";

const FIAT_SET = new Set(CURRENCY_CODES);
const CRYPTO_SET = new Set(CRYPTO_CODES);
const METAL_SET = new Set(METAL_CODES);

function resolveAssetClass(code) {
  if (FIAT_SET.has(code)) return "fiat";
  if (CRYPTO_SET.has(code)) return "crypto";
  if (METAL_SET.has(code)) return "metals";
  return null;
}

// Tool-intent catalog — one entry per /tools/* page, with the phrases
// a visitor would plausibly type. Matching is substring-based against
// the normalized query (see matchTools below), not exact phrase
// equality, so "compress my image" still matches "compress image".
const TOOL_INTENTS = [
  { href: "/tools/document-summarizer", label: "AI Document Summarizer", keywords: ["summarize document", "document summarizer", "summarize text", "ai summarizer", "summarize"] },
  { href: "/tools/pdf-table-extractor", label: "PDF Table Extractor", keywords: ["pdf table", "extract pdf", "pdf to csv", "pdf table extractor", "extract table"] },
  { href: "/tools/image-compressor", label: "Image Compressor & Resizer", keywords: ["compress image", "image compressor", "resize image", "shrink image", "compress photo"] },
  { href: "/tools/json-formatter", label: "JSON Formatter & Validator", keywords: ["json formatter", "format json", "validate json", "json validator", "json"] },
  { href: "/tools/password-generator", label: "Secure Password Generator", keywords: ["password generator", "generate password", "secure password", "random password"] },
  { href: "/tools/word-counter", label: "Word & Character Counter", keywords: ["word counter", "count words", "character counter", "word count"] },
  { href: "/tools/case-converter", label: "Case Converter & Slugify Tool", keywords: ["case converter", "uppercase", "lowercase", "slugify", "slug"] },
  { href: "/tools/base64-encoder", label: "Base64 Encoder & Decoder", keywords: ["base64", "encode base64", "decode base64"] },
  { href: "/tools/markdown-editor", label: "Live Markdown Editor", keywords: ["markdown editor", "markdown preview", "markdown"] },
  { href: "/tools/gold-jewellery-calculator", label: "Gold & Jewellery Calculator", keywords: ["gold calculator", "jewellery calculator", "gold price calculator", "making charges"] },
  { href: "/tools/loan-emi-tax-calculator", label: "Loan EMI & Tax Calculator", keywords: ["loan emi", "emi calculator", "salary tax", "tax calculator", "loan calculator"] },
  { href: "/tools/savings-inflation-calculator", label: "Savings & Inflation Calculator", keywords: ["savings calculator", "inflation calculator", "savings inflation"] },
  { href: "/tools/zakat-calculator", label: "Zakat Calculator", keywords: ["zakat calculator", "nisab calculator"] },
];

/** Currency/amount intent: "<amount> <code> to|in <code>" */
function matchCurrency(normalized) {
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-z]{2,6})\s+(?:to|in)\s+([a-z]{2,6})$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const fromCode = match[2].toUpperCase();
  const toCode = match[3].toUpperCase();
  const fromClass = resolveAssetClass(fromCode);
  const toClass = resolveAssetClass(toCode);
  if (!fromClass || !toClass) return null;

  const from = getAssetMeta(fromClass, fromCode);
  const to = getAssetMeta(toClass, toCode);
  if (!from || !to) return null;

  return { kind: "currency", amount, fromClass, fromCode, from, toClass, toCode, to };
}

/** Zakat/gold intent: a tola/gram amount somewhere near "gold", with
 * "zakat" appearing anywhere in the query (so "zakat on 10 tola gold",
 * "10 tola gold zakat", and "zakat 10 tola gold" all match). */
function matchZakatGold(normalized) {
  if (!/zakat/.test(normalized)) return null;

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(tola|tolas|gram|grams|g)\b.*gold|gold.*?(\d+(?:\.\d+)?)\s*(tola|tolas|gram|grams|g)\b/i);
  if (!match) return null;

  const amountStr = match[1] || match[3];
  const unit = (match[2] || match[4] || "").toLowerCase();
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const isTola = unit.startsWith("tola");
  const tolaAmount = isTola ? amount : amount / WEIGHT_UNITS.tola;
  const grams = isTola ? amount * WEIGHT_UNITS.tola : amount;

  return { kind: "zakat", tolaAmount, grams };
}

/** Tool intent: substring match against TOOL_INTENTS' keyword lists,
 * scored by keyword length so a more specific phrase match (e.g.
 * "image compressor") outranks a shorter, noisier one (e.g. "json"
 * matching inside some unrelated longer query). Returns the single
 * best-matching tool, wrapped in an array for ToolsResult's map(). */
function matchTools(normalized) {
  let best = null;
  let bestLen = 0;
  for (const tool of TOOL_INTENTS) {
    for (const kw of tool.keywords) {
      if (normalized.includes(kw) && kw.length > bestLen) {
        best = tool;
        bestLen = kw.length;
      }
    }
  }
  return best ? [best] : null;
}

export default function UniversalSmartSearch() {
  const [query, setQuery] = useState("");
  const [ratesPayload, setRatesPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchRates({ noStore: true })
      .then((data) => {
        if (!cancelled) setRatesPayload(data);
      })
      .catch(() => {
        // Leave ratesPayload null — the result panel below renders a
        // "live estimate unavailable" state rather than a fabricated
        // number; the direct link to the pSEO page still works either
        // way since that page fetches its own rate server-side.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalized = query.trim().toLowerCase();

  const result = useMemo(() => {
    if (!normalized) return null;
    const zakat = matchZakatGold(normalized);
    if (zakat) return zakat;
    const currency = matchCurrency(normalized);
    if (currency) return currency;
    const tools = matchTools(normalized);
    if (tools) return { kind: "tools", matches: tools };
    return { kind: "none" };
  }, [normalized]);

  function handleResultShown(kind) {
    // One lightweight GA4 ping per distinct parsed query, not per
    // keystroke — this only fires from the render below when a query
    // actually resolves to a result, via the input's onChange path.
    trackEvent("smart_search_query", { intent: kind, query_length: normalized.length });
  }

  return (
    <div className="mt-6">
      <label htmlFor="universal-smart-search" className="sr-only">
        Search currencies, zakat, or tools
      </label>
      <div className="relative">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="universal-smart-search"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder='Try "2000 AED to PKR", "Zakat on 10 Tola Gold", or "compress image"'
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-ink py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-500 shadow-card focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
      </div>

      {result && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-ink text-white shadow-card">
          {result.kind === "currency" && (
            <SmartSearchResult onShown={() => handleResultShown("currency")}>
              <CurrencyResult result={result} ratesPayload={ratesPayload} />
            </SmartSearchResult>
          )}
          {result.kind === "zakat" && (
            <SmartSearchResult onShown={() => handleResultShown("zakat")}>
              <ZakatResult result={result} ratesPayload={ratesPayload} />
            </SmartSearchResult>
          )}
          {result.kind === "tools" && (
            <SmartSearchResult onShown={() => handleResultShown("tools")}>
              <ToolsResult matches={result.matches} />
            </SmartSearchResult>
          )}
          {result.kind === "none" && (
            <div className="p-4 text-sm text-slate-400">
              No instant match yet — try an amount + currency (
              <span className="text-slate-300">2000 AED to PKR</span>), a zakat/gold query, or a
              tool name. Or browse{" "}
              <Link href="/tools" className="font-semibold text-brand-300 hover:text-brand-200">
                all tools
              </Link>
              .
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Fires `onShown` once per mount of a given result (i.e. once per
 * distinct parsed query, since the parent swaps this subtree whenever
 * `result` changes) — isolates the GA4 side effect from the render
 * logic above without re-firing on every keystroke within the same
 * resolved intent. */
function SmartSearchResult({ onShown, children }) {
  useEffect(() => {
    onShown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function CurrencyResult({ result, ratesPayload }) {
  const { amount, fromClass, fromCode, from, toClass, toCode, to } = result;
  const converted = ratesPayload
    ? convertBetweenAssets({ amount, fromClass, fromCode, toClass, toCode, ratesPayload })
    : null;
  const href = `/converters/${buildAmountPairSlug(amount, fromCode, toCode)}`;

  return (
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Currency Conversion
      </p>
      <p className="mt-1.5 text-sm text-slate-300">
        {formatNumber(amount, { maximumFractionDigits: 2 })} {from.code} ({from.name}) to{" "}
        {to.code} ({to.name})
      </p>
      <p className="mt-1 font-mono text-2xl font-extrabold text-white">
        {Number.isFinite(converted)
          ? `${formatNumber(converted, { maximumFractionDigits: 2 })} ${to.code}`
          : "Fetching live rate…"}
      </p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Open full conversion →
      </Link>
    </div>
  );
}

function ZakatResult({ result, ratesPayload }) {
  const { tolaAmount, grams } = result;
  const zakatResult =
    ratesPayload &&
    calculateZakat({
      xauUsdRate: ratesPayload.metals?.XAU,
      xagUsdRate: ratesPayload.metals?.XAG,
      usdToLocalFx: ratesPayload.fiat?.PKR,
      goldGrams: grams,
      nisabStandard: "gold",
    });
  const href = `/converters/${buildZakatGoldSlug(
    Number.isInteger(tolaAmount) ? tolaAmount : Math.round(tolaAmount * 100) / 100
  )}`;

  return (
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Zakat on Gold
      </p>
      <p className="mt-1.5 text-sm text-slate-300">
        {formatNumber(tolaAmount, { maximumFractionDigits: 2 })} tola (
        {formatNumber(grams, { maximumFractionDigits: 2 })}g) of gold
      </p>
      {zakatResult ? (
        <p className="mt-1 font-mono text-2xl font-extrabold text-white">
          {zakatResult.meetsNisab
            ? `${formatNumber(zakatResult.zakatDue, { maximumFractionDigits: 0 })} PKR due`
            : "Below nisab — no zakat due"}
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-400">Fetching live gold rate…</p>
      )}
      <p className="mt-1 text-xs text-slate-500">
        Gold nisab threshold: {formatNumber(NISAB_GOLD_GRAMS, { maximumFractionDigits: 2 })}g
      </p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Open full zakat reference →
      </Link>
    </div>
  );
}

function ToolsResult({ matches }) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Matching Tool
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {matches.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {tool.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
