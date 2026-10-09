// app/api/rates/route.js
//
// Serverless API route that fetches live USD-based exchange rates and
// exposes them to the client. Uses Next.js's fetch cache with a 900s
// (15 minute) revalidation window, so this route behaves like an
// ISR-cached endpoint: the first request after the window expires
// triggers a background refresh, while all other requests are served
// instantly from cache.
//
// Serves every currency in lib/currencies.js (used by both the Gold
// Calculator and the FX Currency Converter), so both features share one
// cached fetch instead of hitting the upstream provider twice.

import { CURRENCY_CODES, FALLBACK_RATES } from "@/lib/currencies";

const REVALIDATE_SECONDS = 900;

async function fetchFromKeyedProvider(apiKey) {
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );

  if (!res.ok) {
    throw new Error(`Keyed provider responded with status ${res.status}`);
  }

  const data = await res.json();

  if (data.result !== "success" || !data.conversion_rates) {
    throw new Error("Keyed provider returned an unsuccessful payload");
  }

  return {
    base: "USD",
    rates: data.conversion_rates,
    source: "exchangerate-api.com (v6)",
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromOpenProvider() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open provider responded with status ${res.status}`);
  }

  const data = await res.json();

  if (data.result !== "success" || !data.rates) {
    throw new Error("Open provider returned an unsuccessful payload");
  }

  return {
    base: "USD",
    rates: data.rates,
    source: "open.er-api.com",
    fetchedAt: new Date().toISOString(),
  };
}

function buildFallbackPayload(errorMessage) {
  return {
    base: "USD",
    rates: FALLBACK_RATES,
    source: "static-fallback",
    fetchedAt: new Date().toISOString(),
    warning: `Live rates unavailable, using fallback values. (${errorMessage})`,
  };
}

function pickSupportedRates(payload) {
  const subset = { USD: 1 };
  for (const code of CURRENCY_CODES) {
    if (typeof payload.rates[code] === "number") {
      subset[code] = payload.rates[code];
    } else {
      subset[code] = FALLBACK_RATES[code];
    }
  }
  return subset;
}

export async function GET() {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  let payload;

  try {
    payload = apiKey
      ? await fetchFromKeyedProvider(apiKey)
      : await fetchFromOpenProvider();
  } catch (keyedError) {
    try {
      payload = await fetchFromOpenProvider();
    } catch (openError) {
      payload = buildFallbackPayload(openError.message || "unknown error");
    }
  }

  const responseBody = {
    base: payload.base,
    rates: pickSupportedRates(payload),
    source: payload.source,
    fetchedAt: payload.fetchedAt,
    revalidateSeconds: REVALIDATE_SECONDS,
    ...(payload.warning ? { warning: payload.warning } : {}),
  };

  return Response.json(responseBody, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=59`,
    },
  });
}
