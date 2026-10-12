// app/community/page.jsx
//
// Server shell for the Community Forum & Trade Setups Hub — exports
// metadata and renders the client-side CommunityHub, following the same
// server-shell + client-hub split used by app/learn/page.jsx
// (+ AcademyHub.jsx) and app/calculators/page.jsx (+ CalculatorsHub.jsx).

import CommunityHub from "@/components/community/CommunityHub";

export const metadata = {
  title: "Community Forum & Trade Setups | OmniFin Portal",
  description:
    "Share trade setups, discuss macro themes, and swap financial-literacy lessons with the OmniFin Portal community — trade setups & ideas, macro & news speculation, and financial literacy, all in one forum.",
};

export default function CommunityPage() {
  return <CommunityHub />;
}
