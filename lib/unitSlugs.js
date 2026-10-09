// lib/unitSlugs.js
//
// Maps short, URL-friendly slugs (used in programmatic SEO routes like
// /converters/unit/sqft-to-marla) to a { category, unit } pair understood
// by lib/conversionMath.js. Keeping this separate from conversionMath.js
// lets the math engine stay framework/URL-agnostic.

export const UNIT_SLUGS = {
  // Length
  km: { category: "length", unit: "kilometer" },
  kilometer: { category: "length", unit: "kilometer" },
  m: { category: "length", unit: "meter" },
  meter: { category: "length", unit: "meter" },
  cm: { category: "length", unit: "centimeter" },
  mm: { category: "length", unit: "millimeter" },
  mile: { category: "length", unit: "mile" },
  miles: { category: "length", unit: "mile" },
  ft: { category: "length", unit: "foot" },
  foot: { category: "length", unit: "foot" },
  feet: { category: "length", unit: "foot" },
  in: { category: "length", unit: "inch" },
  inch: { category: "length", unit: "inch" },
  yard: { category: "length", unit: "yard" },
  yd: { category: "length", unit: "yard" },
  nmi: { category: "length", unit: "nautical_mile" },

  // Area
  sqft: { category: "area", unit: "sq_foot" },
  sqm: { category: "area", unit: "sq_meter" },
  sqkm: { category: "area", unit: "sq_kilometer" },
  sqyd: { category: "area", unit: "sq_yard" },
  sqmi: { category: "area", unit: "sq_mile" },
  sqin: { category: "area", unit: "sq_inch" },
  sqcm: { category: "area", unit: "sq_centimeter" },
  sqmm: { category: "area", unit: "sq_millimeter" },
  acre: { category: "area", unit: "acre" },
  hectare: { category: "area", unit: "hectare" },
  marla: { category: "area", unit: "marla" },
  kanal: { category: "area", unit: "kanal" },
  bigha: { category: "area", unit: "bigha" },

  // Weight
  kg: { category: "weight", unit: "kilogram" },
  kilogram: { category: "weight", unit: "kilogram" },
  g: { category: "weight", unit: "gram" },
  gram: { category: "weight", unit: "gram" },
  mg: { category: "weight", unit: "milligram" },
  lb: { category: "weight", unit: "pound" },
  lbs: { category: "weight", unit: "pound" },
  pound: { category: "weight", unit: "pound" },
  oz: { category: "weight", unit: "ounce" },
  ounce: { category: "weight", unit: "ounce" },
  stone: { category: "weight", unit: "stone" },
  ton: { category: "weight", unit: "metric_ton" },
  tonne: { category: "weight", unit: "metric_ton" },
  tola: { category: "weight", unit: "tola" },
  maund: { category: "weight", unit: "maund" },
  seer: { category: "weight", unit: "seer" },

  // Volume
  liter: { category: "volume", unit: "liter" },
  litre: { category: "volume", unit: "liter" },
  l: { category: "volume", unit: "liter" },
  ml: { category: "volume", unit: "milliliter" },
  gallon: { category: "volume", unit: "us_gallon" },
  usgallon: { category: "volume", unit: "us_gallon" },
  imperialgallon: { category: "volume", unit: "imperial_gallon" },
  quart: { category: "volume", unit: "us_quart" },
  pint: { category: "volume", unit: "us_pint" },
  floz: { category: "volume", unit: "us_fluid_ounce" },
  cubicmeter: { category: "volume", unit: "cubic_meter" },
  cubicfoot: { category: "volume", unit: "cubic_foot" },
  cubicinch: { category: "volume", unit: "cubic_inch" },

  // Speed
  kmph: { category: "speed", unit: "kmph" },
  kmh: { category: "speed", unit: "kmph" },
  mph: { category: "speed", unit: "mph" },
  knot: { category: "speed", unit: "knot" },
  mps: { category: "speed", unit: "mps" },
  fps: { category: "speed", unit: "fps" },

  // Digital storage
  bit: { category: "data", unit: "bit" },
  byte: { category: "data", unit: "byte" },
  kb: { category: "data", unit: "kilobyte" },
  mb: { category: "data", unit: "megabyte" },
  gb: { category: "data", unit: "gigabyte" },
  tb: { category: "data", unit: "terabyte" },

  // Temperature
  celsius: { category: "temperature", unit: "celsius" },
  c: { category: "temperature", unit: "celsius" },
  fahrenheit: { category: "temperature", unit: "fahrenheit" },
  f: { category: "temperature", unit: "fahrenheit" },
  kelvin: { category: "temperature", unit: "kelvin" },
  k: { category: "temperature", unit: "kelvin" },
};

// A curated set of high-search-volume pairs used to pre-render SEO pages
// and to populate the /converters directory links.
export const FEATURED_UNIT_PAIRS = [
  { slug: "sqft-to-marla", from: "sqft", to: "marla", title: "Square Feet to Marla" },
  { slug: "marla-to-kanal", from: "marla", to: "kanal", title: "Marla to Kanal" },
  { slug: "km-to-miles", from: "km", to: "miles", title: "Kilometers to Miles" },
  { slug: "miles-to-km", from: "miles", to: "km", title: "Miles to Kilometers" },
  { slug: "kg-to-lbs", from: "kg", to: "lbs", title: "Kilograms to Pounds" },
  { slug: "lbs-to-kg", from: "lbs", to: "kg", title: "Pounds to Kilograms" },
  { slug: "tola-to-gram", from: "tola", to: "gram", title: "Tola to Gram" },
  { slug: "maund-to-kg", from: "maund", to: "kg", title: "Maund to Kilogram" },
  { slug: "celsius-to-fahrenheit", from: "celsius", to: "fahrenheit", title: "Celsius to Fahrenheit" },
  { slug: "fahrenheit-to-celsius", from: "fahrenheit", to: "celsius", title: "Fahrenheit to Celsius" },
  { slug: "liter-to-gallon", from: "liter", to: "gallon", title: "Liters to Gallons" },
  { slug: "acre-to-hectare", from: "acre", to: "hectare", title: "Acre to Hectare" },
];

/**
 * Parses a route slug of the form "<from>-to-<to>" into a validated
 * { category, fromUnit, toUnit } result, or null if either side is
 * unrecognized or the two units belong to different categories.
 */
export function parseUnitSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const parts = slug.toLowerCase().split("-to-");
  if (parts.length !== 2) return null;

  const [fromKey, toKey] = parts;
  const from = UNIT_SLUGS[fromKey];
  const to = UNIT_SLUGS[toKey];

  if (!from || !to || from.category !== to.category) return null;

  return {
    category: from.category,
    fromUnit: from.unit,
    toUnit: to.unit,
    fromSlug: fromKey,
    toSlug: toKey,
  };
}
