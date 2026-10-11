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
  layout.jsx                  # Header, nav, footer
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
lib/
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
hooks/
  useAcademyProgress.js         # localStorage-backed Academy progress: completed lessons, quiz
                                # scores, level-unlock logic, overall % — see its header comment
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
  + optional bullet list), `proTip` (a highlighted callout), `formula`
  (a key-formula/concept badge), `visual` (a diagram card), and `tool`
  (an embedded OmniFin calculator) — rendered generically by
  `components/academy/LessonViewer.jsx`, so adding a new lesson is a
  pure data change in `lib/academyData.js`, no new component code.
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
- **Quiz engine (`components/academy/QuizModule.jsx`)**: one question
  at a time, the selected option locks and shows instant green
  (correct)/red (incorrect) highlighting plus that question's
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
  client-side. Shows the "Level N — X% Completed" progress banner,
  a 5-card level roadmap (lesson/quiz counts, estimated minutes,
  "Mastered"/"Locked" states, a per-level progress bar), and a
  search + `CATEGORIES` topic filter (Forex, Metals, Crypto, Personal
  Finance, Technicals) that switches the roadmap grid into a flat,
  filtered lesson list.
- **`app/learn/[level]/[lesson]/page.jsx`** + **`components/academy/LessonViewer.jsx`**:
  `generateStaticParams()` pre-renders all 20 lessons at build time;
  an unknown level/lesson slug calls `notFound()`. The lesson page
  renders a sticky bottom nav bar (Previous / "Jump to Quiz" / Next),
  and if the lesson's level is still locked (deep-linked directly),
  shows a locked notice with a link back to the hub instead of the
  lesson content.

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
- **Pip Value Calculator**: a dropdown of real, named tradable pairs
  (`lib/tradingCalculators.js`'s `TRADABLE_PAIRS` — EUR/USD, GBP/USD,
  USD/JPY, AUD/USD, USD/CAD, USD/CHF, XAU/USD, BTC/USD), not a bare
  "pick any quote currency" selector. Pip/tick precision auto-detects
  from the pair's `instrumentType`: `0.0001` for standard FX, `0.01`
  for JPY pairs, and a user-selectable `0.01` or `0.1` for gold (both
  conventions are genuinely in use across brokers, so neither is
  silently assumed — switching pairs always resets the toggle to that
  pair's default). Contract size per lot is also instrument-specific
  (`CONTRACT_SIZES`) — 100,000/10,000/1,000 units for forex, 100/10/1
  troy ounces for gold, and a 1/0.1/0.01 BTC scale for crypto (called
  out in the UI as this calculator's own stand-in scale, since crypto
  has no broker-standardized "lot" at all). Pip value in the quote
  currency (`pipSize × contract size`) is converted live to USD and PKR
  using the same unified, hourly-cached rates payload every other
  calculator on the platform reads (`lib/fetchRates.js` /
  `app/api/rates/route.js`), with a visible live/fallback status dot
  and a safe fallback-rate table (`lib/currencies.js`) if the live
  fetch fails — never a blank result. Verified with a Node script
  covering every pair (EUR/USD → exactly $10/pip on a standard lot;
  USD/JPY → pip value correctly computed in JPY then converted through
  the JPY/USD rate; gold at both 0.01 and 0.1 pip sizes; BTC's $1 tick)
  plus every pair ID resolving to a valid instrument type.
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

## Roadmap

- **Phase 3 (planned)**: Simulators module — ROI calculator, budget
  planner (Recharts-based), client-side only.
- **Phase 4 (planned)**: SEO content (educational articles), sitemap
  generation, Google Search Console submission, AdSense application.
