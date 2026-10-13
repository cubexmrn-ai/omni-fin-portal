// app/community/page.jsx
//
// Server shell for the Trader Community & Setup Hub — exports
// metadata and renders the client-side CommunityHub, following the same
// server-shell + client-hub split used by app/learn/page.jsx
// (+ AcademyHub.jsx) and app/calculators/page.jsx (+ CalculatorsHub.jsx).

import CommunityHub from "@/components/community/CommunityHub";

export const metadata = {
  title: "Trader Community & Setup Hub | OmniFin Portal",
  description:
    "Vote on live Bullish/Bearish sentiment for Gold, Bitcoin and EUR/USD, share trade setups with entry/SL/TP and Risk/Reward ratios, and swap macro takes and financial-literacy lessons with the OmniFin Portal community.",
};

export default function CommunityPage() {
  return <CommunityHub />;
}
