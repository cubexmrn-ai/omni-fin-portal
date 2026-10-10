// components/academy/EmbeddedTool.jsx
//
// Registry mapping a lesson's `{ type: "tool", toolId }` section
// (lib/academyData.js) to the actual OmniFin tool component to embed
// inline in the lesson. Keeps the lesson viewer generic — it just
// renders <EmbeddedTool toolId={section.toolId} /> and doesn't need to
// know which specific tool component that resolves to.
//
// "metals-calculator" reuses the platform's existing, full
// GoldCalculator.jsx (live spot prices, weight units, karat purity) —
// no separate mini version needed since that component is already
// self-contained and lightweight. "lot-size-calculator" is a small
// academy-only calculator (components/academy/MiniLotSizeCalculator.jsx)
// since no equivalent tool existed elsewhere on the platform yet.

import GoldCalculator from "@/components/GoldCalculator";
import MiniLotSizeCalculator from "@/components/academy/MiniLotSizeCalculator";

const TOOL_REGISTRY = {
  "metals-calculator": GoldCalculator,
  "lot-size-calculator": MiniLotSizeCalculator,
};

export default function EmbeddedTool({ toolId, caption }) {
  const ToolComponent = TOOL_REGISTRY[toolId];

  if (!ToolComponent) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
        Tool &quot;{toolId}&quot; isn&apos;t available yet.
      </div>
    );
  }

  return (
    <div>
      {caption && <p className="mb-2 text-xs font-medium text-slate-500">{caption}</p>}
      <ToolComponent />
    </div>
  );
}
