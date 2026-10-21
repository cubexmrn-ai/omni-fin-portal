"use client";

// components/UniversalSmartSearch.jsx
//
// Universal natural-language smart search bar for the homepage hero
// (components/HomeSections.jsx's <Hero/>) — a single input that
// recognizes real queries people actually type, in several languages,
// and shows an instant, actionable result panel, without a server
// round trip for the parsing itself:
//
//   1. Currency/amount queries ("2000 AED to PKR", "100 usd in pkr")
//      -> live converted estimate + a button straight to that exact
//      pSEO page (/converters/<amount>-<from>-to-<to>, see
//      lib/pairSlugs.js's parseAmountPairSlug/buildAmountPairSlug).
//   2. Metal spot-price queries ("1 tola gold in pkr today",
//      "1 tola sona kitne ka hai") -> a live gold/silver value (in the
//      stated currency, defaulting to PKR when none is given) + a
//      button to the matching bare pair page (/converters/xau-to-pkr).
//   3. Zakat/gold queries ("Zakat on 10 Tola Gold", "zakat 10 tola
//      sona", "زکوۃ") -> a live gold-nisab quick reference + a button
//      to that exact Zakat Gold pSEO page
//      (/converters/zakat-on-<N>-tola-gold). Takes priority over #2
//      whenever a zakat keyword is present, in any supported language.
//   4. Tool-intent queries ("compress image", "json formatter")
//      -> fuzzy keyword match against every /tools/* page, shown as
//      launcher buttons.
//   5. No match -> 3 clickable quick-suggestion pills instead of a
//      dead end, so there's always a next step.
//
// MULTI-LINGUAL NORMALIZATION: real visitors type in English, Roman
// Urdu, Urdu script, Arabic script, and Spanish — often mixed with the
// actual numbers/codes in Latin script even when the rest of the query
// isn't (e.g. "1 tola sona PKR me kitne ka hai"). Rather than one
// giant regex per language, the query is:
//   (a) tokenized on whitespace (NOT JS regex `\b` word-boundary
//       substitution — `\b` is defined in terms of the ASCII `\w`
//       class, so it does not behave correctly around Urdu/Arabic
//       script, which is also written right-to-left),
//   (b) each token rewritten through ALIAS maps (gold/silver, weight
//       units, currency identifiers) into a single canonical token,
//   (c) stop-words removed (per-language filler words that carry no
//       intent signal — "today", "price", "ka", "میں", "de", …),
//   (d) the cleaned, re-joined string is matched by the same small,
//       readable regexes as before, now operating on canonical tokens
//       (ASCII only past this point) instead of raw multi-script text.
// This keeps every matcher a plain ASCII regex while still accepting
// "sona", "سونا", "oro", or "ذهب" as the same input.
//
// RATES: fetched once on mount via the exact same lib/fetchRates.js +
// lib/assetConversion.js pattern components/CurrencyConverter.jsx
// already uses (ZERO new data source) — every estimate here is
// `convertBetweenAssets()` against that one payload, never a
// fabricated or hardcoded number. If the fetch hasn't resolved yet (or
// failed), the result panel still shows the parsed intent and the
// direct link to the full pSEO page — it just omits the live estimate
// rather than showing a wrong one.
//
// INTENT PARSING: deliberately a handful of small, readable regexes
// rather than a fuzzy NLP library (there's no npm registry access in
// this project's sandbox — see app/converters/[pair]/opengraph-image.jsx's
// header comment for the same constraint hitting next/og) — this
// covers the query shapes people actually type without a new
// dependency.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchRates } from "@/lib/fetchRates";
import { convertBetweenAssets, getAssetMeta } from "@/lib/assetConversion";
import { CURRENCY_CODES } from "@/lib/currencies";
import { CRYPTO_CODES } from "@/lib/crypto";
import { METAL_CODES } from "@/lib/metals";
import { buildAmountPairSlug, buildZakatGoldSlug, buildPairSlug } from "@/lib/pairSlugs";
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

// ---------------------------------------------------------------------
// MULTI-LINGUAL ALIAS MAPS
//
// Each map rewrites a raw token (already lowercased for Latin script —
// Urdu/Arabic script has no case) to one canonical token the regex
// matchers below understand. Keys are the literal words/scripts a
// visitor would actually type; values are the single canonical form.
// ---------------------------------------------------------------------

// Gold / silver / metals (English, Roman Urdu, Urdu, Spanish, Arabic).
const METAL_ALIASES = {
  gold: "gold",
  sona: "gold",
  سونا: "gold",
  oro: "gold",
  ذهب: "gold",
  silver: "silver",
  chandi: "silver",
  چاندی: "silver",
  plata: "silver",
};

// Units & amounts (English, Roman Urdu, Urdu).
const UNIT_ALIASES = {
  tola: "tola",
  tolas: "tola",
  تولہ: "tola",
  gram: "gram",
  grams: "gram",
  g: "gram",
  oz: "troyoz",
  troy: "troyoz",
};

// Currency identifiers (English, Roman Urdu, Arabic-script names).
const CURRENCY_ALIASES = {
  pkr: "PKR",
  rupees: "PKR",
  rupee: "PKR",
  rs: "PKR",
  usd: "USD",
  dollar: "USD",
  dollars: "USD",
  aed: "AED",
  dirham: "AED",
  sar: "SAR",
  riyal: "SAR",
  riyals: "SAR",
};

// Zakat keywords, in every supported language — matched as whole
// tokens (not substituted to a canonical form, just detected) so
// "زکوۃ" is recognized without needing transliteration.
const ZAKAT_KEYWORDS = new Set(["zakat", "zakaat", "زکوۃ", "زكاة"]);

// Cross-language stop-words: conversational filler stripped before
// parsing, exactly as specified — these never carry intent signal on
// their own, and removing them lets "1 tola gold in pkr today" and
// "1 tola sona PKR me aaj ka bhav" normalize to the same tokens.
const STOP_WORDS = new Set([
  // English
  "in", "today", "price", "rate", "current", "value", "now",
  // Roman Urdu
  "me", "ka", "ki", "kitne", "kitna", "aaj", "paisa", "bhav",
  // Urdu
  "میں", "کا", "کی", "قیمت", "آج",
  // Spanish
  "de", "en", "el", "precio", "hoy",
]);

/**
 * Tokenizes on whitespace (not regex `\b` boundaries — those don't
 * behave correctly for Urdu/Arabic script), rewrites each token
 * through the alias maps above, then drops stop-words. Numbers and
 * already-canonical tokens (currency codes, "to"/"in" for the
 * currency matcher, tool keywords) pass through untouched.
 */
function normalizeMultilingualQuery(raw) {
  const tokens = raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const canonical = [];
  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue;
    if (METAL_ALIASES[token]) {
      canonical.push(METAL_ALIASES[token]);
      continue;
    }
    if (UNIT_ALIASES[token]) {
      canonical.push(UNIT_ALIASES[token]);
      continue;
    }
    if (CURRENCY_ALIASES[token]) {
      canonical.push(CURRENCY_ALIASES[token]);
      continue;
    }
    if (ZAKAT_KEYWORDS.has(token)) {
      canonical.push("zakat");
      continue;
    }
    canonical.push(token);
  }
  return canonical.join(" ");
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

// Fallback quick-suggestion pills, shown when nothing matches — each
// one is a real query the parsers below resolve, so clicking a pill
// re-runs the exact same pipeline as typing it would.
const FALLBACK_SUGGESTIONS = ["2000 AED to PKR", "1 Tola Gold in PKR", "Zakat on 10 Tola Gold"];

/** Currency/amount intent: "<amount> <code> to|in <code>". The "to|in"
 * connector is optional because normalizeMultilingualQuery() strips
 * "in" as an English stop-word before this ever runs (per spec) — so
 * "100 usd in pkr" arrives here as "100 USD PKR" and must still match. */
function matchCurrency(normalized) {
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-z]{2,6})\s+(?:(?:to|in)\s+)?([a-z]{2,6})$/i);
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
 * a zakat keyword appearing anywhere in the (already-canonicalized)
 * query (so "zakat on 10 tola gold", "10 tola gold zakat", and
 * "zakat 10 tola gold" all match, in any supported language). Takes
 * priority over the plain metal-price intent below. */
function matchZakatGold(normalized) {
  if (!/\bzakat\b/.test(normalized)) return null;

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(tola|gram)\b.*gold|gold.*?(\d+(?:\.\d+)?)\s*(tola|gram)\b/i);
  if (!match) return null;

  const amountStr = match[1] || match[3];
  const unit = (match[2] || match[4] || "").toLowerCase();
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const isTola = unit === "tola";
  const tolaAmount = isTola ? amount : amount / WEIGHT_UNITS.tola;
  const grams = isTola ? amount * WEIGHT_UNITS.tola : amount;

  return { kind: "zakat", tolaAmount, grams };
}

/** Plain metal spot-price intent (NOT zakat): "<amount> <unit> gold|silver
 * [<currency>]", or the reversed word order, e.g. "1 tola gold",
 * "1 tola gold in pkr today" (after normalization: "1 tola gold PKR"),
 * "gold 10 gram". Caller already ruled out a zakat keyword being
 * present. Defaults the target currency to PKR when none is named
 * anywhere in the query, per spec. */
function matchMetalPrice(normalized) {
  const match = normalized.match(
    /(\d+(?:\.\d+)?)\s*(tola|gram|troyoz)\s+(gold|silver)|(gold|silver)\s+(\d+(?:\.\d+)?)\s*(tola|gram|troyoz)/i
  );
  if (!match) return null;

  const amountStr = match[1] || match[5];
  const unit = (match[2] || match[6] || "").toLowerCase();
  const metal = (match[3] || match[4] || "").toLowerCase();
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const metalCode = metal === "gold" ? "XAU" : "XAG";
  const grams = amount * (WEIGHT_UNITS[unit === "troyoz" ? "troy_ounce" : unit] || 1);
  const troyOunces = grams / WEIGHT_UNITS.troy_ounce;

  const currencyMatch = normalized.match(/\b(PKR|USD|AED|SAR)\b/);
  const toCode = currencyMatch ? currencyMatch[1] : "PKR";
  const toClass = resolveAssetClass(toCode);
  const to = toClass ? getAssetMeta(toClass, toCode) : null;
  if (!to) return null;

  return {
    kind: "metal",
    metalCode,
    metalLabel: metal === "gold" ? "Gold" : "Silver",
    amount,
    unit,
    grams,
    troyOunces,
    toCode,
    to,
  };
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

  const normalized = useMemo(() => normalizeMultilingualQuery(query), [query]);

  const result = useMemo(() => {
    if (!normalized) return null;
    const zakat = matchZakatGold(normalized);
    if (zakat) return zakat;
    const metal = matchMetalPrice(normalized);
    if (metal) return metal;
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
          placeholder='Try "2000 AED to PKR", "1 Tola Gold in PKR", or "compress image"'
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
          {result.kind === "metal" && (
            <SmartSearchResult onShown={() => handleResultShown("metal")}>
              <MetalResult result={result} ratesPayload={ratesPayload} />
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
            <FallbackResult onSuggestionClick={(suggestion) => setQuery(suggestion)} />
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

/** Pure spot-price result for a gold/silver query with no zakat intent
 * — converts the stated weight to a troy-ounce-equivalent amount (the
 * unit lib/assetConversion.js's metals normalize to) and reuses the
 * same conversion engine as CurrencyResult, rather than any nisab
 * math. Links to the matching bare pair page (e.g. /converters/xau-to-pkr),
 * which is already a featured, indexed page for every metal/currency
 * combination this matcher can produce — a tola-denominated amount
 * would make for an ungainly amount-pair slug, whereas the bare pair
 * page lets the visitor convert any amount themselves. */
function MetalResult({ result, ratesPayload }) {
  const { metalCode, metalLabel, amount, unit, grams, troyOunces, toCode, to } = result;
  const converted = ratesPayload
    ? convertBetweenAssets({
        amount: troyOunces,
        fromClass: "metals",
        fromCode: metalCode,
        toClass: "fiat",
        toCode,
        ratesPayload,
      })
    : null;
  const href = `/converters/${buildPairSlug(metalCode, toCode)}`;
  const unitLabel = unit === "troyoz" ? "troy oz" : unit;

  return (
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {metalLabel} Spot Price
      </p>
      <p className="mt-1.5 text-sm text-slate-300">
        {formatNumber(amount, { maximumFractionDigits: 2 })} {unitLabel} ({formatNumber(grams, { maximumFractionDigits: 2 })}g) of {metalLabel.toLowerCase()}
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
        Open full {metalLabel.toLowerCase()} converter →
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

/** No-match fallback: instead of a dead end, offers 3 clickable
 * quick-suggestion pills pre-populated with real example queries —
 * clicking one sets the search input's own value, so it re-runs
 * through the exact same intent pipeline as if typed. */
function FallbackResult({ onSuggestionClick }) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm text-slate-400">
        No instant match yet — try an amount + currency, a gold/zakat query, or a tool
        name. Or browse{" "}
        <Link href="/tools" className="font-semibold text-brand-300 hover:text-brand-200">
          all tools
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FALLBACK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-brand-400 hover:text-white"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
