"use client";

// components/ai-news/MiniCalculatorPreview.jsx
//
// Nov 1 2026 engagement/retention round: GA4 showed visitors reading
// the AI summary on /ai-news/[slug] and leaving without ever
// interacting with a calculator, even when a sharp, topic-matched CTA
// (lib/calculatorCtaMatch.js) was sitting right below it — a link to a
// full tool page is still a full page redirect, and that's exactly the
// friction point losing the click. This renders a genuinely
// interactive, 2-slider mini-preview of the matched calculator INLINE
// on the news page itself, so the first interaction happens with zero
// navigation.
//
// HONESTY / CONSISTENCY: every mini-preview below reuses the EXACT
// same calculation functions from lib/personalCalculators.js as the
// corresponding full /tools/* page (RetirementSavingsCalculator.jsx,
// TraditionalVsRothCalculator.jsx, CompoundInterestCalculator.jsx,
// NetWorthTracker.jsx) — never separate, re-derived math — so a number
// shown here can never drift from what the full calculator would show
// for the same inputs. The non-slider inputs each preview fixes (e.g.
// retirement age, assumed return rate) are the same sensible defaults
// those full calculators themselves open with, clearly stated in the
// result caption so nothing is hidden.
//
// Pre-fill: extractHeadlineHints() looks for a literal dollar figure
// or age the headline's OWN text names (e.g. "$80,000", "age 50") and
// pre-fills the sliders with it when found — never fabricated, and it
// quietly falls back to a plain default whenever the headline doesn't
// name one.

import { useMemo, useState } from "react";
import {
  calculateCompoundGrowth,
  calculateTraditionalVsRothGrowth,
  calculateNetWorth,
} from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";
import TrackedCtaLink from "@/components/TrackedCtaLink";

const SAFE_WITHDRAWAL_RATE_PERCENT = 4;
const DEFAULT_RETIREMENT_AGE = 65;
const DEFAULT_MONTHLY_CONTRIBUTION = 300;
const DEFAULT_ANNUAL_RETURN_PERCENT = 7;

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

function extractHeadlineHints(text) {
  const haystack = text || "";

  let amount = null;
  const amountMatch = haystack.match(/\$\s?([\d,]+(?:\.\d+)?)\s*(k|m)?\b/i);
  if (amountMatch) {
    let value = parseFloat(amountMatch[1].replace(/,/g, ""));
    const suffix = amountMatch[2]?.toLowerCase();
    if (suffix === "k") value *= 1_000;
    if (suffix === "m") value *= 1_000_000;
    if (Number.isFinite(value) && value > 0) amount = Math.round(value);
  }

  let age = null;
  const ageMatch =
    haystack.match(/\bage\s+(\d{1,3})\b/i) || haystack.match(/\b(\d{1,3})[- ]year[- ]old/i);
  if (ageMatch) {
    const value = parseInt(ageMatch[1], 10);
    if (Number.isFinite(value) && value >= 18 && value <= 99) age = value;
  }

  return { amount, age };
}

function Slider({ label, value, onChange, min, max, step, formatValue }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span className="text-sm font-bold text-brand-700">
          {formatValue ? formatValue(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-brand-600"
      />
    </label>
  );
}

function RetirementMiniPreview({ headlineText }) {
  const { amount, age } = useMemo(() => extractHeadlineHints(headlineText), [headlineText]);
  const [currentAge, setCurrentAge] = useState(age || 35);
  const [currentSavings, setCurrentSavings] = useState(amount || 25000);

  const years = Math.max(1, DEFAULT_RETIREMENT_AGE - currentAge);
  const result = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount: currentSavings,
        monthlyContribution: DEFAULT_MONTHLY_CONTRIBUTION,
        annualReturnPercent: DEFAULT_ANNUAL_RETURN_PERCENT,
        years,
      }),
    [currentSavings, years]
  );
  const monthlyIncome = result ? (result.finalBalance * (SAFE_WITHDRAWAL_RATE_PERCENT / 100)) / 12 : null;

  useTrackCalculation(
    "ai_news_mini_calculator_interact",
    result ? `${currentAge}:${currentSavings}` : null,
    { tool_name: "retirement_mini_preview", current_age: currentAge, current_savings: currentSavings }
  );

  return (
    <>
      <p className="text-sm font-semibold text-slate-900">
        If you have {formatNumber(currentSavings)} saved at age {currentAge}, here&apos;s your projected
        retirement timeline:
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={64} step={1} />
        <Slider
          label="Current Savings"
          value={currentSavings}
          onChange={setCurrentSavings}
          min={0}
          max={500000}
          step={1000}
          formatValue={formatNumber}
        />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-3">
        {result ? (
          <>
            <p className="text-2xl font-extrabold text-slate-900">{formatNumber(result.finalBalance)}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Projected balance at age {DEFAULT_RETIREMENT_AGE}, assuming a{" "}
              {formatNumber(DEFAULT_MONTHLY_CONTRIBUTION)}/mo contribution and {DEFAULT_ANNUAL_RETURN_PERCENT}%/yr
              return — roughly {formatNumber(monthlyIncome)}/mo under the widely-used &ldquo;4% rule&rdquo;.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Adjust the sliders to see a projection.</p>
        )}
      </div>
    </>
  );
}

function RothMiniPreview({ headlineText }) {
  const { amount } = useMemo(() => extractHeadlineHints(headlineText), [headlineText]);
  const [monthlyContribution, setMonthlyContribution] = useState(amount && amount < 5000 ? amount : 500);
  const [currentTaxRate, setCurrentTaxRate] = useState(24);

  const result = useMemo(
    () =>
      calculateTraditionalVsRothGrowth({
        monthlyContribution,
        annualReturnPercent: DEFAULT_ANNUAL_RETURN_PERCENT,
        years: 20,
        currentTaxRate,
        retirementTaxRate: 15,
      }),
    [monthlyContribution, currentTaxRate]
  );

  useTrackCalculation(
    "ai_news_mini_calculator_interact",
    result ? `${monthlyContribution}:${currentTaxRate}` : null,
    { tool_name: "401k_vs_roth_mini_preview", monthly_contribution: monthlyContribution, current_tax_rate: currentTaxRate }
  );

  return (
    <>
      <p className="text-sm font-semibold text-slate-900">
        Contributing {formatNumber(monthlyContribution)}/mo at a {currentTaxRate}% tax rate today — Traditional
        or Roth, over 20 years:
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          min={50}
          max={3000}
          step={50}
          formatValue={formatNumber}
        />
        <Slider
          label="Current Tax Rate"
          value={currentTaxRate}
          onChange={setCurrentTaxRate}
          min={0}
          max={45}
          step={1}
          formatValue={(v) => `${v}%`}
        />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-3">
        {result ? (
          <>
            <p className="text-2xl font-extrabold text-slate-900">
              {result.betterAccount === "tie"
                ? "Tied"
                : result.betterAccount === "roth"
                ? "Roth wins"
                : "Traditional wins"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              by {formatNumber(Math.abs(result.netDifference))} after tax, assuming a 15% tax rate at
              retirement and a {DEFAULT_ANNUAL_RETURN_PERCENT}%/yr return.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Adjust the sliders to compare.</p>
        )}
      </div>
    </>
  );
}

function CompoundInterestMiniPreview({ headlineText }) {
  const { amount } = useMemo(() => extractHeadlineHints(headlineText), [headlineText]);
  const [initialAmount, setInitialAmount] = useState(amount || 10000);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount,
        monthlyContribution: 100,
        annualReturnPercent: DEFAULT_ANNUAL_RETURN_PERCENT,
        years,
      }),
    [initialAmount, years]
  );

  useTrackCalculation(
    "ai_news_mini_calculator_interact",
    result ? `${initialAmount}:${years}` : null,
    { tool_name: "compound_interest_mini_preview", initial_amount: initialAmount, years }
  );

  return (
    <>
      <p className="text-sm font-semibold text-slate-900">
        Starting with {formatNumber(initialAmount)}, here&apos;s what {years} years of compounding looks like:
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider
          label="Initial Amount"
          value={initialAmount}
          onChange={setInitialAmount}
          min={0}
          max={200000}
          step={1000}
          formatValue={formatNumber}
        />
        <Slider label="Years" value={years} onChange={setYears} min={1} max={40} step={1} />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-3">
        {result ? (
          <>
            <p className="text-2xl font-extrabold text-slate-900">{formatNumber(result.finalBalance)}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatNumber(result.totalContributed)} contributed (incl. a $100/mo addition),{" "}
              {formatNumber(result.totalGrowth)} from growth at {DEFAULT_ANNUAL_RETURN_PERCENT}%/yr.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Adjust the sliders to see a projection.</p>
        )}
      </div>
    </>
  );
}

function NetWorthMiniPreview() {
  const [totalAssets, setTotalAssets] = useState(50000);
  const [totalLiabilities, setTotalLiabilities] = useState(15000);

  const result = useMemo(
    () =>
      calculateNetWorth({
        assets: [{ amount: totalAssets }],
        liabilities: [{ amount: totalLiabilities }],
      }),
    [totalAssets, totalLiabilities]
  );

  useTrackCalculation("ai_news_mini_calculator_interact", `${totalAssets}:${totalLiabilities}`, {
    tool_name: "net_worth_mini_preview",
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
  });

  return (
    <>
      <p className="text-sm font-semibold text-slate-900">See where you stand, in the same spirit as this story:</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider
          label="Total Assets"
          value={totalAssets}
          onChange={setTotalAssets}
          min={0}
          max={1000000}
          step={5000}
          formatValue={formatNumber}
        />
        <Slider
          label="Total Liabilities"
          value={totalLiabilities}
          onChange={setTotalLiabilities}
          min={0}
          max={1000000}
          step={5000}
          formatValue={formatNumber}
        />
      </div>
      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-3">
        <p className="text-2xl font-extrabold text-slate-900">{formatNumber(result.netWorth)}</p>
        <p className="mt-0.5 text-xs text-slate-500">Total assets minus total liabilities.</p>
      </div>
    </>
  );
}

const PREVIEWS = {
  retirement: RetirementMiniPreview,
  "401k-vs-roth-ira": RothMiniPreview,
  "compound-interest": CompoundInterestMiniPreview,
  "net-worth": NetWorthMiniPreview,
};

/**
 * @param {{id:string, href:string, label:string}} calculatorCta  From lib/calculatorCtaMatch.js
 * @param {string} headlineText  item.title + excerpt/summary, for slider pre-fill hints
 * @param {string} slug  item.slug, for the GA4 click event
 */
export default function MiniCalculatorPreview({ calculatorCta, headlineText, slug }) {
  const Preview = PREVIEWS[calculatorCta.id];
  if (!Preview) return null;

  return (
    <div className="relative mt-5 rounded-xl border border-emerald-200 bg-white p-5 pt-7 shadow-card">
      <span className="absolute -top-3 left-4 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[11px]">
        100% Free · No Signup Required · Instant Calculation
      </span>

      <Preview headlineText={headlineText} />

      <TrackedCtaLink
        href={calculatorCta.href}
        eventName="ai_news_mini_calculator_full_breakdown_click"
        eventParams={{ slug, calculator: calculatorCta.id }}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        See Full Breakdown &amp; Inflation Adjustment →
      </TrackedCtaLink>
    </div>
  );
}
