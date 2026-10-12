// lib/assetConversion.js
//
// Cross-asset conversion engine sitting on top of the unified payload
// returned by app/api/rates/route.js. Supports converting between any
// combination of:
//   - fiat   (lib/currencies.js)   — e.g. USD, PKR, EUR
//   - crypto (lib/crypto.js)       — e.g. BTC, ETH, SOL
//   - metals (lib/metals.js)       — e.g. XAU, XAG (troy ounce)
//
// The trick: normalize every asset to "USD value of 1 unit", then any
// conversion is just amount * usdValue(from) / usdValue(to).
//
// Response payload conventions (see app/api/rates/route.js):
//   - payload.fiat[code]   = units of `code` per 1 USD (traditional FX
//                            quoting, base USD) -> USD value = 1 / rate
//                            (and fiat.USD is always 1).
//   - payload.crypto[code] = USD price of 1 unit of `code`, direct.
//   - payload.metals[code] = USD price per 1 troy ounce of `code`, direct
//                            (already normalized server-side — see the
//                            route for the metals-api.com 1/rate note).

import { CURRENCIES, getCurrency } from "@/lib/currencies";
import { CRYPTO_ASSETS, getCrypto } from "@/lib/crypto";
import { METAL_ASSETS, getMetal } from "@/lib/metals";

export const ASSET_CLASSES = ["fiat", "crypto", "metals"];

/**
 * Looks up display metadata (name, symbol, etc.) for an asset code
 * within a given asset class.
 */
export function getAssetMeta(assetClass, code) {
  if (!code) return null;
  switch (assetClass) {
    case "fiat":
      return getCurrency(code);
    case "crypto":
      return getCrypto(code);
    case "metals":
      return getMetal(code);
    default:
      return null;
  }
}

/**
 * Returns the USD value of exactly 1 unit of `code` within `assetClass`,
 * given the unified rates payload from /api/rates. Returns null if the
 * code/class is unknown or the payload doesn't have the needed rate.
 */
export function getUsdValue(assetClass, code, ratesPayload) {
  if (!ratesPayload || !code) return null;
  const upperCode = code.toUpperCase();

  switch (assetClass) {
    case "fiat": {
      const rate = ratesPayload.fiat?.[upperCode];
      if (!Number.isFinite(rate) || rate === 0) return null;
      return 1 / rate; // fiat rates are "units of X per 1 USD"
    }
    case "crypto": {
      const price = ratesPayload.crypto?.[upperCode];
      return Number.isFinite(price) ? price : null; // already USD/unit
    }
    case "metals": {
      const price = ratesPayload.metals?.[upperCode];
      return Number.isFinite(price) ? price : null; // already USD/troy oz
    }
    default:
      return null;
  }
}

/**
 * Converts `amount` units of one asset into units of another asset,
 * across any combination of fiat/crypto/metals, using the unified
 * /api/rates payload as the source of USD values.
 *
 * @returns {number|null} converted amount, or null if a rate is missing
 */
export function convertBetweenAssets({
  amount,
  fromClass,
  fromCode,
  toClass,
  toCode,
  ratesPayload,
}) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return null;

  const fromUsd = getUsdValue(fromClass, fromCode, ratesPayload);
  const toUsd = getUsdValue(toClass, toCode, ratesPayload);
  if (fromUsd === null || toUsd === null || toUsd === 0) return null;

  return (numericAmount * fromUsd) / toUsd;
}

/**
 * Convenience: the exchange rate for 1 unit of `from` expressed in
 * units of `to` (i.e. what convertBetweenAssets would return for
 * amount = 1). Useful for "1 BTC = X PKR" style rate lines.
 */
export function getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload }) {
  return convertBetweenAssets({
    amount: 1,
    fromClass,
    fromCode,
    toClass,
    toCode,
    ratesPayload,
  });
}

/**
 * Builds a flat, searchable list of every known asset across all three
 * classes, each tagged with its class and a human label — used to
 * populate the unified "From"/"To" picker in
 * components/CurrencyConverter.jsx.
 */
export function buildUnifiedAssetList() {
  const fiatEntries = CURRENCIES.map((c) => ({
    assetClass: "fiat",
    code: c.code,
    name: c.name,
    symbol: c.symbol,
    flag: c.flag,
  }));

  const cryptoEntries = CRYPTO_ASSETS.map((c) => ({
    assetClass: "crypto",
    code: c.code,
    name: c.name,
    symbol: c.symbol,
    flag: "◆",
  }));

  const metalEntries = METAL_ASSETS.map((m) => ({
    assetClass: "metals",
    code: m.code,
    name: `${m.name} (troy oz)`,
    symbol: m.symbol,
    flag: "●",
  }));

  return [...fiatEntries, ...cryptoEntries, ...metalEntries];
}
