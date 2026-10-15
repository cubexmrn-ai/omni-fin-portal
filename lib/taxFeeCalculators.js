// lib/taxFeeCalculators.js
//
// Pure, UI-agnostic math for the Tax & Fee Estimator
// (components/calculators/TaxFeeCalculator.jsx) — the General Public
// persona's one confirmed gap in the Multi-Persona UX & Retention Gap
// Audit (a repo-wide grep for capital gains/tax bracket/withholding
// returned zero matches before this file). Dependency-free, matching
// lib/personalCalculators.js and lib/realEstateCalculators.js.
//
// HONESTY NOTE (same convention as lib/technicalAnalysis.js): real tax
// brackets vary by country, state/province, filing status, and change
// yearly, and this deployment has no live tax-rate API or filing
// jurisdiction selector. Rather than either skip the feature entirely
// or quietly imply a jurisdiction-specific result, this uses a single,
// clearly-labeled set of simplified illustrative US federal brackets
// (2024 single-filer figures) for the income-tax estimate, and a flat
// user-entered % for the capital-gains/trade-fee estimate — both
// explicitly disclosed in the UI as illustrative, not tax advice.

// 2024 US federal single-filer brackets — illustrative reference only.
// (Source figures are IRS 2024 Rev. Proc. 2023-34; not re-verified
// live, and not updated automatically for future tax years.)
const ILLUSTRATIVE_BRACKETS_SINGLE_2024 = [
  { upTo: 11600, rate: 0.1 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

/**
 * Progressive income-tax estimate using the illustrative bracket table
 * above. Returns both the total estimated tax and the "effective"
 * (blended) rate, which is always lower than the top marginal bracket
 * the income reaches — a common point of confusion this surfaces
 * directly rather than leaving to the reader to work out.
 *
 * @param {{annualIncome:number}} params
 */
export function estimateIncomeTax({ annualIncome }) {
  const income = Number(annualIncome);
  if (!Number.isFinite(income) || income < 0) return null;

  let tax = 0;
  let lowerBound = 0;
  let topMarginalRate = 0;

  for (const bracket of ILLUSTRATIVE_BRACKETS_SINGLE_2024) {
    if (income <= lowerBound) break;
    const taxableInThisBracket = Math.min(income, bracket.upTo) - lowerBound;
    tax += taxableInThisBracket * bracket.rate;
    topMarginalRate = bracket.rate;
    lowerBound = bracket.upTo;
    if (income <= bracket.upTo) break;
  }

  const effectiveRatePercent = income > 0 ? (tax / income) * 100 : 0;

  return {
    estimatedTax: tax,
    effectiveRatePercent,
    topMarginalRatePercent: topMarginalRate * 100,
    takeHome: income - tax,
  };
}

/**
 * Flat-rate capital-gains / trade-fee estimate — a simple % the user
 * supplies themselves (their own country's known rate, or a
 * broker/exchange fee %), applied to a gain or trade amount. Kept
 * separate from the bracket-based income estimate above since capital
 * gains rates and trade fees vary far too widely (by country, holding
 * period, asset class, and broker) for any single illustrative table
 * to be meaningfully accurate.
 *
 * @param {{amount:number, ratePercent:number}} params
 */
export function estimateFlatRateFee({ amount, ratePercent }) {
  const amt = Number(amount);
  const rate = Number(ratePercent);
  if (![amt, rate].every(Number.isFinite) || amt < 0 || rate < 0) return null;

  const feeOrTax = amt * (rate / 100);
  return {
    feeOrTax,
    netAmount: amt - feeOrTax,
  };
}
