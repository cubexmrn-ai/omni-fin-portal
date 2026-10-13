// app/embed/converter/route.js
//
// WEEK 4 — Embeddable converter widget (Task 26).
//
// Why a Route Handler and not a normal page: every normal route in this
// app renders inside the single global app/layout.jsx root layout
// (Header + SiteFooter + full page chrome). There is no route-group
// split for a "no chrome" page, and retrofitting one would mean
// restructuring every existing route into a parallel root layout — a
// large, risky change for a Week 4 add-on. A Route Handler bypasses the
// React page/layout tree entirely, so it can return a complete,
// self-contained HTML document with none of the site's chrome — exactly
// what something meant to run inside another site's <iframe> needs.
//
// Query params:
//   ?from=USD&to=PKR        fiat/crypto/metals codes (lib/pairSlugs.js
//                           resolves the asset class automatically)
//   &amount=100             optional starting amount (default 1)
//   &theme=light|dark       optional visual theme (default light)
//
// The live rate is resolved server-side from the same getUnifiedRates()
// used by the real converter pages/JSON-LD — never a self-fetch of this
// deployment's own API by absolute URL (see lib/newsAggregator.js's
// header comment for why that pattern is unsafe during SSR/ISR here).
// Because this is a Route Handler, there's no React hydration available
// outside the layout tree, so the "recalculate on amount change" bit of
// interactivity is a small vanilla <script>, not React.
//
// The widget includes a discreet, genuinely followable (no nofollow)
// "Powered by OmniFin Portal" backlink — that backlink is the explicit
// organic-acquisition mechanic this feature exists for.

import { parsePairSlug } from "@/lib/pairSlugs";
import { getPairRate } from "@/lib/assetConversion";
import { getUnifiedRates } from "@/lib/marketData";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 3600; // matches lib/marketData.js's RATES_REVALIDATE_SECONDS

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRate(rate) {
  if (!Number.isFinite(rate)) return null;
  const digits = rate >= 1 ? 4 : 8;
  return rate.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export async function GET(request) {
  const siteUrl = getSiteUrl();
  const { searchParams } = new URL(request.url);

  const fromParam = (searchParams.get("from") || "USD").toUpperCase();
  const toParam = (searchParams.get("to") || "PKR").toUpperCase();
  const themeParam = searchParams.get("theme") === "dark" ? "dark" : "light";
  const amountParam = Number.parseFloat(searchParams.get("amount"));
  const initialAmount = Number.isFinite(amountParam) && amountParam > 0 ? amountParam : 1;

  const slug = `${fromParam.toLowerCase()}-to-${toParam.toLowerCase()}`;
  const parsed = parsePairSlug(slug);

  if (!parsed) {
    const body = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>OmniFin Widget</title></head>
<body style="margin:0;font-family:system-ui,sans-serif;font-size:13px;color:#64748b;padding:16px;">
  Unknown pair "${escapeHtml(fromParam)}-${escapeHtml(toParam)}". Visit
  <a href="${escapeHtml(siteUrl)}/converters" target="_blank" rel="noopener">${escapeHtml(
      siteUrl.replace(/^https?:\/\//, "")
    )}/converters</a> for the full list.
</body></html>`;
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { fromClass, fromCode, from, toClass, toCode, to } = parsed;

  let rate = null;
  let fetchedAt = null;
  try {
    const ratesPayload = await getUnifiedRates();
    rate = getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload });
    fetchedAt = ratesPayload?.fetchedAt || null;
  } catch {
    // rate stays null — the widget renders its "unavailable" state below.
  }

  const rateDisplay = formatRate(rate);
  const dark = themeParam === "dark";
  const bg = dark ? "#0f172a" : "#ffffff";
  const border = dark ? "#1e293b" : "#e2e8f0";
  const text = dark ? "#e2e8f0" : "#0f172a";
  const subtext = dark ? "#94a3b8" : "#64748b";
  const accent = "#2563eb";
  const inputBg = dark ? "#1e293b" : "#f8fafc";

  const pairUrl = `${siteUrl}/converters/${slug}`;
  const resultAttr = rateDisplay ? (initialAmount * rate).toLocaleString("en-US", { maximumFractionDigits: 6 }) : "—";

  // Pre-built as a plain string (not a nested template literal inside the
  // main `html` template below) to keep the big markup block easy to read.
  const rateLineHtml = rateDisplay
    ? "<p class=\"rate-line\">1 " +
      escapeHtml(from.code) +
      " = " +
      escapeHtml(rateDisplay) +
      " " +
      escapeHtml(to.code) +
      (fetchedAt ? " &middot; updated " + escapeHtml(new Date(fetchedAt).toUTCString()) : "") +
      "</p>"
    : "<p class=\"rate-line\">Live rate unavailable right now.</p>";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(from.code)} to ${escapeHtml(to.code)} — OmniFin Widget</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: ${bg};
    color: ${text};
  }
  .card { padding: 14px 16px; }
  .title { font-size: 12px; font-weight: 700; letter-spacing: 0.02em; color: ${subtext}; text-transform: uppercase; margin: 0 0 10px; }
  .row { display: flex; align-items: center; gap: 8px; }
  input[type="number"] {
    flex: 1;
    min-width: 0;
    border: 1px solid ${border};
    background: ${inputBg};
    color: ${text};
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 14px;
    font-weight: 600;
  }
  .code { font-size: 13px; font-weight: 700; color: ${subtext}; min-width: 42px; }
  .arrow { color: ${subtext}; font-size: 14px; }
  .result { font-size: 18px; font-weight: 800; color: ${accent}; margin-top: 10px; }
  .result-code { font-size: 13px; font-weight: 600; color: ${subtext}; }
  .rate-line { margin-top: 4px; font-size: 11px; color: ${subtext}; }
  .footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid ${border}; font-size: 11px; color: ${subtext}; display: flex; justify-content: space-between; align-items: center; }
  .footer a { color: ${accent}; text-decoration: none; font-weight: 700; }
  .footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="card">
    <p class="title">${escapeHtml(from.code)} → ${escapeHtml(to.code)} Converter</p>
    <div class="row">
      <input id="omnifin-amount" type="number" min="0" step="any" value="${initialAmount}" aria-label="Amount in ${escapeHtml(from.code)}" />
      <span class="code">${escapeHtml(from.code)}</span>
      <span class="arrow">→</span>
      <span class="code">${escapeHtml(to.code)}</span>
    </div>
    <div class="result">
      <span id="omnifin-result">${escapeHtml(resultAttr)}</span>
      <span class="result-code">${escapeHtml(to.code)}</span>
    </div>
    ${rateLineHtml}
    <div class="footer">
      <span>Rates refresh hourly</span>
      <a href="${escapeHtml(pairUrl)}" target="_blank" rel="noopener">Powered by OmniFin Portal</a>
    </div>
  </div>
  <script>
    (function () {
      var rate = ${Number.isFinite(rate) ? rate : "null"};
      var input = document.getElementById("omnifin-amount");
      var result = document.getElementById("omnifin-result");
      if (!input || !result || rate === null) return;
      input.addEventListener("input", function () {
        var amount = parseFloat(input.value);
        if (!isFinite(amount)) {
          result.textContent = "—";
          return;
        }
        var converted = amount * rate;
        result.textContent = converted.toLocaleString("en-US", { maximumFractionDigits: 6 });
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Widget is designed to be embedded cross-origin in an <iframe> —
      // deliberately not setting X-Frame-Options/CSP frame-ancestors so
      // third-party sites can actually embed it.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
