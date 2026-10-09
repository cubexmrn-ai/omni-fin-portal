# OmniFin Portal

A Next.js 14 (App Router) + Tailwind CSS finance portal.

- **Module 1 — Converters**: a dedicated FX currency converter (36
  world currencies, searchable pickers, rate matrix), a gold rate
  calculator, and a worldwide unit converter (length, area, weight,
  volume, speed, digital storage, temperature — including Tola, Maund,
  Seer, Marla and Kanal), all tabbed together with programmatic SEO
  routes for both currency pairs and unit pairs.
- **Module 2 — Market AI & News**: real-time TradingView charts and a
  multi-source finance news aggregator (AI summaries are a placeholder
  until an Anthropic API key is configured).

## Stack

- Next.js 14 (App Router, React 18)
- Tailwind CSS 3
- Serverless route handlers with ISR-style 900s revalidation
  (`app/api/rates/route.js`, `app/api/news-ai/route.js`)
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
    rates/route.js            # Gold/FX exchange rates (900s cache)
    news-ai/route.js          # RSS aggregator; AI summary placeholder
  converters/
    page.jsx                  # Tabbed directory (FX / Gold / Units) + featured pairs
    [pair]/page.jsx           # Programmatic SEO routes for FX pairs, e.g. usd-to-pkr
    unit/[slug]/page.jsx      # Programmatic SEO routes, e.g. sqft-to-marla
  market-analysis/
    page.jsx                  # Live TradingView chart dashboard
    ai-news/page.jsx          # Headline feed (AI summary coming soon)
  layout.jsx                  # Header, nav, footer
  page.jsx                    # Homepage dashboard
  globals.css
components/
  CurrencyConverter.jsx       # FX converter: searchable pickers, swap, rate matrix
  ConvertersTabs.jsx          # Tab shell switching Currency / Gold / Units
  GoldCalculator.jsx          # Gold & currency calculator (uses lib/conversionMath)
  UnitConverter.jsx           # Universal multi-category unit converter
  TradingChart.jsx            # TradingView "Advanced Chart" embed wrapper
  MarketDashboard.jsx         # Symbol picker + TradingChart
lib/
  conversionMath.js           # All conversion math (gold + units + temperature)
  currencies.js                # Master currency list + fallback rates
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

- `EXCHANGERATE_API_KEY` (optional) — a key from
  [exchangerate-api.com](https://www.exchangerate-api.com/) enables the
  higher-limit `v6` endpoint. Without a key, the route falls back to the
  free `open.er-api.com` endpoint, and finally to static rates if both
  are unreachable, so the app always renders.
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

## Notes on the FX currency converter

- `lib/currencies.js` holds the full list of 36 supported currencies
  (code, name, symbol, flag, fallback rate) — add a currency there once
  and it's immediately available in the Gold Calculator, the FX
  Converter, `/api/rates`, and the SEO routes.
- `/api/rates` now returns rates for every currency in that list (one
  cached upstream call, shared by both the Gold Calculator and the FX
  Converter) instead of a hard-coded 6-currency subset.
- `components/CurrencyConverter.jsx` implements its own searchable
  dropdown (a text input + filtered list) rather than a native
  `<select>`, since plain selects can't be typed into to filter options.
- The 24h trend badge is an intentionally labeled placeholder — no
  historical rate store exists yet. See the `TODO` comment in
  `CurrencyConverter.jsx`'s `TrendBadge` for how to wire in a real
  percentage once day-over-day rates are persisted somewhere.
- `lib/fxSlugs.js` maps `<from>-to-<to>` slugs (e.g. `usd-to-pkr`) to
  currency codes for `/converters/[pair]`. Next.js App Router folder
  names only support a single dynamic segment each, so this route lives
  at `app/converters/[pair]/page.jsx` rather than a literal
  `[from]-to-[to]` folder — the resulting URLs are identical either way.
  It sits safely alongside the separate `app/converters/unit/[slug]`
  route because Next.js always matches a literal folder name (`unit`)
  before a dynamic one at the same level.

## Notes on Market Analysis

- `components/TradingChart.jsx` embeds TradingView's free, public
  "Advanced Chart" widget (`s3.tradingview.com/external-embedding/...`)
  — no API key or account required.
- `app/api/news-ai/route.js` fetches and merges several finance RSS
  feeds with a small dependency-free parser, caches the result for 15
  minutes, and returns each headline with `summary: null` and
  `summaryStatus: "pending_ai_key"`. Wiring in `ANTHROPIC_API_KEY` and
  calling the Claude API per-headline is the next step (see the `TODO`
  comment in that file).

## Roadmap

- **Phase 3 (planned)**: Simulators module — ROI calculator, budget
  planner (Recharts-based), client-side only.
- **Phase 4 (planned)**: SEO content (educational articles), sitemap
  generation, Google Search Console submission, AdSense application.
