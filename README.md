# OmniFin Portal

A Next.js 14 (App Router) + Tailwind CSS finance portal.

- **Module 1 — Converters**: a cross-asset Universal Currency Converter
  (36 fiat currencies + 12 cryptocurrencies + 4 precious metals, any
  asset to any other, searchable pickers, rate matrix), a gold rate
  calculator (auto-filled from the live XAU spot price), and a
  worldwide unit converter (length, area, weight, volume, speed,
  digital storage, temperature — including Tola, Maund, Seer, Marla and
  Kanal), all tabbed together with programmatic SEO routes for both
  currency pairs and unit pairs.
- **Module 2 — Market AI & News**: real-time TradingView charts
  (gold, forex, global indices including PSX KSE-100 and India's Nifty
  50, crude oil, crypto) and a multi-source finance news aggregator
  (AI summaries are a placeholder until an Anthropic API key is
  configured).

## Stack

- Next.js 14 (App Router, React 18)
- Tailwind CSS 3
- A unified rates API fetching Fiat (ExchangeRate-API), Crypto
  (CoinGecko) and Metals (metals-api.com) **in parallel** via
  `Promise.all()`, each with its own timeout and fallback, cached with
  ISR-style 3600s (1 hour) revalidation (`app/api/rates/route.js`)
- A separate RSS news aggregator route with the same timeout/fallback
  pattern, cached for 900s (`app/api/news-ai/route.js`)
- TradingView public embed widget (no API key required)

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
    rates/route.js            # Unified Fiat+Crypto+Metals rates (3600s cache)
    news-ai/route.js          # RSS aggregator; AI summary placeholder
  converters/
    page.jsx                  # Tabbed directory (Currency / Gold / Units) + featured pairs
    [pair]/page.jsx           # Programmatic SEO routes for FX pairs, e.g. usd-to-pkr
    unit/[slug]/page.jsx      # Programmatic SEO routes, e.g. sqft-to-marla
  market-analysis/
    page.jsx                  # Live TradingView chart dashboard
    ai-news/page.jsx          # Headline feed (AI summary coming soon)
  layout.jsx                  # Header, nav, footer
  page.jsx                    # Homepage dashboard
  globals.css
components/
  CurrencyConverter.jsx       # Cross-asset converter: Fiat/Crypto/Metals, swap, rate matrix
  ConvertersTabs.jsx          # Tab shell switching Currency / Gold / Units
  GoldCalculator.jsx          # Gold calculator (auto-fills live XAU; uses lib/conversionMath)
  UnitConverter.jsx           # Universal multi-category unit converter
  TradingChart.jsx            # TradingView "Advanced Chart" embed wrapper
  MarketDashboard.jsx         # Symbol picker (incl. PSX, Nifty) + TradingChart
lib/
  conversionMath.js           # All conversion math (gold + units + temperature)
  currencies.js                # Master fiat currency list + fallback rates
  crypto.js                    # Master cryptocurrency list + fallback USD prices
  metals.js                    # Master precious-metal list + fallback USD/troy-oz prices
  assetConversion.js           # Cross-asset "convert anything to anything" engine
  unitSlugs.js                # URL-slug <-> unit mapping for SEO routes
  fxSlugs.js                   # URL-slug <-> currency-pair mapping for SEO routes
  fetchRates.js                # Shared caller for /api/rates
  fetchNews.js                 # Shared caller for /api/news-ai
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
  platinum/palladium spot prices from that provider. If it's missing, or
  the call fails for any reason (wrong plan, a `base` currency
  restriction, bad/expired key, quota spent), the route automatically
  falls back to [api.gold-api.com](https://api.gold-api.com/), a free,
  keyless provider, so metal prices stay **live** either way. Only if
  both providers are unreachable does it drop to static fallback
  numbers for that asset class — fiat and crypto are unaffected
  regardless. See "Notes on the unified rates API" below for how to
  read the `metalsDebug` field when diagnosing a METALS_API_KEY issue.
- `ANTHROPIC_API_KEY` (not required yet) — once added, wire it into the
  `TODO` in `app/api/news-ai/route.js` to generate a `summary` for each
  headline via the Claude API. Until then, `summary` is `null` and the
  UI shows an "AI summary coming soon" placeholder.

## Notes on the gold calculator math

- Base input is USD price per troy ounce at 24K purity.
- Weight units convert via grams: 1 troy oz = 31.1034768 g, 1 tola =
  11.6638038 g.
- Karat purity is applied as a fraction of 24K (22K = 22/24).
- Local price = (USD/oz ÷ 31.1034768) × karat purity × exchange rate ×
  grams-per-unit × quantity.
- All of the above lives in `lib/conversionMath.js` so both the Gold
  Calculator and any future component can reuse the same formulas.

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

`app/api/rates/route.js` fetches three independent sources **in
parallel** with `Promise.all()` and returns one unified JSON shape:

```json
{
  "base": "USD",
  "fiat":   { "USD": 1, "PKR": 278.5, "EUR": 0.92, "...": "..." },
  "crypto": { "BTC": 65234.12, "ETH": 3456.78, "SOL": 142.33, "...": "..." },
  "metals": { "XAU": 2634.50, "XAG": 30.85, "XPT": 912.40, "XPD": 985.10 },
  "sources": { "fiat": "exchangerate-api.com (v6)", "crypto": "coingecko.com", "metals": "metals-api.com" },
  "fetchedAt": "2026-10-09T18:00:00.000Z",
  "revalidateSeconds": 3600,
  "warnings": ["Metal prices unavailable (...); using fallback values."]
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
  crypto share one convention and the Gold Calculator can use
  `metals.XAU` directly as "USD per troy ounce, 24K" with no extra math.

Each of the three provider calls:

- Has its **own** `try/catch` and **own** static fallback (`lib/currencies.js`'s
  `FALLBACK_RATES`, `lib/crypto.js`'s `CRYPTO_FALLBACK_USD`, `lib/metals.js`'s
  `METAL_FALLBACK_USD`) — one provider being down or rate-limited never
  breaks the other two, it just adds an entry to the top-level `warnings`
  array and keeps serving fallback numbers for that asset class only.
- Has an 8-second hard timeout via `AbortController` (`cachedFetch()` in
  the route file), so a slow/hanging upstream can't stall the whole
  route — this is also what was crashing static prerendering once
  before (see the `formatAmount`/`maximumFractionDigits` fix below);
  the timeout guards against a *different*, request-level failure mode.
- **Metals specifically** has a 3-tier chain, not just keyed → static:
  `fetchFromMetalsApi()` (metals-api.com, needs `METALS_API_KEY`) →
  `fetchFromGoldApi()` (api.gold-api.com, free, no key) → `METAL_FALLBACK_USD`
  (static). A metals-api.com failure that gets rescued by gold-api.com is
  still **live** data, so it does **not** add to `warnings` (which the
  UI treats as "showing stale numbers") — instead the reason
  metals-api.com was skipped is put in a separate, non-UI `metalsDebug`
  field on the response (e.g. `curl your-deployment.vercel.app/api/rates`
  or the Vercel function logs), so a misconfigured key is diagnosable
  without the Gold Calculator ever showing an incorrect "fallback" badge
  for data that's actually live.

## Notes on the Universal Currency Converter

- `lib/assetConversion.js` is the cross-asset engine: it normalizes
  every asset (fiat, crypto, or metal) to "USD value of 1 unit" via
  `getUsdValue()`, so converting *any* asset to *any* other asset is
  always just `amount * usdValue(from) / usdValue(to)` — implemented in
  `convertBetweenAssets()`. This is how Fiat→Fiat, Crypto→Fiat,
  Metal→Crypto, etc. all work through one code path.
- `lib/currencies.js` (36 fiat currencies), `lib/crypto.js` (12 major
  cryptocurrencies, with their CoinGecko ids), and `lib/metals.js` (4
  precious metals) are the three asset registries. Add an asset to any
  one of them and it's immediately available in the converter's picker,
  in `/api/rates`, and (for fiat) in the SEO routes.
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
- `components/GoldCalculator.jsx` now auto-fills its "Base Gold Price"
  field from the live `metals.XAU` value on load, but only until the
  user types their own value (tracked via a ref to avoid a stale-closure
  bug where the auto-fill could re-trigger after a manual edit); hitting
  "Refresh rates" resets that and re-syncs to the live price.

## Notes on Market Analysis & AI News

- `components/TradingChart.jsx` embeds TradingView's free, public
  "Advanced Chart" widget (`s3.tradingview.com/external-embedding/...`)
  — no API key or account required. `components/MarketDashboard.jsx`'s
  symbol picker covers gold, global indices (S&P 500, Pakistan's
  KSE-100 via `PSX:KSE100`, India's Nifty 50 via `NSE:NIFTY`), major FX
  pairs, crude oil and Bitcoin — add more by appending to its `SYMBOLS`
  array with any valid TradingView ticker.
- `app/api/news-ai/route.js` fetches and merges several finance RSS
  feeds (Yahoo Finance, MarketWatch, CNBC) in parallel with a small
  dependency-free parser, each with its own `try/catch` (so one feed
  going down never breaks the others) and the same 8-second
  `AbortController` timeout guard used in `/api/rates`. Caches the
  result for 900s (15 min) and returns each headline with
  `summary: null` and `summaryStatus: "pending_ai_key"`. Wiring in
  `ANTHROPIC_API_KEY` and calling the Claude API per-headline is the
  next step (see the `TODO` comment in that file).

## Roadmap

- **Phase 3 (planned)**: Simulators module — ROI calculator, budget
  planner (Recharts-based), client-side only.
- **Phase 4 (planned)**: SEO content (educational articles), sitemap
  generation, Google Search Console submission, AdSense application.
