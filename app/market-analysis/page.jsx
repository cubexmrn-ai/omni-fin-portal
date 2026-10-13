import MarketOverviewBoard from "@/components/MarketOverviewBoard";
import MarketAnalysisHero from "@/components/MarketAnalysisHero";

export const metadata = {
  title: "Live Market Charts & AI Technical Analysis | OmniFin Portal",
  description:
    "A live market snapshot (S&P 500, Nasdaq, Gold, Bitcoin, EUR/USD), a full interactive TradingView chart, and on-demand rule-based technical analysis (Price Action, Support/Resistance, Fibonacci, RSI/EMA, Gann Theory) — free, no login required.",
};

export default function MarketAnalysisPage() {
  return (
    <>
      <MarketAnalysisHero />
      <MarketOverviewBoard />
    </>
  );
}
