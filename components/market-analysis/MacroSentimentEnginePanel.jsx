// components/market-analysis/MacroSentimentEnginePanel.jsx
//
// Server component rendering the Macro Sentiment Engine snapshot (see
// lib/sentimentEngine.js's getSentimentEngineSnapshot()) as a card grid,
// one card per tracked asset. Visual style matches the rest of the
// project's card UI (rounded-lg borders, slate palette, text-sm body
// copy) — see components/market-analysis/AutomatedVideoInsights.jsx and
// components/MarketOverviewBoard.jsx.
//
// Honesty note: `snapshot.note` (surfaced directly under the heading)
// is the same kind of plain-language status string used by
// lib/socialBuzz.js and lib/newsAggregator.js — it says outright
// whether themes came from a real Claude API call or a rotating
// contextual pool, and that the sentiment scores are a deterministic
// simulation unless a real data provider is wired up.

function DivergenceBadge({ divergence }) {
  if (divergence === "aligned") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        Aligned
      </span>
    );
  }
  const label =
    divergence === "retail-bullish-institutional-bearish"
      ? "Retail bullish / Institutional bearish"
      : "Retail bearish / Institutional bullish";
  return (
    <span
      className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
      title="Retail-leaning and institutional/central-bank-leaning simulated scores point in different directions."
    >
      {label}
    </span>
  );
}

function ScoreBar({ labelText, value, colorClassName }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>{labelText}</span>
        <span className="font-semibold text-slate-700">{safeValue}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function AssetSentimentCard({ asset }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{asset.label}</h3>
        <DivergenceBadge divergence={asset.divergence} />
      </div>

      <div className="mt-3 space-y-2.5">
        <ScoreBar
          labelText="Retail sentiment"
          value={asset.retailSentiment}
          colorClassName="bg-brand-500"
        />
        <ScoreBar
          labelText="Institutional / CB bias"
          value={asset.institutionalBias}
          colorClassName="bg-slate-500"
        />
      </div>

      {Array.isArray(asset.themes) && asset.themes.length > 0 && (
        <div className="mt-3.5 flex-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Rotating themes</span>
            <span
              className={`rounded-full px-1.5 py-0.5 font-semibold ${
                asset.usingAiThemes
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              title={
                asset.usingAiThemes
                  ? "Generated live by the Claude API for this asset"
                  : "Rotated from a per-asset-class contextual theme pool, not literally AI-generated"
              }
            >
              {asset.usingAiThemes ? "AI" : "Pool"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {asset.themes.map((theme, idx) => (
              <span
                key={idx}
                className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function MacroSentimentEnginePanel({ snapshot }) {
  const assets = Array.isArray(snapshot?.assets) ? snapshot.assets : [];

  if (assets.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Macro sentiment data is unavailable right now — please check back shortly.
      </p>
    );
  }

  return (
    <div>
      {snapshot?.note && (
        <p className="mb-5 text-xs text-slate-400">{snapshot.note}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AssetSentimentCard key={asset.code} asset={asset} />
        ))}
      </div>
    </div>
  );
}
