// app/community/page.jsx
//
// Server shell for the Trader Community & Setup Hub — exports
// metadata and renders the client-side CommunityHub, following the same
// server-shell + client-hub split used by app/learn/page.jsx
// (+ AcademyHub.jsx) and app/calculators/page.jsx (+ CalculatorsHub.jsx).

import CommunityHub from "@/components/community/CommunityHub";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Trader Community & Setup Hub | OmniFin Portal",
  description:
    "Vote on live Bullish/Bearish sentiment for Gold, Bitcoin and EUR/USD, share trade setups with entry/SL/TP and Risk/Reward ratios, and swap macro takes and financial-literacy lessons with the OmniFin Portal community.",
  path: "/community",
  // Topical-focus pass (Nov 2026): a real, Supabase-backed feature
  // (not a placeholder), but still thin on genuine posts pre-launch —
  // indexing it now risks reading as a near-empty page to Google and
  // to AdSense review. Kept fully live/functional and linked from the
  // homepage preview card; just noindexed and dropped from the
  // primary nav (components/Header.jsx) and sitemap (app/sitemap.js)
  // until real post volume builds up. Re-add all three once it does.
  noIndex: true,
});

export default function CommunityPage() {
  return <CommunityHub />;
}
