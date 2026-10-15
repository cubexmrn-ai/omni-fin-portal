"use client";

// components/HomeSections.jsx
//
// The homepage's visible content (Hero, the 3 ecosystem sections, and
// the Supported Currencies section) extracted out of app/page.jsx into
// its own "use client" component so it can call useLanguage() / t()
// and re-render in the selected language. app/page.jsx itself must
// stay a Server Component (it exports `revalidate` for ISR, which
// Next.js only allows in a Server Component), so it imports and
// renders these as client children instead of defining them inline.
//
// Content that's SEO-only and invisible to the visitor (the
// EcosystemStructuredData JSON-LD) stays back in app/page.jsx in
// English, which is normal practice for structured data.

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CURRENCIES } from "@/lib/currencies";
import { CRYPTO_ASSETS } from "@/lib/crypto";

const ACADEMY_LEVELS = [
  { order: 1, titleKey: "level1Title", subKey: "level1Sub", theme: "emerald", locked: false },
  { order: 2, titleKey: "level2Title", subKey: "level2Sub", theme: "blue", locked: true },
  { order: 3, titleKey: "level3Title", subKey: "level3Sub", theme: "violet", locked: true },
  { order: 4, titleKey: "level4Title", subKey: "level4Sub", theme: "amber", locked: true },
  { order: 5, titleKey: "level5Title", subKey: "level5Sub", theme: "rose", locked: true },
];

const ACADEMY_THEME_DOT = {
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

// Static fallback shown only when no live `marketPulse` data resolved
// (e.g. the unified rates/sentiment-engine fetches both failed) —
// never fabricate the AI Market Pulse cards' numbers, show this plain
// translated copy instead.
const STATIC_FEATURES = [
  { titleKey: "feature1Title", descKey: "feature1Desc" },
  { titleKey: "feature2Title", descKey: "feature2Desc" },
  { titleKey: "feature3Title", descKey: "feature3Desc" },
];

/** One of the 3 dark "AI Market Pulse" cards below the hero copy —
 * shared layout so Technical Score / Macro Radar / Volatility Watch
 * all read as one family despite very different content. */
function PulseCard({ label, big, sub, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink p-5 text-white shadow-card transition-shadow hover:shadow-card-hover">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold leading-none tracking-tight">{big}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      {children}
    </div>
  );
}

export function Hero({ marketPulse }) {
  const { t } = useLanguage();
  const { technical, macroThemes, volatility } = marketPulse || {};
  const hasLivePulse = Boolean(technical || (macroThemes && macroThemes.length > 0) || volatility);

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            {t("heroDescription", { currencyCount: CURRENCIES.length, cryptoCount: CRYPTO_ASSETS.length })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#metals-calculator"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
            >
              {t("heroCtaMetals")}
            </a>
            <a
              href="#rates"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("heroCtaRates")}
            </a>
          </div>
        </div>

        {hasLivePulse ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {technical && (
              <PulseCard
                label="Technical Score"
                big={`${technical.bullishPct}%`}
                sub={`${technical.directionWord} · ${technical.greedFearWord}`}
              >
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Composite AI read across Gold, Bitcoin &amp; EUR/USD.{" "}
                  <Link href="/market-analysis" className="text-blue-400 hover:text-blue-300">
                    See the full breakdown
                  </Link>
                  .
                </p>
              </PulseCard>
            )}

            {macroThemes && macroThemes.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-ink p-5 text-white shadow-card transition-shadow hover:shadow-card-hover">
                <p className="text-[11px] font-semibold text-slate-400">Macro Radar</p>
                <p className="mt-2 text-base font-bold leading-snug">{macroThemes[0]}</p>
                {macroThemes.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {macroThemes.slice(1).map((theme, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  High-impact themes currently rotating across tracked macro assets.
                </p>
              </div>
            )}

            {volatility && (
              <div className="rounded-2xl border border-white/10 bg-ink p-5 text-white shadow-card transition-shadow hover:shadow-card-hover">
                <p className="text-[11px] font-semibold text-slate-400">Volatility Watch</p>
                <p className="mt-2 text-base font-bold leading-snug">{volatility.instrumentLabel}</p>
                <p className="mt-1 font-mono text-sm text-amber-300">
                  {volatility.distancePct.toFixed(2)}% from {volatility.side}
                  {volatility.level ? ` (${volatility.level})` : ""}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  The tightest breakout zone right now among the instruments tracked above.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATIC_FEATURES.map((f) => (
              <div
                key={f.titleKey}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <h3 className="text-sm font-semibold text-slate-900">{t(f.titleKey)}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Small reusable "open this tool" arrow, used across all 3 ecosystem
 * sections below so the CTA styling stays identical everywhere. */
function CtaArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UnifiedSuiteSection() {
  const { t } = useLanguage();
  return (
    <section
      aria-labelledby="unified-suite-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 id="unified-suite-heading" className="text-lg font-bold text-slate-900">
        {t("unifiedTitle")}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("unifiedDesc")}</p>

      <div className="mt-5 grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border border-blue-500/40 bg-slate-900 p-6 text-white shadow-card">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
            {t("step1Label")}
          </span>
          <h3 className="mt-3 text-xl font-bold">{t("step1Title")}</h3>
          <p className="mt-2 text-sm text-slate-300">{t("step1Desc")}</p>
          <Link
            href="/converters"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            {t("step1Cta")} <CtaArrow />
          </Link>
        </div>

        <div
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-500 shadow-card lg:flex"
          aria-hidden="true"
        >
          <CtaArrow />
        </div>

        <div className="rounded-2xl border border-blue-500/40 bg-slate-900 p-6 text-white shadow-card">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
            {t("step2Label")}
          </span>
          <h3 className="mt-3 text-xl font-bold">{t("step2Title")}</h3>
          <p className="mt-2 text-sm text-slate-300">{t("step2Desc")}</p>
          <Link
            href="/calculators"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            {t("step2Cta")} <CtaArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AcademyRoadmapSection() {
  const { t } = useLanguage();
  return (
    <section
      aria-labelledby="academy-roadmap-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="academy-roadmap-heading" className="text-lg font-bold text-slate-900">
            {t("academyRoadmapTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("academyRoadmapDesc")}</p>
        </div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          {t("academyStartLearning")} <CtaArrow />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ACADEMY_LEVELS.map((level) => (
          <div
            key={level.order}
            className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-slate-900 p-5 text-white shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className={`h-2 w-2 rounded-full ${ACADEMY_THEME_DOT[level.theme]}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {t("levelWord")} {level.order}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold">{t(level.titleKey)}</h3>
            <p className="mt-1 text-xs text-slate-400">{t(level.subKey)}</p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-slate-400">{t("quizCheckpoint")}</span>
              {level.locked ? (
                <span className="font-semibold text-amber-400">{t("locked")}</span>
              ) : (
                <span className="font-semibold text-emerald-400">{t("unlocked")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketCommunitySection() {
  const { t } = useLanguage();
  const PREVIEW_CARDS = [
    { titleKey: "card1Title", descKey: "card1Desc", ctaKey: "card1Cta", href: "/market-analysis", kind: "chart" },
    { titleKey: "card2Title", descKey: "card2Desc", ctaKey: "card2Cta", href: "/market-analysis", kind: "sentiment" },
    { titleKey: "card3Title", descKey: "card3Desc", ctaKey: "card3Cta", href: "/community", kind: "discussion" },
  ];

  return (
    <section
      aria-labelledby="market-community-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 id="market-community-heading" className="text-lg font-bold text-slate-900">
        {t("marketCommunityTitle")}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("marketCommunityDesc")}</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PREVIEW_CARDS.map((card) => (
          <Link
            key={card.titleKey}
            href={card.href}
            className="group overflow-hidden rounded-2xl border border-blue-500/40 bg-slate-900 text-white shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex h-24 items-end gap-1 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 p-4">
              {card.kind === "chart" && (
                <>
                  {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <span key={i} className="w-full rounded-t bg-blue-400/70" style={{ height: `${h}%` }} />
                  ))}
                </>
              )}
              {card.kind === "sentiment" && (
                <div className="flex w-full items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">{t("bullish")}</span>
                </div>
              )}
              {card.kind === "discussion" && (
                <div className="flex w-full flex-col gap-1.5">
                  <span className="h-2 w-5/6 rounded-full bg-white/15" />
                  <span className="h-2 w-2/3 rounded-full bg-white/10" />
                  <span className="h-2 w-3/4 rounded-full bg-white/10" />
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold">{t(card.titleKey)}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{t(card.descKey)}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 group-hover:text-blue-300">
                {t(card.ctaKey)} <CtaArrow />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CurrencyChips({ items }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.code}
          title={item.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
        >
          {item.flag && <span aria-hidden="true">{item.flag}</span>}
          {item.code}
        </span>
      ))}
    </div>
  );
}

export function SupportedCurrencies() {
  const { t } = useLanguage();
  const currencyCount = CURRENCIES.length;
  const cryptoCount = CRYPTO_ASSETS.length;

  return (
    <section id="rates" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t("supportedTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("supportedDesc", { currencyCount, cryptoCount })}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900">{t("fiatCurrenciesHeading", { currencyCount })}</h3>
        <CurrencyChips items={CURRENCIES} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-900">{t("cryptoCurrenciesHeading", { cryptoCount })}</h3>
        <CurrencyChips items={CRYPTO_ASSETS.map((c) => ({ code: c.code, name: c.name }))} />
      </div>
    </section>
  );
}
