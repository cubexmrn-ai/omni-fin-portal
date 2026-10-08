# OmniFin Portal

A Next.js 14 (App Router) + Tailwind CSS finance portal. Phase 1 ships a
universal currency & gold rate calculator with live exchange rates served
from a cached serverless API route.

## Stack

- Next.js 14 (App Router, React 18)
- Tailwind CSS 3
- Serverless route handler with ISR-style 900s revalidation (`app/api/rates/route.js`)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  api/rates/route.js   # Serverless rates endpoint (900s cache)
  layout.jsx           # Header, nav, footer
  page.jsx             # Dashboard home page
  globals.css          # Tailwind entrypoint + base styles
components/
  GoldCalculator.jsx   # Universal currency & gold rate calculator
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

## Notes on the calculator math

- Base input is USD price per troy ounce at 24K purity.
- Weight units convert via grams: 1 troy oz = 31.1034768 g, 1 tola =
  11.6638038 g.
- Karat purity is applied as a fraction of 24K (22K = 22/24).
- Local price = (USD/oz ÷ 31.1034768) × karat purity × exchange rate ×
  grams-per-unit × quantity.
