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
// since no equivalent tool existed elsewhere on the platform yet (now
// superseded by the full Position & Lot Size Calculator on the
// Calculators Hub, but left in place here since lessons already
// reference it and it's functionally identical for a single lesson's
// purposes). "pip-value-calculator", "risk-reward-calculator" and
// "margin-calculator" map onto the corresponding Calculators Hub
// calculators via MiniCalculatorWidget (lib/calculatorsRegistry.js),
// so a lesson section only needs to reference a toolId — it never
// needs its own copy of that calculator's component or math.

import GoldCalculator from "@/components/GoldCalculator";
import MiniLotSizeCalculator from "@/components/academy/MiniLotSizeCalculator";
import MiniCalculatorWidget from "@/components/calculators/MiniCalculatorWidget";

const TOOL_REGISTRY = {
  "metals-calculator": GoldCalculator,
  "lot-size-calculator": MiniLotSizeCalculator,
  "pip-value-calculator": () => <MiniCalculatorWidget calculatorId="pip-value" />,
  "risk-reward-calculator": () => <MiniCalculatorWidget calculatorId="risk-reward" />,
  "margin-calculator": () => <MiniCalculatorWidget calculatorId="margin" />,
};

// WHY THE DARK FRAME WRAPS THE TOOL RATHER THAN RESTYLING IT: every tool
// resolved above (GoldCalculator, MiniLotSizeCalculator, the Calculators
// Hub widgets via MiniCalculatorWidget) is a shared component also used
// on its own light-themed page elsewhere in the app (the homepage, the
// Calculators Hub). Recoloring those components' internals to match the
// Academy's dark theme would also change how they look everywhere else
// they're used. Instead, this wrapper frames the tool in a dark,
// glassmorphic card — the same visual language as the rest of the
// Academy's dark redesign — so the embed fits the page around it without
// touching the tool's own (intentionally light, white-card) styling,
// the same way a screenshot or a widget frame doesn't need to match the
// color of the page it's embedded in.
export default function EmbeddedTool({ toolId, caption }) {
  const ToolComponent = TOOL_REGISTRY[toolId];

  if (!ToolComponent) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-4 text-sm text-slate-500">
        Tool &quot;{toolId}&quot; isn&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
      {caption && (
        <p className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span className="text-blue-400" aria-hidden="true">
            ▸
          </span>
          {caption}
        </p>
      )}
      <div className="overflow-hidden rounded-lg">
        <ToolComponent />
      </div>
    </div>
  );
}
