// lib/realEstateCalculators.js
//
// Pure, UI-agnostic math for the Rental Yield & Mortgage/Amortization
// Calculator (components/calculators/RentalYieldCalculator.jsx) — the
// Real Estate Investor persona's top-ranked missing feature in the
// Multi-Persona UX & Retention Gap Audit (this project previously had
// a Unit Converter for real-estate area units but nothing to turn
// that into a yield or a loan payment). Dependency-free, matching
// lib/personalCalculators.js and lib/tradingCalculators.js.

/**
 * Gross & net rental yield on a property.
 *
 * Gross yield ignores ongoing costs (the number most listings quote);
 * net yield subtracts annual operating costs (maintenance, property
 * tax/HOA, insurance, vacancy allowance) from annual rent first, which
 * is the more decision-useful figure for comparing two properties.
 *
 * @param {{propertyValue:number, monthlyRent:number, annualOperatingCosts?:number}} params
 */
export function calculateRentalYield({ propertyValue, monthlyRent, annualOperatingCosts = 0 }) {
  const value = Number(propertyValue);
  const rent = Number(monthlyRent);
  const costs = Number(annualOperatingCosts) || 0;

  if (![value, rent].every(Number.isFinite) || value <= 0 || rent < 0) {
    return null;
  }

  const annualRent = rent * 12;
  const netAnnualIncome = annualRent - costs;

  const grossYieldPercent = (annualRent / value) * 100;
  const netYieldPercent = (netAnnualIncome / value) * 100;

  return {
    annualRent,
    netAnnualIncome,
    grossYieldPercent,
    netYieldPercent,
  };
}

/**
 * Standard fixed-rate mortgage/loan amortization.
 *
 * Returns the fixed monthly payment (principal + interest, via the
 * standard amortization formula), lifetime totals, and a year-by-year
 * schedule (principal paid, interest paid, remaining balance) — the
 * same "project it forward, show the table" shape as
 * calculateCompoundGrowth() in lib/personalCalculators.js, applied to
 * a loan paying DOWN instead of a balance growing up.
 *
 * @param {{loanAmount:number, annualRatePercent:number, years:number}} params
 */
export function calculateMortgage({ loanAmount, annualRatePercent, years }) {
  const principal = Number(loanAmount);
  const annualRate = Number(annualRatePercent);
  const totalYears = Number(years);

  if (![principal, annualRate, totalYears].every(Number.isFinite) || principal <= 0 || totalYears <= 0) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = Math.round(totalYears * 12);

  // Standard fixed-payment amortization formula; a 0% loan degrades to
  // a plain even split so it never divides by zero.
  const monthlyPayment =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  let balance = principal;
  let totalInterestPaid = 0;
  const schedule = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = monthlyPayment - interestPortion;
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
    monthlyPayment,
    totalPaid: monthlyPayment * totalMonths,
    totalInterestPaid,
    schedule,
  };
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
