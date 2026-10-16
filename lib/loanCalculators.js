// lib/loanCalculators.js
//
// Pure, UI-agnostic math for the Loan / EMI & Salary Tax Calculator
// (components/tools/LoanEmiTaxCalculator.jsx) — the Household / Novice
// persona's #2 gap in the Product & UX Audit: "EMI calculator" and
// "salary tax calculator" are among the single highest-search-volume
// household finance queries in South Asia, and this project previously
// had no loan-amortization tool outside the Real Estate Investor-framed
// Rental Yield & Mortgage Calculator (lib/realEstateCalculators.js),
// and no salary-tax table for the Pakistan/India market this project
// otherwise targets directly (tola/karat gold, PKR/INR currency
// support, Roman Urdu/Urdu/Hindi in the language switcher).
//
// Dependency-free, same convention as lib/personalCalculators.js and
// lib/realEstateCalculators.js — no live data needed for either
// calculator in this file, so both work with zero network calls.
//
// HONESTY NOTE (same bar as lib/taxFeeCalculators.js's illustrative US
// brackets): real salary-tax slabs change every fiscal year and vary
// by filer category (salaried vs. non-salaried) and province. The
// table below is a single, clearly-labeled illustrative reference
// (Pakistan FY2024-25 salaried-individual slabs under the Finance Act
// 2024) — not re-verified live, not auto-updated for future tax years,
// and explicitly disclosed in the UI as illustrative, not tax advice.

/**
 * Standard fixed-rate loan amortization (EMI = Equated Monthly
 * Installment). Same amortization formula as
 * lib/realEstateCalculators.js's calculateMortgage(), kept as its own
 * function here (rather than imported) since a personal/auto/education
 * loan isn't conceptually a mortgage, and this file's household-EMI
 * framing (labels, rounding, a shorter default schedule) is meant to
 * stand alone from that Real Estate Investor-persona tool.
 *
 * @param {{loanAmount:number, annualRatePercent:number, tenureYears:number}} params
 */
export function calculateLoanEmi({ loanAmount, annualRatePercent, tenureYears }) {
  const principal = Number(loanAmount);
  const annualRate = Number(annualRatePercent);
  const years = Number(tenureYears);

  if (![principal, annualRate, years].every(Number.isFinite) || principal <= 0 || years <= 0 || annualRate < 0) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = Math.round(years * 12);

  const emi =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  let balance = principal;
  let totalInterestPaid = 0;
  const schedule = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = emi - interestPortion;
    balance = Math.max(0, balance - principalPortion);
    totalInterestPaid += interestPortion;

    if (month % 12 === 0 || month === totalMonths) {
      schedule.push({
        year: Math.ceil(month / 12),
        remainingBalance: round(balance, 2),
        cumulativeInterest: round(totalInterestPaid, 2),
      });
    }
  }

  return {
    emi,
    totalPayment: emi * totalMonths,
    totalInterestPaid,
    totalMonths,
    schedule,
  };
}

// Pakistan FY2024-25 salaried-individual slabs (Finance Act 2024),
// illustrative only — annual taxable income in PKR. Source figures are
// the publicly announced FY25 salary tax slabs; not re-verified live,
// and not updated automatically for future fiscal years. Withholding,
// rebates, surcharge for very high earners, and non-salaried slabs are
// NOT modeled.
const PK_SALARY_SLABS_FY2024_25 = [
  { upTo: 600000, rate: 0, fixedAmount: 0 },
  { upTo: 1200000, rate: 0.05, fixedAmount: 0 },
  { upTo: 2200000, rate: 0.15, fixedAmount: 30000 },
  { upTo: 3200000, rate: 0.25, fixedAmount: 180000 },
  { upTo: 4100000, rate: 0.3, fixedAmount: 430000 },
  { upTo: Infinity, rate: 0.35, fixedAmount: 700000 },
];

/**
 * Progressive salary-tax estimate for Pakistan salaried individuals,
 * using the illustrative FY2024-25 slab table above. Same "effective
 * vs. top marginal rate" shape as lib/taxFeeCalculators.js's
 * estimateIncomeTax(), so the two tools read consistently if a person
 * uses both.
 *
 * @param {{annualIncome:number}} params
 */
export function estimateSalaryTaxPK({ annualIncome }) {
  const income = Number(annualIncome);
  if (!Number.isFinite(income) || income < 0) return null;

  let bracketIndex = PK_SALARY_SLABS_FY2024_25.findIndex((b) => income <= b.upTo);
  if (bracketIndex === -1) bracketIndex = PK_SALARY_SLABS_FY2024_25.length - 1;

  const bracket = PK_SALARY_SLABS_FY2024_25[bracketIndex];
  const previousUpTo = bracketIndex === 0 ? 0 : PK_SALARY_SLABS_FY2024_25[bracketIndex - 1].upTo;

  const estimatedTax = bracket.fixedAmount + (income - previousUpTo) * bracket.rate;
  const effectiveRatePercent = income > 0 ? (estimatedTax / income) * 100 : 0;

  return {
    estimatedTax,
    effectiveRatePercent,
    topMarginalRatePercent: bracket.rate * 100,
    takeHome: income - estimatedTax,
  };
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
