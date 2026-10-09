# OmniFin Portal

A Next.js 14 (App Router) + Tailwind CSS finance portal.

- **Module 1 — Converters**: universal currency & gold rate calculator,
  plus a worldwide unit converter (length, area, weight, volume, speed,
  digital storage, temperature — including Tola, Maund, Seer, Marla and
  Kanal), with programmatic SEO routes.
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
    page.jsx                  # Converter directory + featured pairs
    unit/[slug]/page.jsx      # Programmatic SEO routes, e.g. sqft-to-marla
  market-analysis/
    page.jsx                  # Live TradingView chart dashboard
    ai-news/page.jsx          # Headline feed (AI summary coming soon)
  layout.jsx                  # Header, nav, footer
  page.jsx                    # Homepage dashboard
  globals.css
components/
  GoldCalculator.jsx          # Gold & currency calculator (uses lib/conversionMath)
  UnitConverter.jsx           # Universal multi-category unit converter
  TradingChart.jsx            # TradingView "Advanced Chart" embed wrapper
  MarketDashboard.jsx         # Symbol picker + TradingChart
lib/
  conversionMath.js           # All conversion math (gold + units + temperature)
  unitSlugs.js                # URL-slug <-> unit mapping for SEO routes
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
