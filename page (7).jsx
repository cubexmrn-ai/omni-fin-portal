import { redirect } from "next/navigation";

// This feature moved to the top-level /ai-news route (now covering
// Forex, Crypto, Commodities and Stocks with search/category filters,
// not just a single flat feed — see app/ai-news/page.jsx). Kept as a
// redirect, rather than deleted outright, so any existing bookmark or
// indexed link to this old nested path still lands somewhere useful
// instead of 404ing.
export default function LegacyAiNewsRedirect() {
  redirect("/ai-news");
}
