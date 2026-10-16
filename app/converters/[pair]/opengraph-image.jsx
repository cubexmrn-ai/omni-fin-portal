// app/converters/[pair]/opengraph-image.jsx
//
// WEEK 4 — Dynamic OG share cards for converter pair pages (Task 27).
//
// Uses Next.js 14's own BUNDLED `next/og` ImageResponse — not a
// separate `@vercel/og` npm install, since this sandbox has no npm
// registry access. `next/og` re-exports the same ImageResponse that
// `@vercel/og` provides; Next.js wires this file into the route's
// `openGraph.images` metadata automatically via the file-convention
// name, and reuses the same output for the Twitter card too (no
// separate twitter-image.jsx needed, since no sibling file overrides
// it for this route).
//
// Resolves the SAME live rate the page itself shows (parsePairSlug +
// getPairRate + getUnifiedRates) so the card is never out of step with
// the page's own honesty bar — if a rate genuinely isn't available, the
// card gracefully omits it rather than inventing one. Colors match the
// real brand-600/brand-800 values from tailwind.config.js so this stays
// visually consistent with the static /og-image.png used sitewide.

import { ImageResponse } from "next/og";
import { parsePairSlug, parseBaseOnlySlug, FEATURED_PAIRS, FEATURED_BASE_CURRENCIES } from "@/lib/pairSlugs";
import { getPairRate } from "@/lib/assetConversion";
import { getUnifiedRates } from "@/lib/marketData";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [
    ...FEATURED_PAIRS.map((pair) => ({ pair: pair.slug })),
    ...FEATURED_BASE_CURRENCIES.map((code) => ({ pair: code.toLowerCase() })),
  ];
}

const BRAND_600 = "#1b63f5";
const BRAND_800 = "#1740b6";

function formatRate(rate) {
  if (!Number.isFinite(rate)) return null;
  const digits = rate >= 1 ? 4 : 8;
  return rate.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export default async function OgImage({ params }) {
  // Phase 2: a bare base-currency slug (e.g. "pkr") gets its own
  // simpler digest-page card instead of falling through to the
  // pair-card's default USD → PKR placeholder below.
  const baseOnly = parseBaseOnlySlug(params.pair);
  if (baseOnly) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 80px",
            background: `linear-gradient(135deg, ${BRAND_800} 0%, ${BRAND_600} 100%)`,
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30, fontWeight: 800 }}>
            <span>OmniFin Portal</span>
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, marginTop: 56 }}>
            <span>{baseOnly.code}</span>
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 500, marginTop: 14, opacity: 0.9 }}>
            <span>{baseOnly.meta.name} — Exchange Rate Digest, All Currencies</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, marginTop: "auto", opacity: 0.8 }}>
            <span>omnifinportal.com/converters/{baseOnly.code.toLowerCase()}</span>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const parsed = parsePairSlug(params.pair);

  const fromCode = parsed?.fromCode || "USD";
  const toCode = parsed?.toCode || "PKR";
  const fromName = parsed?.from?.name || "";
  const toName = parsed?.to?.name || "";

  let rateDisplay = null;
  if (parsed) {
    try {
      const ratesPayload = await getUnifiedRates();
      const rate = getPairRate({
        fromClass: parsed.fromClass,
        fromCode: parsed.fromCode,
        toClass: parsed.toClass,
        toCode: parsed.toCode,
        ratesPayload,
      });
      rateDisplay = formatRate(rate);
    } catch {
      rateDisplay = null;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px 80px",
          background: `linear-gradient(135deg, ${BRAND_800} 0%, ${BRAND_600} 100%)`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          <span>OmniFin Portal</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 56,
          }}
        >
          <span style={{ fontSize: 108, fontWeight: 800 }}>{fromCode}</span>
          <span style={{ fontSize: 60, fontWeight: 600, opacity: 0.75 }}>→</span>
          <span style={{ fontSize: 108, fontWeight: 800 }}>{toCode}</span>
        </div>

        <div style={{ display: "flex", fontSize: 32, fontWeight: 500, marginTop: 14, opacity: 0.9 }}>
          <span>
            {fromName} to {toName} Converter
          </span>
        </div>

        {rateDisplay && (
          <div
            style={{
              // Satori (the @vercel/og renderer this route uses under the
              // hood) rejects "fit-content" as a width value — it only
              // supports a fixed length, a percentage, or "auto". The
              // shrink-to-content look this badge wants comes from
              // `alignSelf: "flex-start"` instead: the parent is a
              // `flexDirection: column` container, so without an explicit
              // alignSelf this child would otherwise stretch to its full
              // cross-axis width.
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 40,
              fontSize: 34,
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.14)",
            }}
          >
            <span>
              1 {fromCode} = {rateDisplay} {toCode}
            </span>
          </div>
        )}

        <div style={{ display: "flex", fontSize: 26, marginTop: "auto", opacity: 0.8 }}>
          <span>omnifinportal.com/converters</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
