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
- **Module 2 — Market AI & News**: a Global Markets Overview of live,
  lightweight TradingView widgets grouped by Indices (S&P 500, Nasdaq
  100, Nifty 50, PSX KSE-100, Nikkei 225), major Forex pairs and top
  Crypto assets, plus a detailed full chart with a symbol picker — all
  with a light/dark toggle — and a categorized Financial News page
  (Forex / Crypto / Commodities / Stocks) with search and category
  filters, aggregated from multiple public RSS sources (AI summaries
  are a placeholder until an Anthropic API key is configured).

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
    rates/route.js            # Unified Fiat+Crypto+Metals+Commodities rates (3600s cache)
    news-ai/route.js          # Thin JSON wrapper around lib/newsAggregator.js
  converters/
    page.jsx                  # Tabbed directory (Currency / Metals & Commodities / Units) + featured pairs
    [pair]/page.jsx           # Programmatic SEO routes for FX pairs, e.g. usd-to-pkr
    unit/[slug]/page.jsx      # Programmatic SEO routes, e.g. sqft-to-marla
  market-analysis/
    page.jsx                  # Global Markets Overview + detailed chart (light/dark)
    ai-news/page.jsx          # Redirects to /ai-news (legacy path, kept for old links)
  ai-news/
    page.jsx                  # Categorized Financial News page (search + category pills)
  layout.jsx                  # Header, nav, footer
  page.jsx                    # Homepage dashboard
  globals.css
components/
  CurrencyConverter.jsx       # Cross-asset converter: Fiat/Crypto/Metals, swap, rate matrix
  ConvertersTabs.jsx          # Tab shell switching Currency / Metals & Commodities / Units
  GoldCalculator.jsx          # Metals & Commodities calculator (6-asset selector; auto-fills
                                # live spot prices; uses lib/conversionMath) — filename kept
                                # for history, the component/UI is no longer gold-only
  UnitConverter.jsx           # Universal multi-category unit converter
  TradingChart.jsx            # TradingView "Advanced Chart" embed wrapper
  MiniSymbolWidget.jsx        # TradingView "Mini Symbol Overview" embed wrapper (lightweight)
  MarketOverviewBoard.jsx     # Indices/Forex/Crypto grid + AI Insights card + light/dark toggle + detailed chart
  MarketDashboard.jsx         # Symbol picker (global indices) + TradingChart
  NewsFeed.jsx                 # Client-side search + category filter over fetched headlines
lib/
  conversionMath.js           # All conversion math (weight/karat metals pricing,
                                # flat-unit commodity pricing, units + temperature)
  currencies.js                # Master fiat currency list + fallback rates
  crypto.js                    # Master cryptocurrency list + fallback USD prices
  metals.js                    # Master metals list (incl. Copper) + fallback USD/troy-oz prices
  commodities.js               # Crude Oil (barrel-priced) — deliberately separate from metals.js
  assetConversion.js           # Cross-asset "convert anything to anything" engine
  unitSlugs.js                # URL-slug <-> unit mapping for SEO routes
  fxSlugs.js                   # URL-slug <-> currency-pair mapping for SEO routes
  fetchRates.js                # Client-side caller for /api/rates (GoldCalculator)
  newsAggregator.js            # The actual RSS fetch/parse/fallback logic — called
                                # directly by app/ai-news/page.jsx, not over HTTP
  fetchNews.js                 # Client-side-only caller for /api/news-ai (unused
                                # server-side — see comment in the file for why)
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
- `ANTHROPIC_API_KEY` (not required yet) — once added, wire it into the
  `TODO` in `app/api/news-ai/route.js` to generate a `summary` for each
  headline via the Claude API. Until then, `summary` is `null` and the
  UI shows an "AI summary coming soon" placeholder.

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
  `tailwind.config.js`) driving three categorized grids of
  `components/MiniSymbolWidget.jsx` (TradingView's free "Mini Symbol
  Overview" widget — much lighter than the full Advanced Chart, which
  matters when rendering 15 of them on one page):
  - **Indices**: S&P 500 (`FOREXCOM:SPXUSD`), Nasdaq 100
    (`FOREXCOM:NSXUSD`), FTSE 100 (`TVC:UKX`), DAX (`TVC:DAX`), Nikkei
    225 (`TVC:NI225`)
  - **Forex**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD
  - **Crypto**: Bitcoin, Ethereum, BNB, Solana, XRP

  The Indices group avoided two different TradingView failure modes
  while landing on this set: (1) direct exchange symbols like
  `NSE:NIFTY`/`PSX:KSE100` show "This symbol is only available on
  TradingView" in the free, anonymous embed widget, because that data
  vendor gates them behind a logged-in TradingView account for guest/
  third-party embeds; and (2) a first attempt at working around that
  with `AMEX:INDY`/`AMEX:PAK`/`CME:NIY1!` turned out to be invalid
  tickers entirely ("Invalid Symbol" — a different failure mode, not
  gating). The current set uses only broad, globally-recognized index
  CFDs/benchmarks (`FOREXCOM:`/`TVC:`) that are never gated for
  anonymous embeds and are confirmed valid TradingView symbols.
  Pakistan/KSE-100 was dropped entirely rather than guess a third proxy
  — no reliable free substitute was found. Add/remove symbols by
  editing the `INDEX_SYMBOLS` / `FOREX_SYMBOLS` / `CRYPTO_SYMBOLS`
  arrays at the top of `MarketOverviewBoard.jsx` — the same
  substitution was applied to `components/MarketDashboard.jsx`'s
  `SYMBOLS` array (which also keeps `AMEX:INDA`, a US-listed India ETF,
  as its own detailed-chart option). Below the grid, the same toggle
  also drives `MarketDashboard.jsx` (the original full-size,
  symbol-picker chart via `TradingChart.jsx`) so the whole page is
  consistently themed rather than a dark grid sitting above a chart
  that's still light, or vice versa.
- **`MarketInsightsCard`** (top of `MarketOverviewBoard.jsx`) is a
  rule-based "AI Market Commentary & Technical Sentiment" summary card
  generated from the same live `/api/rates` payload — USD strength vs.
  EUR/GBP, gold sentiment, and BTC's position relative to a few round
  price levels (`buildInsights()`). It's explicitly labeled "Live
  snapshot · full AI analysis coming soon" rather than claiming to be
  AI-generated, since the underlying logic is deterministic, not an LLM
  call.
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
  `category`. Returns each real headline with `summary: null` and
  `summaryStatus: "pending_ai_key"`. Wiring in `ANTHROPIC_API_KEY` and
  calling the Claude API per-headline is the next step (see the `TODO`
  comment in that file).
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
  and is commented accordingly so this isn't reintroduced later.

## Roadmap

- **Phase 3 (planned)**: Simulators module — ROI calculator, budget
  planner (Recharts-based), client-side only.
- **Phase 4 (planned)**: SEO content (educational articles), sitemap
  generation, Google Search Console submission, AdSense application.
