// lib/conversionMath.js
//
// Shared, framework-agnostic math used across OmniFin Portal:
//   1. Gold / precious metal pricing (Troy Ounce spot -> local unit + karat)
//   2. Universal unit conversion engine (length, area, weight, volume,
//      temperature, speed, digital storage) covering both globally common
//      units (km, miles, kg, lb, gallons…) and South Asian regional units
//      (tola, maund, seer, marla, kanal) that are high-value for SEO.
//
// Every category is defined with a single base unit and a linear factor,
// except temperature, which is non-linear and handled with explicit
// formulas. This keeps the engine small, pure and easy to extend.

import { formatNumber } from "@/lib/formatNumber";

// ---------------------------------------------------------------------------
// 1. Gold & precious metal math
// ---------------------------------------------------------------------------

// Grams per unit of weight (gold-trade units).
export const WEIGHT_UNITS = {
  gram: 1,
  troy_ounce: 31.1034768,
  tola: 11.6638038, // South Asian standard tola
  masha: 0.972,
  ratti: 0.1215,
  kilogram: 1000,
};

export const WEIGHT_UNIT_LABELS = {
  gram: "Gram (g)",
  troy_ounce: "Troy Ounce (oz t)",
  tola: "Tola",
  masha: "Masha",
  ratti: "Ratti",
  kilogram: "Kilogram (kg)",
};

// Purity relative to pure (24K) gold.
export const KARAT_PURITY = {
  "24K": 1.0, // 99.9% pure
  "22K": 0.9167, // 91.67% pure
  "21K": 0.875, // 87.5% pure
  "18K": 0.75, // 75.0% pure
};

/**
 * Calculates a local gold price from the global XAU/USD spot rate.
 *
 * @param {number} xauUsdRate - Gold price per troy ounce, in USD (24K spot).
 * @param {number} usdToLocalFx - Exchange rate, USD -> target currency.
 * @param {string} targetUnit - Key of WEIGHT_UNITS, e.g. 'tola', 'gram'.
 * @param {string} karat - Key of KARAT_PURITY, e.g. '24K', '22K'.
 * @returns {{ rawPrice: number, formattedPrice: string, usdEquivalent: string }}
 */
export function calculateGoldPrice(
  xauUsdRate,
  usdToLocalFx,
  targetUnit = "tola",
  karat = "24K"
) {
  const safeXau = Number.isFinite(xauUsdRate) ? xauUsdRate : 0;
  const safeFx = Number.isFinite(usdToLocalFx) ? usdToLocalFx : 0;

  // 1. Price per gram in USD at 24K.
  const usdPerGram24K = safeXau / WEIGHT_UNITS.troy_ounce;

  // 2. Adjust for karat purity.
  const purityMultiplier = KARAT_PURITY[karat] || 1.0;
  const targetUsdPerGram = usdPerGram24K * purityMultiplier;

  // 3. Convert to the target weight unit.
  const targetUsdPerUnit = targetUsdPerGram * (WEIGHT_UNITS[targetUnit] || 1);

  // 4. Convert to the target currency.
  const localPrice = targetUsdPerUnit * safeFx;

  return {
    rawPrice: localPrice,
    formattedPrice: formatNumber(localPrice, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
    usdEquivalent: targetUsdPerUnit.toFixed(2),
  };
}

/**
 * Same return shape as calculateGoldPrice(), for a commodity that isn't
 * priced per unit weight at all (e.g. crude oil, quoted per barrel).
 * There's no weight-unit conversion or karat/purity step here — just a
 * straight USD -> local currency conversion of the per-unit spot price,
 * scaled by quantity. Kept as its own function rather than overloading
 * calculateGoldPrice() with unit==="barrel" special-casing, since the
 * math genuinely is simpler (two steps, not four) and this stays correct
 * if a future caller passes a bogus targetUnit/karat by mistake.
 *
 * @param {number} usdPerUnit - Spot price in USD for one unit (e.g. one barrel).
 * @param {number} usdToLocalFx - Exchange rate, USD -> target currency.
 */
export function calculateFlatUnitPrice(usdPerUnit, usdToLocalFx) {
  const safePrice = Number.isFinite(usdPerUnit) ? usdPerUnit : 0;
  const safeFx = Number.isFinite(usdToLocalFx) ? usdToLocalFx : 0;
  const localPrice = safePrice * safeFx;

  return {
    rawPrice: localPrice,
    formattedPrice: formatNumber(localPrice, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
    usdEquivalent: safePrice.toFixed(2),
  };
}

// ---------------------------------------------------------------------------
// 2. Universal unit conversion engine
// ---------------------------------------------------------------------------

/**
 * Each category has a `baseUnit` (factor 1) and a flat `units` map of
 * { key: { label, factor } }, where `factor` = how many base units are in
 * one of that unit. Converting is: value * fromFactor / toFactor.
 *
 * Temperature is handled separately (see convertTemperature) because the
 * scales aren't simple multiples of each other.
 */
export const UNIT_CATEGORIES = {
  length: {
    label: "Length & Distance",
    baseUnit: "meter",
    units: {
      millimeter: { label: "Millimeter (mm)", factor: 0.001 },
      centimeter: { label: "Centimeter (cm)", factor: 0.01 },
      meter: { label: "Meter (m)", factor: 1 },
      kilometer: { label: "Kilometer (km)", factor: 1000 },
      inch: { label: "Inch (in)", factor: 0.0254 },
      foot: { label: "Foot (ft)", factor: 0.3048 },
      yard: { label: "Yard (yd)", factor: 0.9144 },
      mile: { label: "Mile (mi)", factor: 1609.344 },
      nautical_mile: { label: "Nautical Mile (nmi)", factor: 1852 },
    },
    popularPairs: [
      ["kilometer", "mile"],
      ["meter", "foot"],
      ["centimeter", "inch"],
    ],
  },

  area: {
    label: "Area & Land",
    baseUnit: "sq_meter",
    units: {
      sq_millimeter: { label: "Sq. Millimeter (mm²)", factor: 0.000001 },
      sq_centimeter: { label: "Sq. Centimeter (cm²)", factor: 0.0001 },
      sq_meter: { label: "Sq. Meter (m²)", factor: 1 },
      hectare: { label: "Hectare (ha)", factor: 10000 },
      sq_kilometer: { label: "Sq. Kilometer (km²)", factor: 1000000 },
      sq_inch: { label: "Sq. Inch (in²)", factor: 0.00064516 },
      sq_foot: { label: "Sq. Foot (sq ft)", factor: 0.09290304 },
      sq_yard: { label: "Sq. Yard (sq yd)", factor: 0.83612736 },
      acre: { label: "Acre", factor: 4046.8564224 },
      sq_mile: { label: "Sq. Mile (mi²)", factor: 2589988.110336 },
      // South Asian regional land units — high-value for PK/IN SEO traffic.
      marla: { label: "Marla", factor: 25.2929 }, // 272.25 sq ft
      kanal: { label: "Kanal", factor: 505.8575 }, // 20 marla / 5445 sq ft
      bigha: { label: "Bigha (North India, approx.)", factor: 2529.285 },
    },
    popularPairs: [
      ["sq_foot", "marla"],
      ["marla", "kanal"],
      ["acre", "hectare"],
    ],
  },

  weight: {
    label: "Weight & Mass",
    baseUnit: "kilogram",
    units: {
      milligram: { label: "Milligram (mg)", factor: 0.000001 },
      gram: { label: "Gram (g)", factor: 0.001 },
      kilogram: { label: "Kilogram (kg)", factor: 1 },
      metric_ton: { label: "Metric Ton (t)", factor: 1000 },
      ounce: { label: "Ounce (oz)", factor: 0.028349523125 },
      pound: { label: "Pound (lb)", factor: 0.45359237 },
      stone: { label: "Stone (st)", factor: 6.35029318 },
      us_ton: { label: "US Ton (short ton)", factor: 907.18474 },
      imperial_ton: { label: "Imperial Ton (long ton)", factor: 1016.0469088 },
      // South Asian regional weight units.
      tola: { label: "Tola", factor: 0.0116638038 },
      maund: { label: "Maund (mann)", factor: 37.3242 },
      seer: { label: "Seer", factor: 0.933 },
    },
    popularPairs: [
      ["kilogram", "pound"],
      ["gram", "ounce"],
      ["maund", "kilogram"],
    ],
  },

  volume: {
    label: "Volume & Capacity",
    baseUnit: "liter",
    units: {
      milliliter: { label: "Milliliter (ml)", factor: 0.001 },
      liter: { label: "Liter (L)", factor: 1 },
      cubic_meter: { label: "Cubic Meter (m³)", factor: 1000 },
      cubic_foot: { label: "Cubic Foot (ft³)", factor: 28.316846592 },
      cubic_inch: { label: "Cubic Inch (in³)", factor: 0.016387064 },
      us_gallon: { label: "US Gallon (gal)", factor: 3.785411784 },
      us_quart: { label: "US Quart (qt)", factor: 0.946352946 },
      us_pint: { label: "US Pint (pt)", factor: 0.473176473 },
      us_fluid_ounce: { label: "US Fluid Ounce (fl oz)", factor: 0.0295735295625 },
      imperial_gallon: { label: "Imperial Gallon (UK gal)", factor: 4.54609 },
      imperial_pint: { label: "Imperial Pint (UK pt)", factor: 0.56826125 },
    },
    popularPairs: [
      ["liter", "us_gallon"],
      ["milliliter", "us_fluid_ounce"],
      ["liter", "imperial_gallon"],
    ],
  },

  speed: {
    label: "Speed",
    baseUnit: "mps",
    units: {
      mps: { label: "Meters / second (m/s)", factor: 1 },
      kmph: { label: "Kilometers / hour (km/h)", factor: 0.2777777778 },
      mph: { label: "Miles / hour (mph)", factor: 0.44704 },
      knot: { label: "Knot (nautical mph)", factor: 0.5144444444 },
      fps: { label: "Feet / second (ft/s)", factor: 0.3048 },
    },
    popularPairs: [["kmph", "mph"]],
  },

  data: {
    label: "Digital Storage",
    baseUnit: "megabyte",
    units: {
      bit: { label: "Bit", factor: 1 / 8_000_000 },
      byte: { label: "Byte (B)", factor: 0.000001 },
      kilobyte: { label: "Kilobyte (KB)", factor: 0.001 },
      megabyte: { label: "Megabyte (MB)", factor: 1 },
      gigabyte: { label: "Gigabyte (GB)", factor: 1000 },
      terabyte: { label: "Terabyte (TB)", factor: 1000000 },
    },
    popularPairs: [["gigabyte", "megabyte"]],
  },
};

// Temperature needs explicit conversion formulas (not a simple factor).
export const TEMPERATURE_UNITS = {
  celsius: { label: "Celsius (°C)" },
  fahrenheit: { label: "Fahrenheit (°F)" },
  kelvin: { label: "Kelvin (K)" },
};

function toCelsius(value, fromUnit) {
  switch (fromUnit) {
    case "celsius":
      return value;
    case "fahrenheit":
      return ((value - 32) * 5) / 9;
    case "kelvin":
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(celsius, toUnit) {
  switch (toUnit) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return (celsius * 9) / 5 + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

/**
 * Converts a temperature value between Celsius, Fahrenheit and Kelvin.
 */
export function convertTemperature(value, fromUnit, toUnit) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const celsius = toCelsius(numeric, fromUnit);
  return fromCelsius(celsius, toUnit);
}

/**
 * Converts a value between two units of the same category.
 *
 * @param {string} categoryKey - Key of UNIT_CATEGORIES (e.g. 'length').
 * @param {number} value - Quantity to convert.
 * @param {string} fromUnit - Source unit key.
 * @param {string} toUnit - Target unit key.
 * @returns {number} Converted value (0 if inputs are invalid).
 */
export function convertUnit(categoryKey, value, fromUnit, toUnit) {
  if (categoryKey === "temperature") {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const category = UNIT_CATEGORIES[categoryKey];
  const numeric = Number(value);
  if (!category || !Number.isFinite(numeric)) return 0;

  const from = category.units[fromUnit];
  const to = category.units[toUnit];
  if (!from || !to) return 0;

  const baseValue = numeric * from.factor;
  return baseValue / to.factor;
}

/**
 * Returns the ordered list of category keys for navigation / routing,
 * with 'temperature' included alongside the factor-based categories.
 */
export function getCategoryKeys() {
  return [...Object.keys(UNIT_CATEGORIES), "temperature"];
}

/**
 * Returns a display label + unit list for any category key, including
 * the specially-handled 'temperature' category.
 */
export function getCategoryMeta(categoryKey) {
  if (categoryKey === "temperature") {
    return { label: "Temperature", units: TEMPERATURE_UNITS, special: true };
  }
  const category = UNIT_CATEGORIES[categoryKey];
  return category
    ? { label: category.label, units: category.units, special: false }
    : null;
}
