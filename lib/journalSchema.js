// lib/journalSchema.js
//
// Field + computation definitions for the Trading & Asset Journal
// (hooks/useTradingJournal.js, components/journal/JournalHub.jsx). One
// schema drives both the "add entry" form and the entries table for
// each of the three supported categories, instead of three separate
// hand-written forms/tables drifting out of sync with each other.
//
// HONESTY NOTE: "currentPrice" on a stock holding is a plain manual
// number field, not a live quote — this project has no stock-market
// data source anywhere (lib/marketData.js only ever covers fiat,
// crypto, metals and a couple of commodities; see that file's header
// comment), so a "live" stock price here would be fabricated. The
// forex/crypto category's entry/exit prices are likewise always
// whatever the person actually typed in — this Journal never reaches
// into lib/marketData.js to silently fill or "correct" a price.

export const JOURNAL_CATEGORIES = [
  {
    id: "forex-crypto",
    label: "Forex & Crypto Trades",
    shortLabel: "Trades",
    fields: [
      { key: "instrument", label: "Instrument", type: "text", placeholder: "EUR/USD, BTC/USD…", required: true },
      { key: "direction", label: "Direction", type: "select", options: ["Long", "Short"], required: true },
      { key: "size", label: "Size (lots/units)", type: "number", step: "any", required: true },
      { key: "entryPrice", label: "Entry Price", type: "number", step: "any", required: true },
      { key: "exitPrice", label: "Exit Price (blank = still open)", type: "number", step: "any" },
      { key: "openedAt", label: "Opened", type: "date" },
      { key: "closedAt", label: "Closed", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    tableColumns: ["instrument", "direction", "size", "entryPrice", "exitPrice", "pnl", "status"],
    computeDerived(entry) {
      const entryPrice = Number(entry.entryPrice);
      const exitPrice = entry.exitPrice === "" || entry.exitPrice == null ? null : Number(entry.exitPrice);
      const size = Number(entry.size) || 0;
      const isOpen = exitPrice === null || Number.isNaN(exitPrice);
      let pnl = null;
      if (!isOpen && Number.isFinite(entryPrice) && Number.isFinite(exitPrice)) {
        const direction = (entry.direction || "Long").toLowerCase();
        pnl = direction === "short" ? (entryPrice - exitPrice) * size : (exitPrice - entryPrice) * size;
      }
      return { pnl, status: isOpen ? "Open" : "Closed" };
    },
    summarize(entries) {
      const closed = entries.filter((e) => e.derived.status === "Closed" && Number.isFinite(e.derived.pnl));
      const open = entries.filter((e) => e.derived.status === "Open");
      const totalPnl = closed.reduce((sum, e) => sum + e.derived.pnl, 0);
      const wins = closed.filter((e) => e.derived.pnl > 0).length;
      const winRate = closed.length > 0 ? (wins / closed.length) * 100 : null;
      return [
        { label: "Open Positions", value: String(open.length) },
        { label: "Closed Trades", value: String(closed.length) },
        { label: "Total P&L", value: closed.length > 0 ? totalPnl.toFixed(2) : "—" },
        { label: "Win Rate", value: winRate !== null ? `${winRate.toFixed(0)}%` : "—" },
      ];
    },
  },
  {
    id: "stocks",
    label: "Stock Investments",
    shortLabel: "Stocks",
    fields: [
      { key: "ticker", label: "Ticker / Name", type: "text", placeholder: "AAPL, VOO…", required: true },
      { key: "shares", label: "Shares", type: "number", step: "any", required: true },
      { key: "buyPrice", label: "Buy Price / Share", type: "number", step: "any", required: true },
      {
        key: "currentPrice",
        label: "Current Price / Share (manual — no live stock feed)",
        type: "number",
        step: "any",
      },
      { key: "purchasedAt", label: "Purchase Date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    tableColumns: ["ticker", "shares", "buyPrice", "currentPrice", "costBasis", "unrealizedPnl"],
    computeDerived(entry) {
      const shares = Number(entry.shares) || 0;
      const buyPrice = Number(entry.buyPrice) || 0;
      const currentPrice =
        entry.currentPrice === "" || entry.currentPrice == null ? null : Number(entry.currentPrice);
      const costBasis = shares * buyPrice;
      const unrealizedPnl =
        currentPrice !== null && Number.isFinite(currentPrice) ? (currentPrice - buyPrice) * shares : null;
      return { costBasis, unrealizedPnl };
    },
    summarize(entries) {
      const totalCostBasis = entries.reduce((sum, e) => sum + (e.derived.costBasis || 0), 0);
      const withPrice = entries.filter((e) => Number.isFinite(e.derived.unrealizedPnl));
      const totalUnrealized = withPrice.reduce((sum, e) => sum + e.derived.unrealizedPnl, 0);
      return [
        { label: "Holdings", value: String(entries.length) },
        { label: "Total Cost Basis", value: totalCostBasis.toFixed(2) },
        {
          label: "Unrealized P&L",
          value: withPrice.length > 0 ? totalUnrealized.toFixed(2) : "— (enter current prices)",
        },
      ];
    },
  },
  {
    id: "realestate",
    label: "Real Estate & Rental Income",
    shortLabel: "Real Estate",
    fields: [
      { key: "propertyName", label: "Property", type: "text", placeholder: "123 Main St, Unit 4…", required: true },
      { key: "purchasePrice", label: "Purchase Price", type: "number", step: "any" },
      { key: "monthlyRent", label: "Monthly Rent Income", type: "number", step: "any", required: true },
      { key: "monthlyExpenses", label: "Monthly Expenses (tax, maintenance, etc.)", type: "number", step: "any" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    tableColumns: ["propertyName", "monthlyRent", "monthlyExpenses", "monthlyNet", "annualNet", "capRate"],
    computeDerived(entry) {
      const monthlyRent = Number(entry.monthlyRent) || 0;
      const monthlyExpenses = Number(entry.monthlyExpenses) || 0;
      const purchasePrice =
        entry.purchasePrice === "" || entry.purchasePrice == null ? null : Number(entry.purchasePrice);
      const monthlyNet = monthlyRent - monthlyExpenses;
      const annualNet = monthlyNet * 12;
      const capRate =
        purchasePrice && Number.isFinite(purchasePrice) && purchasePrice > 0
          ? (annualNet / purchasePrice) * 100
          : null;
      return { monthlyNet, annualNet, capRate };
    },
    summarize(entries) {
      const totalMonthlyNet = entries.reduce((sum, e) => sum + (e.derived.monthlyNet || 0), 0);
      return [
        { label: "Properties", value: String(entries.length) },
        { label: "Combined Monthly Net Income", value: totalMonthlyNet.toFixed(2) },
        { label: "Combined Annual Net Income", value: (totalMonthlyNet * 12).toFixed(2) },
      ];
    },
  },
];

export function getCategory(categoryId) {
  return JOURNAL_CATEGORIES.find((c) => c.id === categoryId) || null;
}

export const COLUMN_LABELS = {
  instrument: "Instrument",
  direction: "Direction",
  size: "Size",
  entryPrice: "Entry",
  exitPrice: "Exit",
  pnl: "P&L",
  status: "Status",
  ticker: "Ticker",
  shares: "Shares",
  buyPrice: "Buy Price",
  currentPrice: "Current Price",
  costBasis: "Cost Basis",
  unrealizedPnl: "Unrealized P&L",
  propertyName: "Property",
  monthlyRent: "Monthly Rent",
  monthlyExpenses: "Monthly Expenses",
  monthlyNet: "Monthly Net",
  annualNet: "Annual Net",
  capRate: "Cap Rate",
};
