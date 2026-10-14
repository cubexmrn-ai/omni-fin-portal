"use client";

// components/StickyBottomTicker.jsx
//
// PHASE 5 — a single, fixed-to-the-bottom ticker bar, mounted once in
// app/layout.jsx (same pattern as the two disclaimer modals) and shown
// only on the routes the feature was scoped to: Market Analysis, AI
// News (which includes the Live Market Sentiment section), and every
// Academy page. Everywhere else it renders nothing.
//
// CONTENT, by route:
//   - /market-analysis, /ai-news: live USD prices for Gold (XAU),
//     EUR/USD, and Bitcoin — fetched client-side from the same
//     /api/rates endpoint (via lib/fetchRates.js) and the same
//     getPairRate() math every converter/pair page already uses, so
//     these numbers are never a separate, invented source of truth.
//   - /learn and /learn/[level]/[lesson]: a real "key takeaway" line
//     pulled from the CURRENT lesson's own content — its first
//     `proTip` section, falling back to its first `formula` note, and
//     finally just the lesson title — never a generated summary, so
//     this never puts words in the curriculum's mouth that aren't
//     already there. On the Academy hub (no specific lesson yet), it
//     shows the learner's last-active lesson from useAcademyProgress()
//     if there is one, else a generic "pick up where you left off"
//     invite to open the hub's Master Path.
//
// LAYOUT: `position: fixed` bottom bar — by construction this never
// participates in document flow, so mounting/unmounting it causes zero
// Cumulative Layout Shift for the rest of the page (the standard
// "sticky bottom bar" trade-off is that it can overlap the very bottom
// of the page's own content, same as e.g. a cookie-consent bar would).
//
// STATE: a single persisted mode — "expanded" | "minimized" | "closed"
// — stored in localStorage (best-effort, same pattern as every other
// preference on this site), so a visitor's choice holds across pages
// and visits instead of re-appearing on every navigation.
//
// BUNDLE SIZE: this component is mounted once, globally, in
// app/layout.jsx, so anything it imports at module scope ships to
// EVERY page's client bundle — including a visitor who never touches
// the Academy. The Academy-specific piece (components/academy/
// TickerAcademyContent.jsx) pulls in lib/academyData.js — ~2,300 lines
// of lesson content — plus useAcademyProgress, so it's loaded via
// next/dynamic below instead of a normal import, putting it in its own
// chunk that only downloads once a visitor is actually on an Academy
// route.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchRates } from "@/lib/fetchRates";
import { getPairRate } from "@/lib/assetConversion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TickerAcademyContent = dynamic(
  () => import("@/components/academy/TickerAcademyContent"),
  { ssr: false, loading: () => null }
);

const STATE_STORAGE_KEY = "omnifin:tickerState"; // "expanded" | "minimized" | "closed"

const TICKER_INSTRUMENTS = [
  { label: "XAU/USD", fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "USD" },
  { label: "EUR/USD", fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD" },
  { label: "BTC/USD", fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD" },
];

function formatPrice(value) {
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = value >= 100 ? 2 : value >= 1 ? 4 : 6;
  return value.toLocaleString("en-US", { maximumFractionDigits });
}

function useLivePrices(enabled) {
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const payload = await fetchRates();
        if (cancelled) return;
        const next = {};
        for (const instrument of TICKER_INSTRUMENTS) {
          next[instrument.label] = getPairRate({ ...instrument, ratesPayload: payload });
        }
        setPrices(next);
      } catch {
        // Leave prices null — the ticker just shows "—" rather than
        // a stale or fabricated number.
      }
    }

    load();
    // Matches the underlying /api/rates cache window (1 hour) closely
    // enough for a ticker bar without hammering the endpoint.
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return prices;
}

// Mirrors useLivePrices() above in shape: a single best-effort,
// client-side fetch (no polling loop needed — the underlying snapshot
// is itself only hourly-granular) of the standalone sentiment engine's
// API route, picking one representative asset (whichever the response
// lists first — Gold, per SENTIMENT_ASSET_UNIVERSE's ordering in
// lib/sentimentEngine.js) to show as a compact label. Never throws and
// never blocks/breaks the rest of the ticker — a slow or failing
// request just leaves this null, same as a failed price fetch above.
function useMacroSentimentSignal(enabled) {
  const [signal, setSignal] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sentiment-engine");
        if (!res.ok) throw new Error(`sentiment-engine responded with ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const asset = Array.isArray(data?.assets) ? data.assets[0] : null;
        if (!asset) return;
        const divergenceLabel =
          asset.divergence && asset.divergence !== "aligned" ? "diverging" : "aligned";
        setSignal(
          `${asset.label}: Retail ${asset.retailSentiment} / Institutional ${asset.institutionalBias} (${divergenceLabel})`
        );
      } catch {
        // Leave signal null — the ticker just omits this span rather
        // than showing a stale or fabricated value.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return signal;
}

export default function StickyBottomTicker() {
  const pathname = usePathname() || "";
  const { t } = useLanguage();
  const [mode, setMode] = useState("expanded");
  const [hydrated, setHydrated] = useState(false);

  const isMarketPage = pathname.startsWith("/market-analysis") || pathname.startsWith("/ai-news");
  const isAcademyPage = pathname.startsWith("/learn");
  const active = isMarketPage || isAcademyPage;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
      if (stored === "minimized" || stored === "closed" || stored === "expanded") {
        setMode(stored);
      }
    } catch {
      // Best-effort read only — stays "expanded".
    }
    setHydrated(true);
  }, []);

  const prices = useLivePrices(active && isMarketPage && hydrated);
  const sentimentSignal = useMacroSentimentSignal(active && isMarketPage && hydrated);

  if (!active || !hydrated || mode === "closed") return null;

  function persist(next) {
    setMode(next);
    try {
      window.localStorage.setItem(STATE_STORAGE_KEY, next);
    } catch {
      // Best-effort persistence only.
    }
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900 text-white shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.3)]"
      role="complementary"
      aria-label={isAcademyPage ? t("tickerAcademyAriaLabel") : t("tickerMarketAriaLabel")}
    >
      {mode === "minimized" ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
          <span className="truncate text-xs font-semibold text-slate-300">
            {isAcademyPage ? t("tickerAcademyLabel") : t("tickerMarketLabel")}
          </span>
          <button
            type="button"
            onClick={() => persist("expanded")}
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
          >
            {t("tickerExpand")} ▲
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-300 sm:flex">
            {isAcademyPage ? t("tickerAcademyLabel") : t("tickerMarketLabel")}
          </span>

          <div className="min-w-0 flex-1 overflow-hidden">
            {isAcademyPage ? (
              <TickerAcademyContent pathname={pathname} />
            ) : (
              <div className="flex items-center gap-4 overflow-x-auto text-xs font-semibold sm:text-sm">
                {TICKER_INSTRUMENTS.map((instrument) => (
                  <span key={instrument.label} className="flex shrink-0 items-center gap-1.5">
                    <span className="text-slate-400">{instrument.label}</span>
                    <span className="text-white">
                      {prices ? formatPrice(prices[instrument.label]) : "—"}
                    </span>
                  </span>
                ))}
                {sentimentSignal && (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-slate-400">{sentimentSignal}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {isAcademyPage && (
            <Link
              href="/learn"
              className="hidden shrink-0 text-xs font-semibold text-brand-300 hover:text-brand-200 sm:block"
            >
              {t("tickerAcademyCta")} →
            </Link>
          )}

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => persist("minimized")}
              aria-label={t("tickerMinimize")}
              title={t("tickerMinimize")}
              className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => persist("closed")}
              aria-label={t("tickerClose")}
              title={t("tickerClose")}
              className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
