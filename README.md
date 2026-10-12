# OmniFin Portal

A Next.js 14 (App Router) + Tailwind CSS finance portal.

- **Module 1 — Converters**: a cross-asset Universal Currency Converter
  (36 fiat currencies + 12 cryptocurrencies + 5 precious/base metals,
  any asset to any other, searchable pickers, rate matrix), a Metals &
  Commodities Calculator covering Gold, Silver, Platinum, Palladium,
  Copper (all auto-filled from live spot prices, by weight unit and —
  for gold — karat) and Crude Oil (auto-filled, priced per barrel), and
  a worldwide unit converter (length, area, weight, volume, speed,
  digital storage, temperature — including Tola, Maund, Seer, Marla and
  Kanal), all tabbed together with programmatic SEO routes for both
  currency pairs and unit pairs.
- **Module 4 — Calculators Hub** (`/calculators`): seven free
  calculators across two category tabs — **Trading Tools** (Position &
  Lot Size, Pip Value, Risk/Reward Ratio, Margin & Leverage) and
  **Wealth & Personal Finance** (Inflation & Purchasing Power, Compound
  Interest / Wealth Growth, Business Profit Margin & Markup). The same
  calculators are also embedded as compact "quick mini-widgets" inside
  relevant Academy lessons and Converter pages. See "Notes on the
  Calculators Hub" below for the full breakdown.
- **Module 3 — OmniFin Academy** (`/learn`): a free, gamified,
  BabyPips-style "School of Pipsology" curriculum — 5 skill levels
  (Rookie → Apprentice → Analyst → Strategist → Pro Trader), 20
  bite-sized lessons, 100 quiz questions total, visual SVG diagram
  cards, two OmniFin tools embedded directly inside relevant lessons,
  and `localStorage`-backed progress tracking with level unlocking.
  See "Notes on the OmniFin Academy" below for the full breakdown.
- **Module 2 — Market AI & News**: a clean Market Analysis page — a
  top ticker-tape strip (S&P 500, Nasdaq 100, Gold, BTC/USD, EUR/USD),
  a full interactive TradingView Advanced Chart with a symbol picker,
  and an on-demand rule-based "AI Technical Analysis" panel with a
  visual Buy/Sell/Neutral meter, three bias widgets (**Technical
  Bias**, **Fundamental Bias**, **Overall Market Sentiment**), and a
  full report (Price Action, Support/Resistance, Pivot Points,
  Oscillators) plus an additive Fibonacci or Gann Theory section —
  computed live from `/api/rates`, zero paid API dependency — all with
  a light/dark toggle; and a categorized Financial News page (Forex /
  Crypto / Commodities / Stocks) with search, category filters,
  rule-based Bullish/Bearish/Neutral sentiment badges per headline
  tagged by which asset(s) it's about, a per-asset sentiment breakdown
  card, and a Social Buzz Tracker (clearly labeled **simulated** chatter
  intensity/sentiment across X/Twitter and Reddit, with a disabled
  "use live API" toggle) (AI summaries and real social-listening data
  are both placeholders until an Anthropic API key / social data source
  is configured).

## Stack

- Next.js 14 (App Router, React 18)
- Tailwind CSS 3
- A unified rates API fetching Fiat (ExchangeRate-API), Crypto
  (CoinGecko), Metals (metals-api.com, 5 assets incl. Copper) and
  Commodities (Crude Oil, static reference price for now) **in
  parallel** via `Promise.all()`, each with its own timeout and
  fallback, cached with ISR-style 3600s (1 hour) revalidation
  (`app/api/rates/route.js`)
- A separate RSS news aggregator route spanning 7 feeds across 4
  categories (Stocks, Forex, Crypto, Commodities), same timeout/fallback
  pattern, cached for 900s (`app/api/news-ai/route.js`)
- TradingView public embed widgets (no API key required) — the
  "Advanced Chart" widget for the detailed chart and the lighter-weight
  "Mini Symbol Overview" widget for the Global Markets Overview grid
- Tailwind's class-based dark mode (`darkMode: "class"`) opted into
  locally by the Market Analysis page's own light/dark toggle, rather
  than site-wide

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  api/
    rates/route.js            # Thin JSON wrapper around lib/marketData.js
    market-ai/route.js        # On-demand technical analysis (rule-based; see lib/technicalAnalysis.js)
    news-ai/route.js          # Thin JSON wrapper around lib/newsAggregator.js
    social-buzz/route.js      # Thin JSON wrapper around lib/socialBuzz.js (simulated data)
  converters/
    page.jsx                  # Tabbed directory (Currency / Metals & Commodities / Units) + featured pairs
    [pair]/page.jsx           # Programmatic SEO routes across fiat/crypto/metals, e.g. usd-to-pkr,
                                # btc-to-usd, xau-to-usd — JSON-LD (FinancialProduct + WebApplication)
    unit/[slug]/page.jsx      # Programmatic SEO routes, e.g. sqft-to-marla
  market-analysis/
    page.jsx                  # Ticker strip + full chart + AI Technical Analysis panel (light/dark)
    ai-news/page.jsx          # Redirects to /ai-news (legacy path, kept for old links)
  ai-news/
    page.jsx                  # Categorized Financial News page (search + category pills + sentiment)
  learn/
    page.jsx                  # Academy hub shell (metadata) wrapping components/academy/AcademyHub.jsx
    [level]/[lesson]/page.jsx # One lesson page (generateStaticParams over all 20 lessons),
                                # wrapping components/academy/LessonViewer.jsx
  calculators/
    page.jsx                  # Calculators Hub shell (metadata) wrapping components/calculators/CalculatorsHub.jsx
  community/
    page.jsx                  # Community Forum shell (metadata) wrapping components/community/CommunityHub.jsx
  about/
    page.jsx                  # About Us — purpose, educational/utility mandate, data transparency
  disclaimer/
    page.jsx                  # Financial Disclaimer — "educational only, not financial advice"
  privacy/
    page.jsx                  # Privacy Policy — AdSense-required disclosures
  terms/
    page.jsx                  # Terms of Service — AdSense-required disclosures
  sitemap.js                  # Next.js sitemap convention -> served at /sitemap.xml
  robots.js                   # Next.js robots convention -> served at /robots.txt
  layout.jsx                  # Header, nav, footer (footer now links About/Privacy/Terms/Disclaimer/Sitemap)
  page.jsx                    # Homepage dashboard
  globals.css
components/
  CurrencyConverter.jsx       # Cross-asset converter: Fiat/Crypto/Metals, swap, rate matrix
  ConverterStructuredData.jsx # JSON-LD (FinancialProduct + WebApplication) for a converter SEO page
  PopularPairs.jsx             # "Popular Currency & Metal Pairs" cross-linking block
  ConvertersTabs.jsx          # Tab shell switching Currency / Metals & Commodities / Units
  GoldCalculator.jsx          # Metals & Commodities calculator (6-asset selector; auto-fills
                                # live spot prices; uses lib/conversionMath) — filename kept
                                # for history, the component/UI is no longer gold-only
  UnitConverter.jsx           # Universal multi-category unit converter
  TradingChart.jsx            # TradingView "Advanced Chart" embed wrapper (allows symbol change)
  TickerStrip.jsx             # TradingView "Ticker Tape" embed wrapper — the top horizontal strip
  MiniSymbolWidget.jsx        # TradingView "Mini Symbol Overview" embed wrapper (currently unused
                                # by MarketOverviewBoard.jsx; kept as a reusable building block)
  MarketOverviewBoard.jsx     # Ticker strip + MarketDashboard + AiTechnicalAnalysis, light/dark toggle
  MarketDashboard.jsx         # Symbol picker (global indices) + TradingChart
  AiTechnicalAnalysis.jsx     # On-demand instrument + analysis-type picker, calls /api/market-ai;
                                # renders the meter, the 3 bias cards and the full report sections
  SentimentMeter.jsx          # Visual 5-segment Strong Sell..Strong Buy gauge bar (pure rendering
                                # of a score already computed in lib/technicalAnalysis.js)
  NewsFeed.jsx                 # Client-side search + category filter + sentiment + asset-tag badges
  SocialBuzzTracker.jsx       # Social Buzz Tracker card — fetches /api/social-buzz; keeps the
                                # "Simulated" badge and disabled live-API toggle always visible
  academy/
    AcademyHub.jsx             # Progress banner + level roadmap grid + search/category filter
    LessonViewer.jsx           # Renders one lesson's sections, sticky nav, and the QuizModule
    QuizModule.jsx             # End-of-module quiz engine — instant feedback, 80% pass threshold,
                                # score card with "Retake Quiz" / "Proceed to Next Chapter"
    LessonVisualCard.jsx       # ~13 reusable inline-SVG diagram kinds (candlestick,
                                # support-resistance, risk-reward, bid-ask, MA crossover, RSI,
                                # Fibonacci, timeline, comparison, flow, gauge, grid, ladder)
    EmbeddedTool.jsx           # toolId -> real OmniFin tool component registry (used inside lessons)
    MiniLotSizeCalculator.jsx  # Small position-sizing calculator embedded in two lessons
  calculators/
    CalculatorsHub.jsx         # Category tabs (Trading Tools / Wealth & Personal Finance) + calculator grid
    MiniCalculatorWidget.jsx   # calculatorId -> full calculator component, embedded in Academy lessons
                                # (via academy/EmbeddedTool.jsx) and Converter pages
    LotSizeCalculator.jsx      # Position & Lot Size Calculator (Standard/Mini/Micro breakdown)
    PipValueCalculator.jsx     # Pip Value Calculator (live-rate USD/PKR conversion)
    RiskRewardCalculator.jsx   # Risk/Reward Ratio Calculator (works for any asset, not just forex)
    MarginCalculator.jsx       # Margin & Leverage Calculator (1:50 to 1:500, plus custom)
    InflationCalculator.jsx    # Inflation & Purchasing Power Calculator
    CompoundGrowthCalculator.jsx # Compound Interest / Wealth Growth Calculator (year-by-year table)
    ProfitMarginCalculator.jsx # Business Profit Margin & Markup Calculator
  community/
    CommunityHub.jsx           # Stats header + category tabs + search/asset-pill filters + feed
    TradePostCard.jsx          # One post: avatar, direction badge, Entry/Target/SL, illustrative
                                # chart placeholder + "Expand Setup" modal, vote/Bullseye counters
    CreatePostModal.jsx        # "Share Trade Setup / Insight" trigger + form, submits via
                                # hooks/useCommunityPosts.js's addPost()
    Modal.jsx                  # Reusable fixed-overlay modal shell (first true overlay modal in
                                # this codebase; used by both CreatePostModal and the Expand Setup view)
lib/
  formatNumber.js              # Shared, safely-clamped Intl.NumberFormat wrapper used by every
                                # number formatter in the project — see "Notes on number
                                # formatting safety" below
  conversionMath.js           # All conversion math (weight/karat metals pricing,
                                # flat-unit commodity pricing, units + temperature)
  currencies.js                # Master fiat currency list + fallback rates
  crypto.js                    # Master cryptocurrency list + fallback USD prices
  metals.js                    # Master metals list (incl. Copper) + fallback USD/troy-oz prices
  commodities.js               # Crude Oil (barrel-priced) — deliberately separate from metals.js
  marketData.js                # getUnifiedRates() — the actual Fiat+Crypto+Metals+Commodities
                                # fetch/fallback logic, called directly by app/api/rates/route.js
                                # AND app/api/market-ai/route.js (no self-fetch — see its header)
  technicalAnalysis.js         # Rule-based technical-analysis engine behind /api/market-ai —
                                # instrument registry, round-level math, the Buy/Sell/Neutral
                                # SCORE_LABEL_BANDS, Technical/Fundamental/Overall Bias, Pivot
                                # Points, Fibonacci, and the honest RSI/EMA & Gann Theory
                                # degradation (see its header comment)
  socialBuzz.js                 # Social Buzz Tracker backend — deterministic, hourly-seeded
                                # SIMULATED chatter-intensity + sentiment split per asset; no
                                # real X/Twitter or Reddit API is wired in (see its header comment)
  assetConversion.js           # Cross-asset "convert anything to anything" engine
  unitSlugs.js                # URL-slug <-> unit mapping for SEO routes
  fxSlugs.js                   # URL-slug <-> currency-pair mapping for SEO routes (fiat-only;
                                # still used by app/converters/page.jsx's directory listing)
  pairSlugs.js                 # URL-slug <-> asset-pair mapping across fiat/crypto/metals (superset
                                # of fxSlugs.js), used by app/converters/[pair]/page.jsx
  siteUrl.js                    # Resolves an absolute site URL for metadata/JSON-LD
  fetchRates.js                # Client-side caller for /api/rates (GoldCalculator)
  newsAggregator.js            # The actual RSS fetch/parse/fallback/sentiment logic — called
                                # directly by app/ai-news/page.jsx, not over HTTP
  fetchNews.js                 # Client-side-only caller for /api/news-ai (unused
                                # server-side — see comment in the file for why)
  academyData.js                # OmniFin Academy curriculum — 5 levels, 20 lessons, 100 quiz
                                # questions, plus pure helper functions (getLevel, getLesson,
                                # getAdjacentLessons, getLevelStats, ...) — no React/browser APIs
  calculatorsRegistry.js        # CALCULATOR_CATEGORIES + CALCULATORS metadata — single source of
                                # truth shared by CalculatorsHub.jsx and MiniCalculatorWidget.jsx
  tradingCalculators.js         # Pure math: calculateLotSize, calculatePipValue, calculateRiskReward,
                                # calculateMargin — no React, no fetch, fully unit-testable
  personalCalculators.js        # Pure math: calculateInflation, calculateCompoundGrowth,
                                # calculateMarginMarkup — no React, no fetch
  communityData.js              # Community Forum categories, asset tags, bias options, and 9
                                # seeded/illustrative posts — no React/browser APIs (see its
                                # header comment on why this seed data is clearly non-authoritative)
hooks/
  useAcademyProgress.js         # localStorage-backed Academy progress: completed lessons, quiz
                                # scores, level-unlock logic, overall % — see its header comment
  useCommunityPosts.js          # localStorage-backed Community Forum state: user-submitted posts,
                                # per-post vote/Bullseye toggle state — see its header comment on
                                # why votes are stored as toggle state, not accumulated counts
```

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

- `EXCHANGE_RATE_API_KEY` (optional) — a key from
  [exchangerate-api.com](https://www.exchangerate-api.com/) enables the
  higher-limit `v6` endpoint for fiat rates. Without a key, the route
  falls back to the free `open.er-api.com` endpoint, and finally to
  static rates if both are unreachable, so the app always renders. The
  older name `EXCHANGERATE_API_KEY` is still read as a fallback.
- `COINGECKO_API_KEY` (optional) — a free "Demo" key from
  [coingecko.com](https://www.coingecko.com/en/api) raises the rate
  limit for crypto prices. Without a key, requests go through
  anonymously (lower limit, fine at this traffic level).
- `METALS_API_KEY` (optional) — a key from
  [metals-api.com](https://metals-api.com/) enables live gold/silver/
  platinum/palladium/copper spot prices from that provider. If it's
  missing, or the call fails for any reason (wrong plan, a `base`
  currency restriction, bad/expired key, quota spent), the route
  automatically falls back to [api.gold-api.com](https://api.gold-api.com/),
  a free, keyless provider, so metal prices stay **live** either way —
  note that gold-api.com itself doesn't support copper (`XCU`), so a
  metals-api.com outage with no key configured drops copper specifically
  to its static fallback even while gold/silver/platinum/palladium stay
  live. Only if both providers are unreachable does it drop to static
  fallback numbers for that asset class — fiat and crypto are unaffected
  regardless. See "Notes on the unified rates API" below for how to
  read the `metalsDebug` field when diagnosing a METALS_API_KEY issue.
- Crude oil (`WTI`, in `commodities`) has **no live provider wired in
  yet** — no free, keyless spot-price API was found for it, and the
  usual providers (e.g. oilpriceapi.com) require a paid/trial key. It
  always returns a static reference price (`lib/commodities.js`), and
  the response's `commodityNote` field says so explicitly — this is
  surfaced separately from the top-level `warnings` array so it never
  falsely flips the Metals & Commodities Calculator's "live rates
  connected" badge to "fallback" when fiat/crypto/metals are all
  genuinely live. Add an `OIL_API_KEY`-style variable and a
  `fetchFromOilApi()` tier in `fetchCommodityPrices()`
  (`app/api/rates/route.js`) to wire in a real feed later.
- `ANTHROPIC_API_KEY` (not required yet) — checked in two places, each
  with the same honest fallback: a key being absent (or present but not
  yet wired up) never breaks either feature, it just means the
  rule-based path runs instead.
  - `app/api/news-ai/route.js` (via `lib/newsAggregator.js`) — once
    added, wire it into the `TODO` on `parseRssItems()` to generate a
    `summary` for each headline via the Claude API. Until then,
    `summary` stays `null` and the UI shows an "AI summary coming
    soon" placeholder — the rule-based `sentiment` badge (Bullish/
    Bearish/Neutral) is separate and always computed either way.
  - `app/api/market-ai/route.js` — checks the key and, if present,
    attempts `generateAiAnalysis()` (currently a documented stub that
    always throws, so it safely falls through to the rule-based
    engine). Wire a real Claude API call in there to generate genuine
    AI-written technical analysis instead of the rule-based summary.
- `SOCIAL_API_KEY` (not required, not wired to anything yet) — checked
  by `lib/socialBuzz.js` purely to adjust its own explanatory `note`
  text (e.g. "a key is configured but no provider is wired up yet").
  The Social Buzz Tracker's data is **always** simulated right now
  (`usingLiveApi: false` unconditionally) — there is no actual
  X/Twitter or Reddit API integration in this codebase. Setting this
  variable changes nothing about the numbers shown; it's a documented
  placeholder for when a real social-listening provider is connected.

## Notes on number formatting safety

- **The bug**: `Intl.NumberFormat` (and `Number.prototype.toLocaleString`,
  which calls it) throws a `RangeError` — `"maximumFractionDigits value
  is out of range"` — whenever `minimumFractionDigits` ends up greater
  than `maximumFractionDigits`, or either one is `NaN`/`undefined`, or
  either falls outside the valid 0-100 range. Several formatters in
  this project called `toLocaleString` with one of those two options
  hardcoded and the other passed through from a caller-supplied
  `decimals` argument. That's exactly what broke the Vercel build:
  `components/calculators/PipValueCalculator.jsx`'s
  `formatContractSize()` called its local `formatNumber(units, 0)` for
  whole-number contract sizes (100,000; 10,000; … down to 1), against
  a helper that hardcoded `minimumFractionDigits: 2` — `max: 0, min: 2`
  throws. This only renders for the Pip Value Calculator's dropdown,
  which Next.js statically prerenders on `/calculators` directly and
  on any `/converters/[pair]` page that embeds it as a mini-widget
  (any pair involving a fiat currency, e.g. `/converters/usd-to-pkr`
  — see `app/converters/[pair]/page.jsx`'s `relatedCalculatorId`
  logic) — a server-side render, so the thrown error failed the build
  instead of just showing a client-side fallback.
- **The fix**: one shared, defensively-clamped wrapper,
  **`lib/formatNumber.js`**'s `formatNumber(value, options)`. It
  returns `"—"` for any non-finite `value` (including `NaN`,
  `undefined`, `Infinity`, or a non-number), clamps
  `maximumFractionDigits` to `[0, 20]` (rounding first, defaulting to
  `2` if missing/`NaN`) — a deliberately tighter ceiling than the
  engine's actual 0-100 allowance, since no formatter in this project
  ever legitimately needs more than a handful of decimal places and a
  lower cap is one more layer of defense — and clamps
  `minimumFractionDigits` to `[0, safeMax]` — i.e. it can never exceed
  the already-clamped maximum, which is the exact constraint the bug
  violated. Every formatter in the project — `GoldCalculator.jsx`,
  `CurrencyConverter.jsx`, `UnitConverter.jsx`,
  `lib/conversionMath.js`, `lib/technicalAnalysis.js`,
  `AiTechnicalAnalysis.jsx`, `app/converters/[pair]/page.jsx`, every
  calculator under `components/calculators/`, and
  `components/academy/MiniLotSizeCalculator.jsx` — now delegates to
  this one function instead of calling `toLocaleString` directly or
  hand-rolling its own clamp (two of them, `GoldCalculator.jsx` and
  `CurrencyConverter.jsx`, had already hit and fixed a sibling version
  of this same bug once before with their own local clamps; those are
  now just thin wrappers around the shared one instead of duplicating
  it).
- **Verified** with a standalone Node script exercising the exact
  crash shape (`max: 0, min: 2` on every real forex/metal/crypto
  contract size the Pip Value Calculator's dropdown actually renders —
  100,000 down to 0.01) plus a broader edge-case sweep: `NaN`/
  `undefined`/`Infinity`/non-number `value`, `NaN`/`undefined`/
  negative/fractional/>100 `maximumFractionDigits`, and
  `minimumFractionDigits` exceeding `maximumFractionDigits` — none of
  which throw after the fix, confirming `npm run build`'s prerendering
  of `/calculators` and every `/converters/[pair]` route is safe
  regardless of which asset/lot combination a page happens to render
  server-side.

## Notes on the Metals & Commodities Calculator math

- Covers 6 assets via a single "Metal / Commodity" dropdown: Gold
  (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD), Copper (XCU)
  and Crude Oil (WTI) — `components/GoldCalculator.jsx`'s
  `ASSET_OPTIONS`. Switching assets re-syncs the base price field to
  that asset's live spot price (`data.metals[code]` or
  `data.commodities.WTI`) and discards any value the user had typed in
  for the previous asset, since a manually-edited gold price has no
  meaning once silver is selected.
- **Gold/Silver/Platinum/Palladium/Copper** (weight-based, via
  `calculateGoldPrice()`):
  - Base input is USD price per troy ounce.
  - Weight units convert via grams: 1 troy oz = 31.1034768 g, 1 tola =
    11.6638038 g, 1 kg = 1000 g.
  - Karat purity (24K / 22K) only applies to Gold — the other four
    assets are always priced at full/100% purity; the Karat selector
    is hidden for them.
  - Local price = (USD/oz ÷ 31.1034768) × karat purity × exchange rate ×
    grams-per-unit × quantity.
- **Crude Oil** (barrel-based, via `calculateFlatUnitPrice()`): no
  weight unit or karat step at all — local price = USD/barrel ×
  exchange rate × quantity (in barrels). The weight-unit dropdown is
  hidden when Crude Oil is selected.
- All of the above lives in `lib/conversionMath.js` so the Metals &
  Commodities Calculator and any future component can reuse the same
  formulas. Crude oil's "USD per unit" is intentionally a *different*
  convention (per barrel, not per troy ounce) from the metals — see the
  comment at the top of `lib/commodities.js` for why it's kept in its
  own registry rather than merged into `lib/metals.js`.

## Notes on the unit converter

- Every category (length, area, weight, volume, speed, digital storage)
  is defined as a flat factor relative to one base unit, so conversion is
  a single multiply/divide — see `UNIT_CATEGORIES` in
  `lib/conversionMath.js`.
- Temperature is handled separately with explicit Celsius/Fahrenheit/
  Kelvin formulas, since those scales aren't simple multiples.
- `lib/unitSlugs.js` maps short URL slugs (`sqft`, `marla`, `km`, `kg`…)
  to `{ category, unit }` pairs, powering `/converters/unit/[slug]`
  (e.g. `/converters/unit/sqft-to-marla`). `FEATURED_UNIT_PAIRS` there
  is pre-rendered at build time via `generateStaticParams`; any other
  valid `<from>-to-<to>` slug still resolves on demand.

## Notes on the unified rates API

`app/api/rates/route.js` fetches four independent sources **in
parallel** with `Promise.all()` and returns one unified JSON shape:

```json
{
  "base": "USD",
  "fiat":   { "USD": 1, "PKR": 278.5, "EUR": 0.92, "...": "..." },
  "crypto": { "BTC": 65234.12, "ETH": 3456.78, "SOL": 142.33, "...": "..." },
  "metals": { "XAU": 2634.50, "XAG": 30.85, "XPT": 912.40, "XPD": 985.10, "XCU": 0.31 },
  "commodities": { "WTI": 75 },
  "sources": { "fiat": "exchangerate-api.com (v6)", "crypto": "coingecko.com", "metals": "metals-api.com", "commodities": "static-fallback" },
  "fetchedAt": "2026-10-09T18:00:00.000Z",
  "revalidateSeconds": 3600,
  "warnings": ["Metal prices unavailable (...); using fallback values."],
  "commodityNote": "Live crude oil pricing isn't wired in yet (no provider configured) — showing a static reference price."
}
```

Conventions (see the long comment at the top of the route file and in
`lib/assetConversion.js` for the full reasoning):

- **`fiat`** keeps the traditional FX convention: "units of X per 1
  USD" (so `fiat.USD` is always `1`).
- **`crypto`** and **`metals`** are both "direct USD value of 1 unit"
  (1 BTC in USD; 1 troy ounce of gold in USD) — metals-api.com actually
  quotes metals the same way fiat does (ounces per 1 USD), so the route
  inverts it server-side before returning, specifically so metals and
  crypto share one convention and the Metals & Commodities Calculator
  can use `metals.XAU` directly as "USD per troy ounce" with no extra
  math.
- **`commodities`** is also "direct USD value of 1 unit," but the unit
  is a **barrel**, not a troy ounce — a deliberately different meaning
  from `metals`, which is why crude oil lives in its own
  `lib/commodities.js` registry and response field rather than being
  folded into `metals` (that would silently break the Currency
  Converter's cross-asset math, which assumes every `metals.*` value is
  per troy ounce).

Each provider call:

- Has its **own** `try/catch` and **own** static fallback
  (`lib/currencies.js`'s `FALLBACK_RATES`, `lib/crypto.js`'s
  `CRYPTO_FALLBACK_USD`, `lib/metals.js`'s `METAL_FALLBACK_USD`,
  `lib/commodities.js`'s `COMMODITY_FALLBACK_USD`) — one provider being
  down or rate-limited never breaks the others, it just adds an entry
  to the top-level `warnings` array and keeps serving fallback numbers
  for that asset class only.
- Has an 8-second hard timeout via `AbortController` (`cachedFetch()` in
  the route file), so a slow/hanging upstream can't stall the whole
  route — this is also what was crashing static prerendering once
  before (see the `formatAmount`/`maximumFractionDigits` fix below);
  the timeout guards against a *different*, request-level failure mode.
- **Metals specifically** has a 3-tier chain, not just keyed → static:
  `fetchFromMetalsApi()` (metals-api.com, needs `METALS_API_KEY`) →
  `fetchFromGoldApi()` (api.gold-api.com, free, no key — supports
  gold/silver/platinum/palladium but *not* copper) → `METAL_FALLBACK_USD`
  (static). A metals-api.com failure that gets rescued by gold-api.com is
  still **live** data, so it does **not** add to `warnings` (which the
  UI treats as "showing stale numbers") — instead the reason
  metals-api.com was skipped is put in a separate, non-UI `metalsDebug`
  field on the response (e.g. `curl your-deployment.vercel.app/api/rates`
  or the Vercel function logs), so a misconfigured key is diagnosable
  without the Metals & Commodities Calculator ever showing an incorrect
  "fallback" badge for data that's actually live.
- **Commodities specifically** (`fetchCommodityPrices()`) is, for now,
  *always* a static reference price — no live crude-oil provider is
  wired in (see the Environment Variables section above). This is a
  by-design, permanent state rather than a degradation, so unlike the
  other three sources it does **not** contribute to the top-level
  `warnings` array (that would falsely show "fallback" on every single
  request even when fiat/crypto/metals are all genuinely live). Instead
  it's surfaced as its own `commodityNote` field — the same
  separation-of-concerns pattern as `metalsDebug` above.

## Notes on the Universal Currency Converter

- `lib/assetConversion.js` is the cross-asset engine: it normalizes
  every asset (fiat, crypto, or metal) to "USD value of 1 unit" via
  `getUsdValue()`, so converting *any* asset to *any* other asset is
  always just `amount * usdValue(from) / usdValue(to)` — implemented in
  `convertBetweenAssets()`. This is how Fiat→Fiat, Crypto→Fiat,
  Metal→Crypto, etc. all work through one code path.
- `lib/currencies.js` (36 fiat currencies), `lib/crypto.js` (12 major
  cryptocurrencies, with their CoinGecko ids), and `lib/metals.js` (5
  metals — gold, silver, platinum, palladium, copper) are the three
  asset registries this converter draws on. Add an asset to any one of
  them and it's immediately available in the converter's picker, in
  `/api/rates`, and (for fiat) in the SEO routes. (Crude oil, in
  `lib/commodities.js`, is deliberately **not** included here — it's
  barrel-priced rather than weight-priced, so folding it into this
  "USD per unit" cross-asset engine would need its own conversion path;
  it's wired into the Metals & Commodities Calculator only, for now.)
- `components/CurrencyConverter.jsx` implements its own searchable,
  **grouped** dropdown (a text input + filtered list with Fiat/Crypto/
  Metals section headers) rather than a native `<select>`, since plain
  selects can't be typed into to filter options or show groups.
- The 24h trend badge is an intentionally labeled placeholder — no
  historical rate store exists yet. See the `TODO` comment in
  `CurrencyConverter.jsx`'s `TrendBadge` for how to wire in a real
  percentage once day-over-day rates are persisted somewhere.
- `lib/fxSlugs.js` maps `<from>-to-<to>` slugs (e.g. `usd-to-pkr`) to
  **fiat** currency codes for `/converters/[pair]` — the SEO route is
  fiat-only by design (that's what people search for), but the
  converter component it renders also lets the visitor switch either
  side to crypto or metals once the page loads. Next.js App Router
  folder names only support a single dynamic segment each, so this
  route lives at `app/converters/[pair]/page.jsx` rather than a literal
  `[from]-to-[to]` folder — the resulting URLs are identical either
  way. It sits safely alongside the separate `app/converters/unit/[slug]`
  route because Next.js always matches a literal folder name (`unit`)
  before a dynamic one at the same level.
- `components/GoldCalculator.jsx` (the Metals & Commodities Calculator)
  auto-fills its "Base Price" field from the selected asset's live spot
  price (`metals.XAU`/`XAG`/`XPT`/`XPD`/`XCU` or `commodities.WTI`) on
  load and whenever a different asset is selected, but only until the
  user types their own value (tracked via a ref to avoid a
  stale-closure bug where the auto-fill could re-trigger after a manual
  edit); hitting "Refresh rates" resets that and re-syncs to the live
  price.

## Notes on Market Analysis & AI News

- **`app/market-analysis/page.jsx`** renders `components/MarketOverviewBoard.jsx`,
  which has its own local light/dark toggle (not tied to OS preference
  or any site-wide setting — see `darkMode: "class"` in
  `tailwind.config.js`) and is now three stacked sections instead of
  the old 15-widget grid:
  1. **`components/TickerStrip.jsx`** — TradingView's free "Ticker
     Tape" embed widget, a slim scrolling strip of 5 high-value
     universal symbols: S&P 500, Nasdaq 100, Gold, BTC/USD, EUR/USD.
     Purpose-built for exactly this "clean top bar" case, instead of
     stacking several Mini Symbol Overview cards side by side.
  2. **`components/MarketDashboard.jsx`** — unchanged: a symbol
     quick-pick row + `TradingChart.jsx`'s full "Advanced Chart"
     widget (`allowSymbolChange: true`, so a visitor can also search
     for any other instrument inside the chart itself).
  3. **`components/AiTechnicalAnalysis.jsx`** — the new "On-Demand AI
     Technical Analysis" panel: pick an instrument and an analysis
     type, hit "Run Analysis," and it calls `GET /api/market-ai` for a
     structured, live-computed result.

  All symbols across this page (and `MarketDashboard.jsx`'s picker)
  stick to TradingView families already confirmed safe in two earlier
  rounds of fixes: direct exchange symbols like `NSE:NIFTY`/
  `PSX:KSE100` show "This symbol is only available on TradingView"
  (gated behind a logged-in account for guest embeds), and a first
  workaround attempt (`AMEX:INDY`/`AMEX:PAK`/`CME:NIY1!`) turned out to
  be "Invalid Symbol" entirely (not in TradingView's database at all).
  The current symbols are all `FOREXCOM:`/`TVC:`/`OANDA:`/`BITSTAMP:`
  — broad, globally-recognized, never gated for anonymous embeds.
- **`app/api/market-ai/route.js`** + **`lib/technicalAnalysis.js`**
  power the AI Technical Analysis panel. `getInstrument()`/
  `resolveInstrumentPrice()` resolve a live USD price for one of 15
  instruments (5 metals, crude oil, 5 crypto, 4 FX pairs — all backed
  by real numbers already available from `lib/marketData.js`'s
  `getUnifiedRates()`, called directly with no self-fetch, same lesson
  as `lib/newsAggregator.js`) from `/api/rates`'s payload. It checks
  `process.env.ANTHROPIC_API_KEY`; absent (or present but not yet
  wired — `generateAiAnalysis()` is a documented stub), it falls
  through to `buildAnalysis()`'s rule-based engine, which **always**
  returns the full report (`analysisType=full_report`, the default) —
  `fibonacci`/`gann` just add one extra section on top, they don't
  replace it:
  - **Buy/Sell/Neutral meter + Technical/Fundamental/Overall Bias**:
    `SCORE_LABEL_BANDS` is the single -100..+100 → Strong Sell..Strong
    Buy source of truth, shared by the gauge (`components/
    SentimentMeter.jsx`) and every bias widget's text label, so they
    can never disagree.
    - **Technical Bias**: `getRangeInfo()` positions the live price
      between its nearest round-number support/resistance (via
      `niceStep()`, the same "nice round number" level spacing used
      for Price Action/Support & Resistance below) and scores it
      -100..+100 — a real, computable range-positioning read ("buy
      near support, sell near resistance"), explicitly **not** a
      trend/momentum signal, since no historical price direction is
      stored anywhere in this deployment.
    - **Fundamental Bias**: `computeUsdStrengthScore()` averages that
      same range-positioning score across EUR/USD, GBP/USD and AUD/USD
      as a simplified USD-strength proxy, then applies a real, named
      macro linkage — USD strength is a headwind for USD-priced assets
      and for other-currency FX pairs, but a tailwind for USD/JPY
      (USD is the *base* currency there, unlike the other three pairs)
      — to the selected instrument. Always labeled "a simplified macro
      linkage, not a comprehensive fundamental analysis."
    - **Overall Market Sentiment**: a blend of the two scores above,
      with an explicit note on whether they're aligned or conflicting.
  - **Price Action** / **Support & Resistance**: fully, honestly
    computable from a single live price via `niceStep()`.
  - **Pivot Points**: the real classic floor-trader formula
    (`P = (H+L+C)/3`, with R1/S1/R2/S2 derived from `P`) applied to an
    explicitly-labeled *illustrative* assumed daily range (the same
    `ILLUSTRATIVE_BAND_PCT` band Fibonacci uses) — the `limitations`
    field says plainly that no real detected daily high/low/close is
    stored, rather than pretending one was.
  - **Fibonacci Retracement** (additive, `analysisType=fibonacci`):
    the real ratio math (23.6/38.2/50/61.8/78.6%) applied to that same
    illustrative band — again, explicit that no real historical swing
    high/low is available.
  - **Oscillators (RSI/EMA/SMA)** and **Gann Theory** (additive,
    `analysisType=gann`): both genuinely need historical price data (a
    close-price sequence; swing points + time cycles) that this
    deployment doesn't store, so rather than fabricate a fake
    single-point reading, both stay explicitly marked unavailable with
    a `limitations` field explaining exactly what's missing and what
    would unlock the real calculation.

  See the large comment at the top of `lib/technicalAnalysis.js` for
  the full reasoning — this is the same "never claim fake AI, always
  say what's real vs. placeholder" bar kept everywhere else in this
  project. The scoring math (including the Technical/Fundamental/
  Overall bias formulas above) was verified with a standalone Node
  simulation against hand-constructed "near support, USD strong" /
  "near resistance, USD weak" / USD-JPY scenarios before shipping —
  not just a syntax check, since this class of logic bug only shows up
  when the module actually runs.
- **`lib/newsAggregator.js`** is the actual news-fetching logic: it
  fetches 7 finance RSS feeds in parallel across 4 categories —
  **Stocks** (Yahoo Finance, MarketWatch, CNBC Markets), **Forex**
  (FXStreet), **Crypto** (CoinDesk, Cointelegraph) and **Commodities**
  (OilPrice.com) — with a small dependency-free parser, each with its
  own `try/catch` (so one feed going down never breaks the others), the
  same 8-second `AbortController` timeout guard used in `/api/rates`,
  and a check for a feed host returning an HTML page with a `200`
  status (rate-limit/WAF interstitial) instead of real RSS/XML, which
  is treated as a failure for that feed rather than silently parsing to
  zero items. If every single feed fails, `getAggregatedNews()` returns
  a small set of clearly-labeled static placeholder items
  (`source: "OmniFin Portal (cached)"`, `isMock: true`) instead of an
  empty list, and sets `usingMockFallback: true` so the UI can say so.
  Reuters' and Bloomberg's own RSS feeds were discontinued/blocked
  (confirmed: both now return robots-disallowed or access-blocked
  responses), so these are their closest still-live, freely-embeddable
  equivalents per category. Each item is tagged with its feed's
  `category`, a rule-based `sentiment` (`computeSentiment()` — a
  keyword scan against small hand-picked Bullish/Bearish word lists,
  always computed, no API key needed), and `relatedAssets`
  (`detectRelatedAssets()` — a word-boundary-aware keyword match
  against `ASSET_KEYWORDS`, e.g. Gold/Silver/Oil/BTC/ETH/USD/EUR/GBP/
  S&P 500; word-boundary matching specifically avoids false positives
  like "Goldman Sachs" or "golden visa" matching "Gold"). Returns each
  real headline with `summary: null` and `summaryStatus:
  "pending_ai_key"` — that part (an actual AI-written summary) is
  still a `TODO`; `getAggregatedNews()` also checks
  `process.env.ANTHROPIC_API_KEY` to report a more specific
  `aiSummarization.status` (`pending_ai_key` vs.
  `key_configured_not_wired`), and returns both a `sentimentTally`
  (Bullish/Bearish/Neutral counts across the current page of items)
  and an `assetSentimentBreakdown` (the same tally, but broken down per
  asset via `relatedAssets` — e.g. `{ Gold: { Bullish: 2, Bearish: 1,
  Neutral: 0 }, USD: {...} }`) for the News page's sentiment cards.
- **`app/api/news-ai/route.js`** is now a thin wrapper: it calls
  `getAggregatedNews()` and returns it as JSON, with its own outer
  `try/catch` as a last-resort guarantee that this route never returns
  anything but valid JSON (`revalidate`/cache headers use the
  900s/15-min window exported from the aggregator module).
- **`app/ai-news/page.jsx`** (the new top-level route — the nav's
  "News" link and the old `app/market-analysis/ai-news/page.jsx`, now
  just a redirect, both point here) calls `getAggregatedNews()`
  **directly** — not over HTTP — then hands the result to
  `components/NewsFeed.jsx`, a client component that does instant
  client-side search (title/excerpt/source) and category-pill
  filtering over that already-small, already-cached list. This directly
  fixes the page's earlier `"Unexpected token '<', <!DOCTYPE ... is not
  valid JSON"` crash: that page is a Server Component rendered during
  static generation/ISR, and it was fetching its *own* `/api/news-ai`
  route by absolute URL (via the now-unused-here `lib/fetchNews.js`) to
  get its data — a Next.js/Vercel self-fetch during server rendering is
  unreliable (the deployment the URL points to isn't guaranteed to be
  live/routable at that point), and whatever intercepted the request
  returned an HTML page instead of JSON, which broke `res.json()`.
  Calling the aggregator function directly removes the HTTP round trip
  (and that whole failure mode) entirely rather than just handling it
  gracefully. `lib/fetchNews.js` is kept only for a genuine client-side
  caller (same pattern as `lib/fetchRates.js` + `GoldCalculator.jsx`),
  and is commented accordingly so this isn't reintroduced later. The
  page also renders two cards above the feed: a **Headline Sentiment by
  Asset** card (real — `assetSentimentBreakdown`'s per-asset Bullish/
  Neutral/Bearish bars from the actual loaded headlines, labeled
  "Rule-based") and the **Social Buzz Tracker**
  (`components/SocialBuzzTracker.jsx`, replacing the old plain "Coming
  soon" placeholder) — see below.
- **`components/NewsFeed.jsx`**'s `NewsCard` now also shows each
  item's rule-based sentiment as a colored badge (green/Bullish, red/
  Bearish, slate/Neutral) next to its category badge, with a tooltip
  noting it's from a keyword scan, not AI-generated, plus one `#Asset`
  pill per entry in its `relatedAssets`.
- **`lib/socialBuzz.js`** + **`app/api/social-buzz/route.js`** +
  **`components/SocialBuzzTracker.jsx`** are the Social Buzz Tracker.
  There is **no** real X/Twitter or Reddit API integration anywhere in
  this codebase — `getSocialBuzz()` generates a per-asset "buzz
  intensity" (0-100) and a Bullish/Bearish/Neutral sentiment split
  using a deterministic seeded PRNG (`mulberry32`, seeded from the
  asset code + the current UTC date-hour bucket via a `djb2`-style
  string hash), so the numbers are **stable within an hour** rather
  than randomly jittering on every page load, but are a simulation,
  never a measurement. `usingLiveApi` is unconditionally `false`; a
  `SOCIAL_API_KEY` env var is checked only to make the UI's own `note`
  text slightly more specific (see the Environment Variables section
  above), never to change the data. The component keeps this unmissable
  at all times: a persistent amber "Simulated" badge, the backend's own
  `note` text rendered verbatim, and a permanently disabled "Use live
  social API" toggle with a tooltip explaining exactly why it's off —
  this is the same honesty-over-fabrication bar kept everywhere else in
  this project, never a silent "looks live" placeholder.

## Notes on programmatic SEO converter routes & structured data

- **`app/converters/[pair]/page.jsx`** now resolves `<from>-to-<to>`
  slugs across **all three** asset classes — fiat, crypto, metals —
  not just FX: `/converters/usd-to-pkr`, `/converters/btc-to-usd`,
  `/converters/xau-to-usd` all work through the same route.
  `lib/pairSlugs.js`'s `parsePairSlug()` resolves each side's code
  against `CURRENCY_CODES`/`CRYPTO_CODES`/`METAL_CODES` in turn (no
  collisions between the three sets — verified) and returns `null` for
  anything unrecognized, which triggers `notFound()`. `lib/fxSlugs.js`
  is unchanged and still powers `app/converters/page.jsx`'s existing
  fiat-only "Popular Currency Pairs" directory listing — `pairSlugs.js`
  is a separate, additive superset used only by the dynamic route.
- The page is now an `async` Server Component that calls
  `getUnifiedRates()` **directly** (via `lib/marketData.js`, no
  self-fetch — same architectural lesson as `lib/newsAggregator.js`)
  to resolve a live rate for this specific pair via
  `getPairRate()` (`lib/assetConversion.js`). That rate feeds both the
  page's "1 X = Y" summary line and the JSON-LD below; if it's
  genuinely unavailable, both simply omit it rather than guessing — the
  client-side `CurrencyConverter` component still renders and fetches
  its own live rate independently either way.
- **`generateMetadata()`** builds a per-pair `title`/`description`,
  `alternates.canonical`, and `openGraph`/`twitter` tags from
  `lib/siteUrl.js`'s `getSiteUrl()` (falls back through
  `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → `localhost:3000`, same chain
  `lib/fetchRates.js` already used internally).
- **`components/ConverterStructuredData.jsx`** renders one
  `<script type="application/ld+json">` with an `"@graph"` of two
  entities:
  - A **`FinancialProduct`** describing the specific pair, with
    `additionalProperty` `PropertyValue`s for the base/quote asset,
    their classes, and — only when a live rate was actually resolved
    server-side — `exchangeRate` and `exchangeRateAsOf`. No
    `aggregateRating`/review fields are included anywhere, since this
    project has no real review data to back one (same
    never-fabricate-structured-data bar as the rest of this project).
  - A **`WebApplication`** describing the converter tool itself
    (`applicationCategory: "FinanceApplication"`, a free `Offer`).
- **`components/PopularPairs.jsx`** is the internal cross-linking
  block at the bottom of every converter SEO page — "Popular Currency
  & Metal Pairs" — rendering `lib/pairSlugs.js`'s `FEATURED_PAIRS`
  (16 curated pairs spanning all three classes) as links, excluding
  whichever pair is already on-screen. Helps search engines discover
  the other programmatic routes and keeps visitors on-site.
- `generateStaticParams()` pre-renders all of `FEATURED_PAIRS` at build
  time; any other valid `<from>-to-<to>` combination across the three
  registries still resolves on demand (Next.js's default
  `dynamicParams` behavior).

## Notes on the OmniFin Academy

- **Curriculum (`lib/academyData.js`)**: 5 skill levels, mirroring
  BabyPips' "School of Pipsology" progression — **Rookie** (Foundations
  of Money & Wealth: inflation, money vs. fiat, fractional reserve
  banking, gold vs. paper money), **Apprentice** (Market Mechanics &
  Charting: candlestick anatomy, bid/ask spreads, pips & lot sizes,
  order types), **Analyst** (Technical Precision & Indicators:
  support/resistance, RSI, moving averages, Fibonacci, Gann basics),
  **Strategist** (Macro Fundamentals & Sentiment: central bank rates,
  NFP & news trading, market sentiment), and **Pro Trader** (Risk
  Management & Psychology: position sizing math, risk-to-reward,
  trading journal, FOMO/greed). 20 lessons total, 100 quiz questions
  total (5 per lesson) — verified by a standalone Node script asserting
  every quiz has 4-5 questions, every `correctOptionId` actually exists
  among that question's `options`, no duplicate level/lesson/question
  IDs, and that lesson adjacency correctly crosses level boundaries
  (e.g. Rookie's last lesson's "next" is Apprentice's first).
- Each lesson is a list of typed **sections** — `text` (heading + body
  + optional bullet list), `proTip` (emerald-accent highlighted
  callout), `risk` (rose-accent risk-warning callout — leverage,
  revenge trading, moved stops, and other genuinely dangerous habits,
  not just a generic "be careful"), `formula` (blue-accent key-formula/
  concept card), `visual` (a diagram card), and `tool` (an embedded
  OmniFin calculator) — rendered generically by
  `components/academy/LessonViewer.jsx`, so adding a new lesson is a
  pure data change in `lib/academyData.js`, no new component code. 3
  lessons (Position Sizing Math, Risk-to-Reward Ratio, Controlling
  FOMO & Greed) got a `risk` section added in natural, already-relevant
  spots rather than being retrofitted everywhere.
- **`components/academy/LessonVisualCard.jsx`** is a toolkit of ~13
  reusable, parameterized inline-SVG diagram kinds — `candlestick`,
  `support-resistance`, `risk-reward`, `bid-ask`, `ma-crossover`,
  `rsi`, `fibonacci`, `timeline`, `comparison`, `flow`, `gauge`,
  `grid`, `ladder` — rather than one hand-drawn image per lesson. Each
  lesson's `diagram` spec just picks a kind and supplies small data
  (e.g. `{ kind: "risk-reward", riskUnits: 1, rewardUnits: 2 }`), which
  keeps every diagram genuinely illustrative of its concept (candlestick
  anatomy, a support/resistance breakout, a 1:2 risk-reward setup, etc.)
  without needing bespoke artwork per lesson.
- **Embedded tools (`components/academy/EmbeddedTool.jsx`)**: a lesson
  section can embed a real OmniFin tool inline via `{ type: "tool",
  toolId }`. `"metals-calculator"` reuses the platform's existing
  `components/GoldCalculator.jsx` as-is (live spot prices, weight
  units, karat purity) inside the "Gold vs. Paper Money" lesson;
  `"lot-size-calculator"` is a small new
  `components/academy/MiniLotSizeCalculator.jsx` (pure client-side
  arithmetic — `Lot Size ≈ Risk Amount ÷ (Stop-Loss Pips × Pip Value
  per Lot)`, with an explicit note that pip value varies by pair rather
  than presenting its $10/pip default as universal) embedded in both
  "Pips & Lot Sizes" and "Position Sizing Math."
- **Checkpoint Quiz engine (`components/academy/QuizModule.jsx`)**: one
  question at a time, the selected option locks and shows instant
  emerald (correct)/rose (incorrect) highlighting plus that question's
  `explanation`; the final question's "Next" becomes "See Results,"
  which shows a score card — pass/fail against the lesson's
  `passPercent` (80%, i.e. 4 of 5 — `PASS_PERCENT` in
  `lib/academyData.js`), a full correct-answer recap, and "Retake Quiz"
  / "Proceed to Next Chapter" buttons (the proceed button only renders
  once the quiz is actually passed). `QuizModule` itself holds no
  localStorage dependency — it reports the finished result via
  `onFinish({ score, total, percent, passed })`, and
  `components/academy/LessonViewer.jsx` is what persists that through
  `hooks/useAcademyProgress.js`. Verified with a standalone script
  confirming 4/5 → 80% → passed and 3/5 → 60% → not passed.
- **Progress & unlocking (`hooks/useAcademyProgress.js`)**: a
  `localStorage`-backed hook (key `omnifin.academy.progress.v1`) that
  never throws — a blocked/corrupted/private-browsing localStorage just
  falls back to a fresh in-memory session rather than breaking the
  page. A lesson only counts as completed once its quiz is **passed**
  (not merely attempted); Level 1 is always unlocked, and Level N
  unlocks only once every lesson in Level N-1 has been completed —
  verified with a standalone script confirming Apprentice stays locked
  at 3-of-4 Rookie lessons done and unlocks exactly at 4-of-4. Exposes
  `isLessonCompleted`, `getQuizResult`, `recordQuizResult`,
  `isLevelUnlocked`, `isLevelMastered`, `getLevelProgressPercent`,
  `overallPercent`/`overallCompletedCount`/`overallTotalLessons`,
  `currentLevel` (the first level not yet fully mastered), and
  `resetProgress()`.
- **`app/learn/page.jsx`** + **`components/academy/AcademyHub.jsx`**:
  the hub is a thin server component (for its `metadata` export)
  wrapping the actual "use client" hub UI — same page/component split
  as `app/ai-news/page.jsx` + `NewsFeed.jsx` elsewhere in this project,
  since progress lives in `localStorage`, which only exists
  client-side. Shows the "Level N — X% Completed" progress banner, and
  either the Master Path roadmap or a Focused Track View — see the
  dedicated subsection below for both.
- **`app/learn/[level]/[lesson]/page.jsx`** + **`components/academy/LessonViewer.jsx`**:
  `generateStaticParams()` pre-renders all 20 lessons at build time;
  an unknown level/lesson slug calls `notFound()`. The lesson page
  renders a sticky bottom nav bar (Previous / "Jump to Quiz" / Next),
  and if the lesson's level is still locked (deep-linked directly on
  the Master Path), shows a locked notice with a link back to the hub
  instead of the lesson content.

### Dark theme redesign & the Master Path / Focused Track architecture fix

- **A permanently dark theme, not a toggle.** The whole Academy
  (`app/learn/**`) now renders on a fixed dark palette — `bg-ink`
  (`#0b0f19`, a new token added in `tailwind.config.js`) for the page
  background, Tailwind's own `gray-900` (`#111827`, an exact match for
  the requested glassmorphic-card color) for cards, and `gray-800`
  (`#1f2937`, an exact match for the requested muted border color) for
  borders — regardless of the rest of the (light-themed) site. This is
  deliberately different from the `dark:`-variant toggle pattern used
  by `components/MarketOverviewBoard.jsx` elsewhere in this project:
  the Academy is always dark, not user-togglable, so its components use
  plain (non-`dark:`-prefixed) classes against these fixed tokens.
- **A fixed 3-color semantic accent system**, used identically across
  the hub and every lesson page: Electric Blue (`blue-500`/`#3b82f6` —
  an exact match for Tailwind's own default `blue-500`) for primary
  CTAs and the reading-progress stepper; Emerald (`emerald-500`/
  `#10b981`, also an exact Tailwind default) for pro-tips and
  mastered/correct states; Soft Rose (`rose-500`/`#f43f5e`, also exact)
  for risk warnings and incorrect/failing states. No new color tokens
  were needed for these three — they're exact matches for Tailwind's
  stock palette, confirmed before using them.
- **`components/academy/LessonVisualCard.jsx`'s 13 diagram kinds** were
  recolored for legibility against the new dark cards (labels and
  structural lines that were tuned for a white background — e.g.
  `#64748b`, `#334155`, `#1e293b`, `#e2e8f0` — became lighter/darker
  dark-appropriate equivalents), while the semantic colors (bull
  green, bear red, the formula-line blue/gold) were left as-is since
  they already read fine on dark. The diagram "stage" inside each
  `Frame` is a recessed `bg-black/25` panel on the `gray-900` card, the
  same look used for every other dark card on this page.
- **`components/academy/EmbeddedTool.jsx`** now frames each embedded
  calculator in a dark `gray-900`/`gray-800` card rather than
  recoloring the calculator itself — those tools (`GoldCalculator`,
  `MiniLotSizeCalculator`, the `MiniCalculatorWidget` registry) are
  shared components also used on their own light-themed pages
  elsewhere (the homepage, the Calculators Hub), so changing their
  internal colors here would have changed how they look everywhere
  else too. The frame is the same idea as a screenshot not needing to
  match the color of the page it's embedded in.
- **Architecture fix — Master Path vs. Focused Track View.** Previously,
  selecting a category filter (Forex/Metals/Crypto/etc.) reused the
  same flat lesson grid as a text search AND still applied the
  roadmap's level-unlock gating (a locked lesson rendered
  `pointer-events-none`/grayed out) — so browsing "just the Forex
  lessons" was full of dead ends past Level 1. Now the first tab is
  relabeled **Master Path** and is the *only* place level-locking
  renders at all (it's the 5-level roadmap — sequential unlocking is
  the entire point there). Every other view — a category tab, or a
  text search — is a flat, frictionless **Focused Track View**: every
  matching lesson is always a real, clickable link regardless of its
  level's unlock state on the Master Path. Verified with a Node script
  confirming, against the real curriculum data, that the Forex track
  alone spans Levels 2 through 5 — lessons that would previously have
  been locked dead ends unless the Master Path had already been
  cleared in order.
- **`LessonViewer.jsx`'s new sticky top bar** (`LessonTopBar`) is a
  real reading-progress stepper — a `scroll`/`resize`-driven percentage
  of how far down the lesson the visitor has scrolled (not just a
  static section-count), alongside the lesson's level tag and estimated
  read time, sticking just below the site's own global header
  (`sticky top-16`, under the global nav's `sticky top-0`/`h-16`) so
  the two sticky bars never overlap or fight each other.
- **Verification methodology**: bracket-balance checked via
  `/tmp/balcheck.py` across every new/changed file; `node --check` on
  `lib/academyData.js`; and Node.js scripts (via a small ESM loader
  that resolves this project's `@/` import alias) that import the real
  `lib/academyData.js` end-to-end — confirming every section type
  across all 20 lessons/95 sections is one `LessonViewer.jsx` actually
  renders, every diagram `kind` is one `LessonVisualCard.jsx` actually
  renders, every quiz question's `correctOptionId` resolves to a real
  option, every one of the 5 level `theme`s has a matching entry in
  both `AcademyHub.jsx`'s and `LessonViewer.jsx`'s theme maps, every
  category has at least one lesson (so no Focused Track View can ever
  render empty), and — the architecture fix's key claim — that the
  Forex Focused Track genuinely spans multiple levels beyond Level 1.
  All checks passed with 0 failures.

## Notes on the Calculators Hub

- **`lib/tradingCalculators.js`** and **`lib/personalCalculators.js`**
  hold all the math for the seven calculators as plain, dependency-free
  functions (no React, no `fetch`) — `calculateLotSize`,
  `calculatePipValue`, `calculateRiskReward`, `calculateMargin`,
  `calculateInflation`, `calculateCompoundGrowth`, and
  `calculateMarginMarkup`. Each returns `null` on invalid/incomplete
  input rather than a misleading `NaN`-filled result, matching the
  pattern established by `MiniLotSizeCalculator.jsx`. Verified end-to-
  end with a standalone Node script exercising every function with
  known numbers (e.g. a $10,000 account risking 1% with a 20-pip stop
  at $10/pip → exactly 0.5 standard lots / 5 mini / 50 micro; a 50-pip
  risk vs. 100-pip reward → exactly a 1:2 ratio; $50,000 notional at
  1:100 leverage on a $1,000 account → exactly $500 required margin and
  a 200% margin level).
- **Position & Lot Size Calculator**: the same formula as the Academy's
  `MiniLotSizeCalculator.jsx` (`Lot Size ≈ Risk Amount ÷ (Stop-Loss
  Pips × Pip Value per Lot)`), extended to also report the Mini (×10)
  and Micro (×100) lot equivalents.
- **Pip Value Calculator**: a dropdown of 31 real, named tradable
  instruments (`lib/tradingCalculators.js`'s `TRADABLE_PAIRS`), grouped
  into four `<optgroup>`s by `PAIR_CATEGORIES`:
  - **Forex** — majors & minors (EUR/USD, GBP/USD, USD/JPY, AUD/USD,
    USD/CAD, USD/CHF, NZD/USD), crosses (EUR/GBP, EUR/JPY, GBP/JPY,
    AUD/JPY, NZD/JPY), and regional PKR pairs (USD/PKR, EUR/PKR,
    GBP/PKR, AED/PKR, SAR/PKR).
  - **Commodities & Metals** — XAU/USD (Gold), XAG/USD (Silver),
    XPT/USD (Platinum), XCU/USD (Copper), WTI/USD (Crude Oil),
    BRENT/USD (Brent Oil).
  - **Indices** — US30 (Dow Jones), US500 (S&P 500), NAS100 (Nasdaq),
    GER40 (DAX — the only instrument quoted in EUR rather than USD,
    which exercises the same live-rate conversion as everything else
    rather than assuming USD).
  - **Crypto** — BTC/USD, ETH/USD, SOL/USD, XRP/USD, BNB/USD.

  Pip/tick/point precision and contract size both auto-detect from the
  pair's `instrumentType` (seven of them: `forex`, `forex-jpy`,
  `forex-pkr`, `metal`, `energy`, `index`, `crypto`), each with its own
  genuinely-different convention rather than one borrowed from forex:
  `0.0001` for standard FX; `0.01` for JPY pairs and for PKR-quoted
  pairs (PKR's larger nominal value puts its pip at the 2nd decimal,
  the same reasoning as JPY); a user-selectable `0.01`-or-`0.1` for
  metals and energy (both conventions are genuinely in use across
  brokers); a user-selectable `0.1`-or-`1.0` point for indices; and a
  single, explicitly-labeled-as-non-standard `$1` tick for crypto.
  Switching pairs always resets the pip/tick selector to the new
  pair's own default. Contract size per lot is equally
  instrument-specific (`CONTRACT_SIZES`) — 100,000/10,000/1,000 units
  for every forex variant, 100/10/1 troy ounces for metals,
  1,000/100/10 barrels for energy, and a 1/0.1/0.01 stand-in scale for
  both indices and crypto (labeled in the UI as this calculator's own
  scale, not an exchange standard, since neither has one). Pip value
  in the quote currency (`pipSize × contract size`) is converted live
  to USD and PKR using the same unified, hourly-cached rates payload
  every other calculator on the platform reads (`lib/fetchRates.js` /
  `app/api/rates/route.js`), with a visible live/fallback status dot
  and a safe fallback-rate table (`lib/currencies.js`) if the live
  fetch fails — never a blank result, and never a build-time crash
  either (see "Notes on number formatting safety" above for the
  RangeError this combination caused during SSG before the fix).
  Verified with a Node script covering all 31 instruments × all 3 lot
  sizes (93 combinations, none throwing, every USD/PKR conversion
  finite) plus spot-checks (EUR/USD → exactly $10/pip on a standard
  lot; USD/PKR → correctly computed in PKR then converted through the
  live PKR/USD rate; GER40 → correctly computed in EUR, not silently
  assumed as USD; WTI/USD → $10/pip on a 1,000-barrel standard lot;
  ETH/USD micro → $0.01 on a 0.01 ETH stand-in contract).
- **Risk / Reward Ratio Calculator**: deliberately takes raw entry /
  stop-loss / take-profit price levels plus a position size in base-
  asset units rather than a "pips" concept, so the same calculator
  works unmodified for forex, metals, crypto, or stocks. Also flags
  (without blocking) when the take-profit looks like it's on the wrong
  side of entry for the implied trade direction — a likely data-entry
  mistake, not a math error.
- **Margin & Leverage Calculator**: `Required Margin = Position Size ÷
  Leverage`; also reports free margin and a simplified `Balance ÷
  Required Margin` margin-level percentage, with a visible warning if
  the position size would leave free margin negative at the selected
  leverage (1:50 through 1:500 presets, plus a custom leverage input).
- **Inflation & Purchasing Power Calculator**: compounds a historical
  annual rate forward from a past year to the current year and reports
  two distinct figures that are often conflated — "Equivalent Today"
  (the nominal amount you'd need now for the same buying power) and
  "Real Value Today" / "Erosion" (what the *original* cash amount is
  actually worth today, in today's purchasing-power terms, which is
  always less than the original amount at a positive inflation rate).
- **Compound Interest / Wealth Growth Calculator**: simulates month-by-
  month compounding (growth applied, then the monthly contribution
  added) rather than annual compounding, and renders a year-by-year
  table (contributed / growth / balance) alongside the final totals —
  verified to be strictly monotonically increasing and to match
  `totalContributed = initial + monthly × months` exactly.
- **Business Profit Margin & Markup Calculator**: intentionally returns
  both **margin** (`profit ÷ selling price`) and **markup** (`profit ÷
  cost`) side by side, since they're different numbers for the same
  sale and are commonly confused.
- **`components/calculators/MiniCalculatorWidget.jsx`** is the shared
  "quick mini-widget" embed used outside the hub itself: a
  `calculatorId` in, the matching full calculator component out, with a
  small header linking back to `/calculators#<id>` for the rest of the
  suite. It's wired into two places per the brief:
  - **Academy lessons**, via `components/academy/EmbeddedTool.jsx`'s
    `TOOL_REGISTRY` — `"pip-value-calculator"` in "Pips & Lot Sizes",
    `"risk-reward-calculator"` in "Risk-to-Reward Ratio", and
    `"margin-calculator"` in "Position Sizing Math" (alongside the
    lesson's existing `lot-size-calculator`).
  - **Converter pages** (`app/converters/[pair]/page.jsx`), which embed
    the Pip Value Calculator for any pair involving a fiat currency
    (the kind a forex trader would actually size a position on) and the
    asset-agnostic Margin & Leverage Calculator for crypto/metals-only
    pairs — always something contextually useful, never a blank slot.
- **`app/calculators/page.jsx`** + **`components/calculators/CalculatorsHub.jsx`**:
  same thin-server-shell/`"use client"`-body split as the Academy and
  News modules (no `localStorage` dependency here, but it keeps the
  pattern consistent and lets the page export `metadata`). The hub
  itself switches between the two category tabs by unmounting the
  other category's calculators — the same tab pattern
  `ConvertersTabs.jsx` already uses elsewhere on the platform — with
  each calculator keeping a stable `id` anchor (`#lot-size`,
  `#pip-value`, etc.) that mini-widgets and other pages link back to.

## Notes on the Community Forum

- **`app/community/page.jsx`** + **`components/community/CommunityHub.jsx`**:
  same thin-server-shell/`"use client"`-body split used by the Academy
  and Calculators modules — the server shell exports `metadata`, the
  client component owns the interactive state (category tabs, search,
  asset-tag filter pills, the post feed, and the "Share Trade Setup /
  Insight" trigger).
- **Seed data is explicitly illustrative, not live activity.**
  `lib/communityData.js` ships 9 seeded posts spanning all four
  categories ("Trade Setups & Ideas", "Macro & News Speculation",
  "Financial Literacy") and all four asset tags (#Gold, #Forex,
  #Crypto, #Indices). The forum's stats header is honest about this:
  - **Active Traders** and **Shared Setups** are genuinely *derived*
    counts over the visible post data (unique author handles; posts
    with a Long/Short bias) — real arithmetic on demo data, not
    invented numbers.
  - **Accuracy Rate** has no backend that tracks whether any posted
    Entry/Target/Stop Loss actually played out, so rather than
    fabricate a percentage, the card reads "Not tracked yet" with a
    footnote explaining why — the same no-fabrication discipline as
    the Social Buzz Tracker's persistent "Simulated" badge and the
    Pip Value Calculator's non-standard-instrument disclaimers.
- **No real chart images exist anywhere in this app.** Each
  `TradePostCard.jsx` renders an inline-SVG "chart preview" whose
  squiggle is deterministically derived from a seeded hash of the
  post's id (and nudged by its Long/Short bias), so the same post
  always renders the same squiggle instead of jittering on every
  re-render — but it is permanently labeled "Illustrative only — not
  a real chart" directly on the preview, both in the feed and in the
  "Expand Setup" modal. It is never presented as real market data.
- **First true overlay modal in this codebase.**
  `components/community/Modal.jsx` is a `position: fixed` backdrop +
  centered panel (Escape-to-close, backdrop-click-to-close, body-scroll
  lock) — distinct from `academy/QuizModule.jsx`'s inline "ScoreCard"
  swap, which is not an overlay. It's reused by both
  `CreatePostModal.jsx` (the post-submission form) and
  `TradePostCard.jsx`'s "Expand Setup" detail view.
- **Votes and the "Bullseye Setup" tag are toggle state, not
  accumulating counters.** `hooks/useCommunityPosts.js` persists only
  the current browser's own choice per post (`"up"`/`"down"`/none for
  votes, a boolean for Bullseye) in `localStorage`, following the same
  SSR-safe hydration pattern as `useAcademyProgress.js` (safe empty
  state on the server, hydrated from storage after mount). The
  displayed count is always `seed base + (1 if this browser's current
  toggle matches)`, computed fresh on every render — so clicking the
  same button again toggles it back off, and reloading the page shows
  the same count as before rather than one that keeps climbing. This
  was a deliberate design choice to avoid a trivial exploit (a visitor
  inflating a count forever just by refreshing and re-clicking).
- **"Share Trade Setup / Insight" has a genuine local-storage
  submission fallback.** `CreatePostModal.jsx` validates title/body
  are non-empty, then calls the hook's `addPost()`, which prepends a
  fully-formed post (zeroed base counts, `isUserSubmitted: true`,
  a real `createdAt` timestamp) to `localStorage`-backed state. The new
  post renders at the top of the feed immediately — no backend,
  database, or page reload required — and carries a small "Your post"
  badge so it's clear which posts are the current browser's own.
- **Verification methodology** (same no-`npm install` constraint as
  every other module in this project): bracket-balance checked via
  `/tmp/balcheck.py`, `node --check` on the two plain-`.js` files
  (`lib/communityData.js`, `hooks/useCommunityPosts.js`), and a Node.js
  simulation script exercising the extracted pure logic end-to-end —
  seed-data integrity (every category/asset-tag reference resolves;
  directional posts have non-null Entry/SL/TP, discussion posts don't);
  the vote/Bullseye toggle state machine (upvote, re-click toggles off,
  switching from up to down doesn't stack, counts are stable across a
  simulated "reload"); `addPost` + category/asset-tag/search filtering;
  derived stats arithmetic; and the chart-placeholder hash function's
  determinism and output bounds. All checks passed with 0 failures.

## Notes on Compliance, Legal Pages & Dynamic SEO Indexing

- **Four static legal/compliance pages** (`app/about`, `app/disclaimer`,
  `app/privacy`, `app/terms`), each a plain server component — no
  `"use client"` split needed, since there's no interactive state —
  styled consistently with the rest of the site (breadcrumb nav,
  gradient header section, `max-w-3xl` prose body).
  - **About Us** states OmniFin Portal's educational/utility mandate
    up front and is explicit about what's real vs. simulated/rule-based
    across the site (rates, technical analysis, Social Buzz Tracker,
    Community Forum chart placeholders, aggregated news) — the same
    no-fabrication convention already used throughout the product,
    now written down as a user-facing policy rather than just an
    in-UI label.
  - **Financial Disclaimer** is the load-bearing page: an explicit,
    unambiguous "nothing on this site is financial, investment,
    trading, legal, or tax advice" banner up top, plus numbered
    sections covering no-warranty-on-data, simulated/illustrative
    content, user-generated Community Forum content, past-performance,
    trading risk, and limitation of liability.
  - **Privacy Policy** and **Terms of Service** cover the standard set
    Google AdSense requires — cookies/advertising, third-party data
    providers, analytics, children's privacy, acceptable use,
    intellectual property, and limitation of liability — and are
    specific about a real architectural detail: Academy progress and
    Community Forum vote/Bullseye/post state live only in the visitor's
    own browser's `localStorage` and are never transmitted to a server,
    which both policies state plainly rather than describing a generic
    "we may collect..." data flow that doesn't match how the app
    actually works.
  - All four pages cross-link each other (About → Disclaimer → Privacy
    → Terms) so a reader lands on the right policy regardless of which
    one they opened first.
- **`app/sitemap.js`** uses Next.js's built-in sitemap file convention
  (a default-exported function returning `{url, lastModified,
  changeFrequency, priority}` entries), served automatically at
  `/sitemap.xml` — no hand-written XML template. It lists every static
  route (including the four new legal pages) plus every dynamic route
  that's actually pre-rendered at build time, reusing each route's own
  `generateStaticParams()` source list rather than a separate hard-coded
  copy, so the sitemap can never silently drift out of sync with what's
  really pre-rendered:
  - `/converters/[pair]` — `lib/pairSlugs.js`'s `FEATURED_PAIRS` (14 pairs)
  - `/converters/unit/[slug]` — `lib/unitSlugs.js`'s `FEATURED_UNIT_PAIRS` (12 pairs)
  - `/learn/[level]/[lesson]` — `lib/academyData.js`'s `getAllLessonsFlat()` (every lesson, all 5 levels)

  `changeFrequency`/`priority` are tiered by how often each page's
  content actually changes: the homepage and rate-driven pages
  (converters, market analysis, news, community) are `daily`; the
  Academy and unit converters (pure math, nothing time-sensitive) are
  `weekly`/`monthly`; the four legal pages are `monthly`/`yearly`
  with low priority, since they're compliance pages, not traffic pages.
- **`app/robots.js`** uses the matching built-in robots convention,
  served at `/robots.txt`, allowing all crawlers everywhere except
  `/api/*` (live data endpoints meant for this app's own client code,
  not indexing) and `/_next/` (build output, not a real route), and
  points its `Sitemap:` directive at the exact same `getSiteUrl()` the
  sitemap uses, so the two can never point at different hosts.
- **Footer now carries real compliance links.** `app/layout.jsx`'s
  `SiteFooter` previously had no links at all (just a copyright line);
  it now renders an explicit `FOOTER_LINKS` row — About, Privacy
  Policy, Terms of Service, Financial Disclaimer, and Sitemap — plus an
  inline link to the Disclaimer next to the existing "informational
  purposes only" line. The header nav's "About" link, which previously
  pointed to a `/#about` anchor inside the footer (there was no real
  About page yet), now points to the real `/about` page; the footer's
  old `id="about"` anchor was removed since nothing links to it anymore.
- **Verification methodology**: bracket-balance checked via
  `/tmp/balcheck.py` across all 7 new/changed files (all 4 legal pages
  needed their JSX-text apostrophes escaped to `&apos;` per this
  project's established convention — the balance checker treats a raw
  `'` as a string delimiter everywhere, so an unescaped contraction like
  "it's" can swallow real brackets after it; the two `metadata.description`
  strings that happened to contain an apostrophe were deliberately left
  as real `'` characters, since those are plain JS string literals, not
  JSX text, and `&apos;` would render literally in a `<meta>` tag rather
  than being decoded); `node --check` on `sitemap.js`/`robots.js`; and a
  Node.js script that actually imports the real `lib/pairSlugs.js`,
  `lib/unitSlugs.js`, and `lib/academyData.js` modules (via a small ESM
  loader that resolves this project's `@/` import alias, since Node
  can't resolve it natively) and runs `app/sitemap.js`'s and
  `app/robots.js`'s actual default exports end-to-end — confirming all
  60 sitemap entries are well-formed absolute URLs with valid dates,
  known `changeFrequency` values, in-range priorities, and no
  duplicates, and that the three dynamic-route counts exactly match
  each page's own `generateStaticParams()` list length. All checks
  passed with 0 failures.

## Roadmap

- **Phase 3 (planned)**: Simulators module — ROI calculator, budget
  planner (Recharts-based), client-side only.
- **Phase 4 (planned)**: SEO content (educational articles), sitemap
  generation, Google Search Console submission, AdSense application.
