// lib/personalCalculators.js
//
// Pure, UI-agnostic math for the three Wealth & Personal Finance
// calculators on the Calculators Hub (app/calculators/page.jsx):
// Inflation & Purchasing Power, Compound Interest / Wealth Growth, and
// Business Profit Margin & Markup. Dependency-free, like
// lib/tradingCalculators.js — no React, no fetch, no date math beyond
// a plain year difference.

/**
 * Inflation & Purchasing Power Calculator.
 *
 * Given an amount from a past year and a historical average annual
 * inflation rate, compounds that rate forward to answer two related
 * questions: "what nominal amount would I need TODAY to buy what this
 * amount bought back then?" (equivalentToday), and "what is that
 * ORIGINAL amount of cash actually worth today, in today's purchasing
 * power?" (realValueToday — always ≤ the original amount when the
 * rate is positive, which is the "erosion").
 *
 * @param {{pastAmount:number, startYear:number, annualRatePercent:number, endYear?:number}} params
 */
export function calculateInflation({ pastAmount, startYear, annualRatePercent, endYear }) {
  const amount = Number(pastAmount);
  const from = Number(startYear);
  const rate = Number(annualRatePercent);
  const to = Number.isFinite(endYear) ? Number(endYear) : new Date().getFullYear();

  if (![amount, from, rate, to].every(Number.isFinite) || amount < 0 || from > to) {
    return null;
  }

  const years = Math.max(0, to - from);
  const factor = Math.pow(1 + rate / 100, years);

  const equivalentToday = amount * factor;
  const realValueToday = factor > 0 ? amount / factor : amount;
  const erosionAmount = amount - realValueToday;
  const erosionPercent = amount > 0 ? (erosionAmount / amount) * 100 : 0;

  return {
    years,
    factor,
    equivalentToday,
    realValueToday,
    erosionAmount,
    erosionPercent,
  };
}

/**
 * Compound Interest / Wealth Growth Calculator.
 *
 * Simulates month-by-month compounding (contribution added at the end
 * of each month, then growth applied) and returns a year-by-year
 * table suitable for rendering as a growth chart or table, alongside
 * final totals. Monthly compounding is used throughout rather than
 * annual, since it's both more realistic for a recurring-contribution
 * plan and strictly more accurate (never less) than annual compounding
 * at the same nominal rate.
 *
 * @param {{initialAmount:number, monthlyContribution:number, annualReturnPercent:number, years:number}} params
 */
export function calculateCompoundGrowth({
  initialAmount = 0,
  monthlyContribution,
  annualReturnPercent,
  years,
}) {
  const initial = Number(initialAmount) || 0;
  const monthly = Number(monthlyContribution);
  const annualRate = Number(annualReturnPercent);
  const totalYears = Number(years);

  if (
    ![monthly, annualRate, totalYears].every(Number.isFinite) ||
    monthly < 0 ||
    totalYears <= 0
  ) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = Math.round(totalYears * 12);

  let balance = initial;
  let contributed = initial;
  const table = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = balance * (1 + monthlyRate) + monthly;
    contributed += monthly;

    if (month % 12 === 0 || month === totalMonths) {
      const yearNumber = Math.ceil(month / 12);
      table.push({
        year: yearNumber,
        contributed: round(contributed, 2),
        balance: round(balance, 2),
        growth: round(balance - contributed, 2),
      });
    }
  }

  return {
    finalBalance: balance,
    totalContributed: contributed,
    totalGrowth: balance - contributed,
    table,
  };
}

/**
 * Dividend Compounding (DRIP) Calculator.
 *
 * RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit — Dividend
 * Investor persona): calculateCompoundGrowth() above is framed purely
 * as generic wealth growth with one blended "return %" — it has no
 * concept of a dividend being a separate, periodic cash payout that
 * can either be reinvested (DRIP: Dividend Reinvestment Plan) or paid
 * out. This splits the same month-by-month simulation into two
 * components that actually behave differently:
 *
 *   - Price growth: applied every month, like calculateCompoundGrowth.
 *   - Dividend: accrued only at each payout (monthly/quarterly/
 *     annually), as yield% × (months-in-period / 12) of the balance at
 *     payout time. When `reinvestDividends` is true, it's added back
 *     into the balance (so it compounds the SAME account going
 *     forward — the actual mechanic a real DRIP performs); when
 *     false, it's tracked separately as cash paid out and never added
 *     to the compounding balance.
 *
 * @param {{initialAmount:number, monthlyContribution:number, priceGrowthPercent:number, dividendYieldPercent:number, payoutFrequency:"monthly"|"quarterly"|"annually", reinvestDividends:boolean, years:number}} params
 */
export function calculateDividendGrowth({
  initialAmount = 0,
  monthlyContribution,
  priceGrowthPercent,
  dividendYieldPercent,
  payoutFrequency = "quarterly",
  reinvestDividends = true,
  years,
}) {
  const initial = Number(initialAmount) || 0;
  const monthly = Number(monthlyContribution);
  const priceRate = Number(priceGrowthPercent);
  const dividendYield = Number(dividendYieldPercent);
  const totalYears = Number(years);

  if (
    ![monthly, priceRate, dividendYield, totalYears].every(Number.isFinite) ||
    monthly < 0 ||
    dividendYield < 0 ||
    totalYears <= 0
  ) {
    return null;
  }

  const PAYOUTS_PER_YEAR = { monthly: 12, quarterly: 4, annually: 1 };
  const payoutsPerYear = PAYOUTS_PER_YEAR[payoutFrequency] || 4;
  const periodMonths = 12 / payoutsPerYear;
  const periodFraction = periodMonths / 12; // always 1/payoutsPerYear

  const monthlyPriceRate = priceRate / 100 / 12;
  const totalMonths = Math.round(totalYears * 12);

  let balance = initial;
  let contributed = initial;
  let dividendsReceived = 0; // paid-out dividends NOT reinvested, kept as cash
  let dividendsReinvested = 0; // dividends added back into the balance
  const table = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = balance * (1 + monthlyPriceRate) + monthly;
    contributed += monthly;

    const isPayoutMonth = month % periodMonths === 0 || month === totalMonths;
    if (isPayoutMonth) {
      const dividend = balance * (dividendYield / 100) * periodFraction;
      if (reinvestDividends) {
        balance += dividend;
        dividendsReinvested += dividend;
      } else {
        dividendsReceived += dividend;
      }
    }

    if (month % 12 === 0 || month === totalMonths) {
      const yearNumber = Math.ceil(month / 12);
      table.push({
        year: yearNumber,
        contributed: round(contributed, 2),
        balance: round(balance, 2),
        dividendsSoFar: round(dividendsReceived + dividendsReinvested, 2),
        growth: round(balance - contributed - dividendsReceived, 2),
      });
    }
  }

  return {
    finalBalance: balance,
    totalContributed: contributed,
    totalDividends: dividendsReceived + dividendsReinvested,
    dividendsReceived, // paid out as cash, not in finalBalance
    dividendsReinvested, // folded into finalBalance
    totalGrowth: balance - contributed - dividendsReceived,
    table,
  };
}

/**
 * Business Profit Margin & Markup Calculator.
 *
 * Gross margin is profit as a % of the SELLING price (what fraction of
 * revenue is profit); markup is profit as a % of the COST (how much
 * was added on top of cost to reach the selling price). These are
 * different numbers for the same transaction and are commonly
 * confused, so both are always returned together.
 *
 * @param {{cost:number, sellingPrice:number}} params
 */
export function calculateMarginMarkup({ cost, sellingPrice }) {
  const c = Number(cost);
  const sp = Number(sellingPrice);

  if (![c, sp].every(Number.isFinite) || c < 0 || sp < 0) {
    return null;
  }

  const grossProfit = sp - c;
  const grossMarginPercent = sp > 0 ? (grossProfit / sp) * 100 : 0;
  const markupPercent = c > 0 ? (grossProfit / c) * 100 : null;

  return { grossProfit, grossMarginPercent, markupPercent };
}

/**
 * Phase 2 item 2 — Compound Growth "real purchasing power" line.
 *
 * Reuses the exact same erosion-factor math as calculateInflation()
 * above (amount ÷ (1 + rate/100)^years), just applied to a projected
 * future balance instead of a past amount: "this nominal balance, in
 * today's money, assuming inflation keeps compounding at this rate
 * for the same number of years." Returns null on bad input, same
 * convention as every other calculator in this file.
 *
 * @param {{nominalBalance:number, years:number, inflationRatePercent:number}} params
 */
export function calculateRealPurchasingPower({ nominalBalance, years, inflationRatePercent }) {
  const nominal = Number(nominalBalance);
  const totalYears = Number(years);
  const rate = Number(inflationRatePercent);

  if (![nominal, totalYears, rate].every(Number.isFinite) || nominal < 0 || totalYears < 0) {
    return null;
  }

  const factor = Math.pow(1 + rate / 100, totalYears);
  const realValue = factor > 0 ? nominal / factor : nominal;
  const erosionPercent = nominal > 0 ? ((nominal - realValue) / nominal) * 100 : 0;

  return { realValue, erosionPercent, factor };
}

/**
 * Phase 2 item 2 — DRIP vs. non-reinvested scenario takeaway.
 *
 * Pure comparison helper: given the SAME calculateDividendGrowth()
 * call run twice by the caller (once with reinvestDividends:true, once
 * false — both deterministic, real simulations, not a new estimate),
 * returns the dollar and percent difference in final balance so the
 * UI can state a direct "reinvesting vs. not" takeaway line.
 *
 * @param {{reinvestedResult: ReturnType<typeof calculateDividendGrowth>, nonReinvestedResult: ReturnType<typeof calculateDividendGrowth>}} params
 */
export function buildDripScenarioTakeaway({ reinvestedResult, nonReinvestedResult }) {
  if (!reinvestedResult || !nonReinvestedResult) return null;

  // Non-reinvested dividends are paid out as cash, not compounded —
  // the fair "total wealth" comparison includes that cash pile
  // alongside the (lower) account balance it left behind.
  const nonReinvestedTotalWealth = nonReinvestedResult.finalBalance + nonReinvestedResult.dividendsReceived;
  const balanceDifference = reinvestedResult.finalBalance - nonReinvestedTotalWealth;
  const percentDifference =
    nonReinvestedTotalWealth > 0 ? (balanceDifference / nonReinvestedTotalWealth) * 100 : null;

  return {
    reinvestedFinalBalance: reinvestedResult.finalBalance,
    nonReinvestedTotalWealth,
    balanceDifference,
    percentDifference,
  };
}

/**
 * 401(k)/Traditional vs. Roth IRA Growth Calculator.
 *
 * Same-take-home-pay comparison, the textbook-correct way to compare
 * the two: a Traditional account is funded with PRE-TAX dollars (the
 * contribution reduces taxable income today) and taxed on withdrawal;
 * a Roth account is funded with AFTER-TAX dollars (no deduction today)
 * and withdrawals are tax-free. Comparing them on the SAME nominal
 * contribution amount is a common but misleading framing — it quietly
 * assumes the saver can afford to contribute more into the Traditional
 * account, or less net pay into the Roth one. This function instead
 * holds the saver's take-home-pay cost constant: whatever amount is
 * entered is treated as the Traditional (pre-tax) contribution, and
 * the Roth side contributes the equivalent AFTER-TAX amount that would
 * cost the saver the exact same amount out of their paycheck today
 * (contribution × (1 − currentTaxRate/100)) — so the comparison is
 * "same cost today, which comes out ahead after taxes".
 *
 * Both sides reuse the exact same calculateCompoundGrowth() engine
 * above (same return rate, same years, same monthly-compounding
 * mechanics) so the only difference between the two results is the
 * tax treatment, never a second, differently-implemented growth
 * model. Sanity check built into the math itself: when
 * currentTaxRate === retirementTaxRate, traditionalNetAtRetirement and
 * rothNetAtRetirement come out identical — taxed-later and taxed-now
 * are equivalent when the rate never changes, exactly as the textbook
 * result says they should be.
 *
 * Returns null on bad input, or if the underlying calculateCompoundGrowth
 * call(s) themselves return null (identical validation rules apply).
 *
 * @param {{initialAmount?:number, monthlyContribution:number, annualReturnPercent:number, years:number, currentTaxRate:number, retirementTaxRate:number}} params
 */
export function calculateTraditionalVsRothGrowth({
  initialAmount = 0,
  monthlyContribution,
  annualReturnPercent,
  years,
  currentTaxRate,
  retirementTaxRate,
}) {
  const currentRate = Number(currentTaxRate);
  const retirementRate = Number(retirementTaxRate);

  if (
    ![currentRate, retirementRate].every(Number.isFinite) ||
    currentRate < 0 ||
    currentRate > 100 ||
    retirementRate < 0 ||
    retirementRate > 100
  ) {
    return null;
  }

  // Traditional: the full entered amount goes in pre-tax.
  const traditionalResult = calculateCompoundGrowth({
    initialAmount,
    monthlyContribution,
    annualReturnPercent,
    years,
  });

  // Roth: the same take-home-pay cost today buys a SMALLER after-tax
  // contribution — that's the entered amount reduced by the saver's
  // current tax rate — so it's never contributing a nominally equal
  // dollar amount, which would understate what the Traditional side
  // is actually costing the saver today.
  const afterTaxFactor = 1 - currentRate / 100;
  const rothInitial = Number(initialAmount || 0) * afterTaxFactor;
  const rothMonthly = Number(monthlyContribution) * afterTaxFactor;

  const rothResult = calculateCompoundGrowth({
    initialAmount: rothInitial,
    monthlyContribution: rothMonthly,
    annualReturnPercent,
    years,
  });

  if (!traditionalResult || !rothResult) return null;

  // Traditional withdrawals are taxed at the (possibly different)
  // retirement-year rate; Roth withdrawals are already tax-free.
  const traditionalNetAtRetirement = traditionalResult.finalBalance * (1 - retirementRate / 100);
  const rothNetAtRetirement = rothResult.finalBalance;

  const netDifference = rothNetAtRetirement - traditionalNetAtRetirement;
  const betterAccount = netDifference > 0 ? "roth" : netDifference < 0 ? "traditional" : "tie";

  return {
    traditional: {
      grossFinalBalance: traditionalResult.finalBalance,
      netAtRetirement: traditionalNetAtRetirement,
      totalContributed: traditionalResult.totalContributed,
      table: traditionalResult.table,
    },
    roth: {
      grossFinalBalance: rothResult.finalBalance,
      netAtRetirement: rothNetAtRetirement,
      totalContributed: rothResult.totalContributed,
      table: rothResult.table,
      // What the saver actually put in after tax, for display next to
      // the Traditional side's larger pre-tax contribution figure.
      afterTaxContributionAmount: rothMonthly,
    },
    netDifference,
    betterAccount,
  };
}

/**
 * Net Worth snapshot calculator — Phase 1 pSEO roadmap item (Oct 30
 * 2026): sums arbitrary asset and liability line items into a single
 * net worth figure. Deliberately the simplest function in this file —
 * net worth is just assets minus liabilities, no compounding or rate
 * assumptions involved — but it's centralized here rather than
 * inlined in the component so the one piece of real math stays
 * testable and consistent with every other calculator's "pure
 * function, UI reads the result" pattern.
 *
 * @param {{assets: {amount:number}[], liabilities: {amount:number}[]}} params
 */
export function calculateNetWorth({ assets = [], liabilities = [] }) {
  const totalAssets = assets.reduce((sum, item) => {
    const amount = Number(item?.amount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => {
    const amount = Number(item?.amount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
