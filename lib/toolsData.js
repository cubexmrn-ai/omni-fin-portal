// lib/toolsData.js
//
// Phase 3 AEO/LLMO pass (Oct 30 2026): single source of truth for the
// Household Financial Tools list, extracted out of app/tools/page.jsx
// so it can be reused by app/llms-full.txt/route.js — that route
// already generates its Converter/Amount/Zakat/Unit/Lesson/Guide
// sections directly from each feature's own data array specifically
// to guarantee it can never drift out of sync (see that file's header
// comment), but the Household Tools were previously missing entirely:
// they only existed as a hardcoded array inside the hub page
// component, invisible to the LLM index. This file is now that single
// source; app/tools/page.jsx imports it instead of defining its own
// copy.
//
// Deliberately excludes the Utility Tools Suite (word counter, JSON
// formatter, etc.) — those are genuinely useful but carry no AEO/GEO
// citation value for a finance answer engine, and keeping only the
// finance calculators here (not, say, a second parallel array with
// icon references) keeps this file simple and genuinely single-
// purpose rather than a second thing to keep in sync with app/tools/
// page.jsx's own UTILITY_TOOLS (which still lives there, unchanged).

export const HOUSEHOLD_TOOLS = [
  {
    href: "/tools/gold-jewellery-calculator",
    title: "Gold & Jewellery Price Calculator",
    description:
      "Live gold value by tola, gram or karat, plus making charges, GST/VAT, and an old-gold exchange credit.",
  },
  {
    href: "/tools/loan-emi-tax-calculator",
    title: "Loan EMI & Salary Tax Calculator",
    description:
      "Your monthly loan installment and payoff schedule, or a quick Pakistan salary-tax estimate.",
  },
  {
    href: "/tools/zakat-calculator",
    title: "Zakat Calculator",
    description:
      "Gold, silver, cash and savings checked against the live nisab threshold — 2.5% zakat-due estimate.",
  },
  {
    href: "/tools/savings-inflation-calculator",
    title: "Savings & Inflation Calculator",
    description:
      "What inflation does to cash left idle, versus saving and topping it up over time — in plain language.",
  },
  {
    href: "/tools/retirement-calculator",
    title: "Retirement Savings Calculator",
    description:
      "Projected balance at retirement age, plus a 4%-rule income estimate against your own target.",
  },
  {
    href: "/tools/401k-vs-roth-ira-calculator",
    title: "401(k) vs Roth IRA Calculator",
    description:
      "Compare Traditional and Roth accounts at the exact same paycheck cost — see which wins after tax.",
  },
  {
    href: "/tools/compound-interest-calculator",
    title: "Compound Interest Calculator",
    description:
      "Final balance, total contributed, and total growth for any amount plus monthly contributions.",
  },
  {
    href: "/tools/net-worth-tracker",
    title: "Net Worth Tracker",
    description:
      "List your assets and liabilities for an instant net worth figure, saved only to your own browser.",
  },
];
