// components/academy/LessonVisualCard.jsx
//
// Renders one "visual" lesson section (lib/academyData.js) as a small,
// parameterized inline-SVG diagram card. Rather than one hand-drawn
// image per lesson, this is a toolkit of ~13 reusable diagram "kinds"
// (candlestick, support-resistance, risk-reward, bid-ask, ma-crossover,
// rsi, fibonacci, timeline, comparison, flow, gauge, grid, ladder),
// each driven by a small data spec from the lesson's `diagram` object —
// genuinely illustrative of the concept, not a generic icon placeholder.
//
// No "use client" needed — this is pure, prop-driven SVG/markup with no
// state or browser APIs, so it renders fine from a server component too.

const PALETTE = {
  bull: "#10b981", // emerald-500
  bear: "#f43f5e", // rose-500
  neutral: "#94a3b8", // slate-400 — still reads fine on a dark background
  line: "#3b82f6", // electric blue accent
  line2: "#dc9a17", // gold-500
  grid: "#374151", // gray-700 — muted structural grid lines for a dark panel
};

function Frame({ caption, children, height = 180 }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div
        className="flex items-center justify-center bg-black/25 p-4"
        style={{ minHeight: height }}
      >
        {children}
      </div>
      {caption && (
        <figcaption className="border-t border-slate-800 px-4 py-2.5 text-xs text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CandlestickDiagram({ bullish }) {
  const color = bullish ? PALETTE.bull : PALETTE.bear;
  const bodyTop = bullish ? 90 : 60;
  const bodyBottom = bullish ? 120 : 90;
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" aria-hidden="true">
      <line x1="100" y1="20" x2="100" y2="140" stroke={color} strokeWidth="2" />
      <rect x="75" y={bodyTop} width="50" height={bodyBottom - bodyTop} fill={bullish ? "white" : color} stroke={color} strokeWidth="3" />
      <text x="100" y="18" textAnchor="middle" fontSize="11" fill="#9ca3af">High</text>
      <text x="100" y="152" textAnchor="middle" fontSize="11" fill="#9ca3af">Low</text>
      <text x="135" y={bodyTop + 4} fontSize="11" fill="#9ca3af">{bullish ? "Close" : "Open"}</text>
      <text x="135" y={bodyBottom + 4} fontSize="11" fill="#9ca3af">{bullish ? "Open" : "Close"}</text>
    </svg>
  );
}

function SupportResistanceDiagram({ breakout = "up" }) {
  const path =
    breakout === "up"
      ? "M10,120 C40,80 60,80 80,120 C100,150 120,150 140,120 C160,60 180,40 195,30"
      : "M10,40 C40,80 60,80 80,40 C100,20 120,20 140,40 C160,100 180,120 195,135";
  const levelY = breakout === "up" ? 120 : 40;
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" aria-hidden="true">
      <line x1="0" y1={levelY} x2="220" y2={levelY} stroke={PALETTE.neutral} strokeDasharray="5,4" strokeWidth="1.5" />
      <text x="4" y={levelY - 6} fontSize="10" fill="#9ca3af">{breakout === "up" ? "Resistance → new support" : "Support → new resistance"}</text>
      <path d={path} fill="none" stroke={PALETTE.line} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RiskRewardDiagram({ riskUnits = 1, rewardUnits = 2 }) {
  const unit = 24;
  const riskH = riskUnits * unit;
  const rewardH = rewardUnits * unit;
  const entryY = 90;
  return (
    <svg width="200" height="180" viewBox="0 0 200 180" aria-hidden="true">
      <line x1="40" y1={entryY} x2="170" y2={entryY} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="40" y={entryY - 6} fontSize="11" fill="#9ca3af" fontWeight="600">Entry</text>
      <rect x="40" y={entryY} width="40" height={riskH} fill={PALETTE.bear} opacity="0.75" />
      <text x="85" y={entryY + riskH / 2 + 4} fontSize="11" fill={PALETTE.bear}>Risk</text>
      <rect x="40" y={entryY - rewardH} width="40" height={rewardH} fill={PALETTE.bull} opacity="0.8" />
      <text x="85" y={entryY - rewardH / 2 + 4} fontSize="11" fill={PALETTE.bull}>Reward</text>
      <text x="40" y="172" fontSize="12" fontWeight="700" fill="#e5e7eb">
        1 : {rewardUnits / riskUnits}
      </text>
    </svg>
  );
}

function BidAskDiagram({ bid = 1.085, ask = 1.0852 }) {
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" aria-hidden="true">
      <line x1="30" y1="65" x2="190" y2="65" stroke={PALETTE.grid} strokeWidth="2" />
      <circle cx="60" cy="65" r="5" fill={PALETTE.bear} />
      <text x="60" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill={PALETTE.bear}>{bid.toFixed(4)}</text>
      <text x="60" y="112" textAnchor="middle" fontSize="10" fill="#9ca3af">Bid (sell)</text>
      <circle cx="160" cy="65" r="5" fill={PALETTE.bull} />
      <text x="160" y="95" textAnchor="middle" fontSize="12" fontWeight="700" fill={PALETTE.bull}>{ask.toFixed(4)}</text>
      <text x="160" y="112" textAnchor="middle" fontSize="10" fill="#9ca3af">Ask (buy)</text>
      <line x1="60" y1="40" x2="160" y2="40" stroke="#9ca3af" strokeWidth="1" markerEnd="url(#arrow)" />
      <text x="110" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9ca3af">Spread</text>
    </svg>
  );
}

function MaCrossoverDiagram({ crossType = "golden" }) {
  const bullish = crossType === "golden";
  const colorA = bullish ? PALETTE.bull : PALETTE.bear;
  // The two moving-average lines always swap top/bottom at the midpoint
  // (x=90) — which line starts above the other just flips depending on
  // whether this is a bullish (Golden Cross) or bearish (Death Cross)
  // crossover.
  const longMaPath = bullish ? "M10,100 C60,100 90,70 220,40" : "M10,40 C60,40 90,70 220,100";
  const shortMaPath = bullish ? "M10,40 C60,40 90,70 220,100" : "M10,100 C60,100 90,70 220,40";
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" aria-hidden="true">
      <path d={longMaPath} fill="none" stroke={PALETTE.line2} strokeWidth="2.5" />
      <path d={shortMaPath} fill="none" stroke={colorA} strokeWidth="2.5" />
      <circle cx="90" cy="70" r="4" fill="#e5e7eb" />
      <text x="96" y="66" fontSize="11" fontWeight="600" fill="#e5e7eb">
        {bullish ? "Golden Cross" : "Death Cross"}
      </text>
    </svg>
  );
}

function RsiDiagram({ zone = "overbought" }) {
  const markerY = zone === "overbought" ? 25 : zone === "oversold" ? 115 : 70;
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" aria-hidden="true">
      <rect x="10" y="10" width="200" height="130" fill="none" stroke={PALETTE.grid} strokeWidth="1.5" />
      <line x1="10" y1="35" x2="210" y2="35" stroke={PALETTE.bear} strokeDasharray="4,3" />
      <text x="214" y="38" fontSize="10" fill={PALETTE.bear}>70</text>
      <line x1="10" y1="105" x2="210" y2="105" stroke={PALETTE.bull} strokeDasharray="4,3" />
      <text x="214" y="108" fontSize="10" fill={PALETTE.bull}>30</text>
      <path d="M10,90 C50,60 80,100 110,70 C140,30 170,20 210,30" fill="none" stroke={PALETTE.line} strokeWidth="2.5" />
      <circle cx="195" cy={markerY} r="4" fill="#e5e7eb" />
    </svg>
  );
}

function FibonacciDiagram() {
  const levels = [
    { pct: "0%", y: 20 },
    { pct: "23.6%", y: 45 },
    { pct: "38.2%", y: 62 },
    { pct: "50%", y: 75 },
    { pct: "61.8%", y: 88 },
    { pct: "100%", y: 130 },
  ];
  return (
    <svg width="240" height="150" viewBox="0 0 240 150" aria-hidden="true">
      {levels.map((l) => (
        <g key={l.pct}>
          <line x1="40" y1={l.y} x2="230" y2={l.y} stroke={PALETTE.grid} strokeWidth="1.5" />
          <text x="0" y={l.y + 4} fontSize="10" fill="#9ca3af">{l.pct}</text>
        </g>
      ))}
      <path d="M50,130 C90,100 110,60 140,45 C170,30 200,24 225,20" fill="none" stroke={PALETTE.line} strokeWidth="2.5" />
    </svg>
  );
}

function TimelineDiagram({ steps = [] }) {
  const n = Math.max(steps.length, 1);
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-3 px-2">
      {steps.map((step, i) => (
        <div key={step.label || i} className="flex min-w-[110px] flex-1 flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            {i > 0 && <span className="h-px w-5 bg-slate-700" />}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {i + 1}
            </span>
            {i < n - 1 && <span className="h-px w-5 bg-slate-700" />}
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-200">{step.label}</p>
          {step.caption && <p className="mt-0.5 text-[11px] text-slate-500">{step.caption}</p>}
        </div>
      ))}
    </div>
  );
}

function ComparisonDiagram({ columns = [] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {columns.map((col) => (
        <div key={col.title} className="rounded-lg border border-slate-800 bg-black/20 p-3">
          <p className="text-sm font-bold text-slate-100">{col.title}</p>
          <ul className="mt-2 space-y-1.5">
            {(col.points || []).map((point, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-slate-400">
                <span className="mt-0.5 text-blue-400">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FlowDiagram({ steps = [] }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.label || i} className="flex items-center gap-2">
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center text-xs font-semibold text-blue-300">
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
              <line x1="0" y1="6" x2="15" y2="6" stroke="#6b7280" strokeWidth="1.5" />
              <path d="M12,2 L17,6 L12,10" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function GaugeDiagram({ value = 0, min = -100, max = 100, label }) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = (clamped - min) / (max - min);
  const angle = Math.PI * (1 - pct); // 0 (max, right) .. PI (min, left)
  const cx = 100;
  const cy = 100;
  const r = 80;
  const needleX = cx + r * Math.cos(angle);
  const needleY = cy - r * Math.sin(angle);
  return (
    <svg width="200" height="120" viewBox="0 0 200 120" aria-hidden="true">
      <path d={`M20,100 A80,80 0 0 1 180,100`} fill="none" stroke={PALETTE.grid} strokeWidth="14" />
      <path d={`M20,100 A80,80 0 0 1 100,20`} fill="none" stroke={PALETTE.bear} strokeWidth="14" opacity="0.5" />
      <path d={`M100,20 A80,80 0 0 1 180,100`} fill="none" stroke={PALETTE.bull} strokeWidth="14" opacity="0.5" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#e5e7eb" />
      {label && (
        <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#9ca3af">{label}</text>
      )}
    </svg>
  );
}

function Grid3D() {
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" aria-hidden="true">
      <line x1="20" y1="130" x2="210" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="20" y1="130" x2="20" y2="10" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="20" y1="130" x2="210" y2="10" stroke={PALETTE.line} strokeWidth="2" />
      <line x1="20" y1="130" x2="150" y2="10" stroke={PALETTE.line2} strokeWidth="1.5" opacity="0.8" />
      <line x1="20" y1="130" x2="210" y2="70" stroke={PALETTE.neutral} strokeWidth="1.5" opacity="0.8" />
      <text x="212" y="12" fontSize="10" fill="#9ca3af">1x1</text>
      <text x="152" y="8" fontSize="10" fill="#9ca3af">2x1</text>
      <text x="212" y="66" fontSize="10" fill="#9ca3af">1x2</text>
    </svg>
  );
}

function LadderDiagram({ items = [] }) {
  return (
    <div className="w-full space-y-2">
      {items.map((item, i) => (
        <div
          key={item.label || i}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-black/20 px-3 py-2"
        >
          <span className="text-xs font-semibold text-slate-200">{item.label}</span>
          <span className="text-xs font-bold text-blue-400">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders a lesson's `diagram` spec as the matching visual kind.
 * Unrecognized kinds fall back to a plain labeled card rather than
 * crashing the lesson page.
 */
export default function LessonVisualCard({ diagram, caption }) {
  if (!diagram) return null;
  const { kind } = diagram;

  let height = 180;
  let content;
  switch (kind) {
    case "candlestick":
      content = <CandlestickDiagram bullish={diagram.bullish} />;
      break;
    case "support-resistance":
      content = <SupportResistanceDiagram breakout={diagram.breakout} />;
      break;
    case "risk-reward":
      content = <RiskRewardDiagram riskUnits={diagram.riskUnits} rewardUnits={diagram.rewardUnits} />;
      break;
    case "bid-ask":
      content = <BidAskDiagram bid={diagram.bid} ask={diagram.ask} />;
      break;
    case "ma-crossover":
      content = <MaCrossoverDiagram crossType={diagram.crossType} />;
      break;
    case "rsi":
      content = <RsiDiagram zone={diagram.zone} />;
      break;
    case "fibonacci":
      content = <FibonacciDiagram />;
      break;
    case "timeline":
      content = <TimelineDiagram steps={diagram.steps} />;
      height = 140;
      break;
    case "comparison":
      content = <ComparisonDiagram columns={diagram.columns} />;
      height = 170;
      break;
    case "flow":
      content = <FlowDiagram steps={diagram.steps} />;
      height = 110;
      break;
    case "gauge":
      content = <GaugeDiagram value={diagram.value} min={diagram.min} max={diagram.max} label={diagram.label} />;
      break;
    case "grid":
      content = <Grid3D />;
      break;
    case "ladder":
      content = <LadderDiagram items={diagram.items} />;
      height = 150;
      break;
    default:
      content = (
        <p className="text-sm text-slate-500">Diagram: {kind}</p>
      );
  }

  return <Frame caption={caption} height={height}>{content}</Frame>;
}
