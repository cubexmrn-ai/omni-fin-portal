// lib/calculatorsRegistry.js
//
// Single source of truth describing every calculator on the
// Calculators Hub (app/calculators/page.jsx): its id, which category
// tab it belongs to, and its hub-card copy. Both
// components/calculators/CalculatorsHub.jsx (the full hub grid) and
// components/calculators/MiniCalculatorWidget.jsx (the compact embeds
// used inside Academy lessons and Converter pages) key off the same
// `id`s here, so adding a calculator anywhere only means adding one
// entry to this list plus wiring its component into the two registries
// in CalculatorsHub.jsx / MiniCalculatorWidget.jsx.

export const CALCULATOR_CATEGORIES = [
  { id: "trading", label: "Trading Tools" },
  { id: "personal", label: "Wealth & Personal Finance" },
];

export const CALCULATORS = [
  {
    id: "lot-size",
    category: "trading",
    title: "Position & Lot Size Calculator",
    description:
      "Enter your account balance, risk %, and stop-loss distance to get the exact Standard, Mini, and Micro lot sizes that match your risk tolerance.",
  },
  {
    id: "pip-value",
    category: "trading",
    title: "Pip Value Calculator",
    description:
      "See what one pip is worth in USD and PKR for any quote currency and lot size — live-rate powered, with a safe fallback when rates can't be fetched.",
  },
  {
    id: "risk-reward",
    category: "trading",
    title: "Risk / Reward Ratio Calculator",
    description:
      "Enter your entry, stop-loss, and take-profit to see the dollar risk, dollar reward, and R:R ratio (e.g. 1:3) for a trade before you place it.",
  },
  {
    id: "margin",
    category: "trading",
    title: "Margin & Leverage Calculator",
    description:
      "Enter your account balance, leverage (1:100 to 1:500), and position size to see the exact margin required and how much free margin remains.",
  },
  {
    id: "inflation",
    category: "personal",
    title: "Inflation & Purchasing Power Calculator",
    description:
      "See how much a past amount has eroded in real purchasing power — and what nominal amount you'd need today for the same buying power.",
  },
  {
    id: "compound-growth",
    category: "personal",
    title: "Compound Interest / Wealth Growth Calculator",
    description:
      "Project a monthly-contribution investment plan forward with a year-by-year compounding growth table.",
  },
  {
    id: "profit-margin",
    category: "personal",
    title: "Business Profit Margin & Markup Calculator",
    description:
      "Enter your cost and selling price to see both your gross margin % (profit as a % of price) and markup % (profit as a % of cost).",
  },
];

export function getCalculator(id) {
  return CALCULATORS.find((c) => c.id === id) || null;
}

export function getCalculatorsByCategory(categoryId) {
  return CALCULATORS.filter((c) => c.category === categoryId);
}
