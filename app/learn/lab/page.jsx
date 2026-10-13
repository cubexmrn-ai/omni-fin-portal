// app/learn/lab/page.jsx
//
// Interactive Demo Trading Lab — a server component shell (so it can
// export metadata) wrapping components/academy/TradingLab.jsx, the
// "use client" component that actually runs the paper-trading
// simulator (account state lives in localStorage and live prices are
// polled client-side, both client-only concerns) — same page/component
// split as app/learn/page.jsx + components/academy/AcademyHub.jsx.

import TradingLab from "@/components/academy/TradingLab";

export const metadata = {
  title: "Interactive Demo Trading Lab — Practice Risk-Free | OmniFin Academy",
  description:
    "Practice buying and selling Gold, Bitcoin, EUR/USD and Crude Oil with a $10,000 virtual balance against real live prices — track equity, margin and PnL in real time, with zero real-money risk.",
};

export default function TradingLabPage() {
  return <TradingLab />;
}
