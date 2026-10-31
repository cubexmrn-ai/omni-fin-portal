// components/blog/BlogContentBlocks.jsx
//
// Generic renderer for the `blocks` array in lib/blogPosts.js — see
// that file's header comment for the content model (heading /
// paragraph / list / table / formula / calculator blocks, each
// paragraph/list item built from "runs" that are either plain strings
// or internal { link, text } objects). Kept as one small,
// dependency-free renderer rather than pulling in a markdown library,
// since every post's content already lives in this project's own data
// file, not in files that need parsing.
//
// This file itself stays a server component — it costs nothing on
// every /blog/[slug] page it renders into — but a "calculator" block
// renders one of the existing "use client" tool components directly
// (Next.js allows a server component to render a client component as
// a child without itself becoming one), so the interactive widget
// drops straight into the article body rather than just linking out.

import Link from "next/link";
import RetirementSavingsCalculator from "@/components/tools/RetirementSavingsCalculator";
import TraditionalVsRothCalculator from "@/components/tools/TraditionalVsRothCalculator";
import CompoundInterestCalculator from "@/components/tools/CompoundInterestCalculator";
import NetWorthTracker from "@/components/tools/NetWorthTracker";

// Keyed by the same short id used elsewhere (lib/calculatorCtaMatch.js,
// lib/toolsData.js) so a { type: "calculator", id: "..." } block never
// needs its own bespoke identifier scheme.
const CALCULATORS = {
  retirement: RetirementSavingsCalculator,
  "401k-vs-roth-ira": TraditionalVsRothCalculator,
  "compound-interest": CompoundInterestCalculator,
  "net-worth": NetWorthTracker,
};

function renderRun(run, i) {
  if (typeof run === "string") return run;
  if (run && run.link) {
    return (
      <Link key={i} href={run.link} className="font-semibold text-brand-600 hover:text-brand-700">
        {run.text}
      </Link>
    );
  }
  return null;
}

function renderContent(content) {
  return content.map((run, i) => <span key={i}>{renderRun(run, i)}</span>);
}

function FormulaBlock({ label, expression }) {
  return (
    <div className="my-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}:</p>
      <p className="mt-1 font-mono text-sm font-bold text-brand-700">{expression}</p>
    </div>
  );
}

function TableBlock({ caption, headers, rows }) {
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-slate-200">
      {caption && (
        <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {caption}
        </p>
      )}
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-white">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="even:bg-slate-50/60">
              {row.map((cell, ci) => (
                <td key={ci} className="border-b border-slate-100 px-4 py-2 text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BlogContentBlocks({ blocks }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-600">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="!mt-8 text-lg font-bold text-slate-900">
                {block.text}
              </h2>
            );
          case "paragraph":
            return <p key={i}>{renderContent(block.content)}</p>;
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {block.items.map((item, ii) => (
                  <li key={ii}>{renderContent(item)}</li>
                ))}
              </ul>
            );
          case "table":
            return <TableBlock key={i} {...block} />;
          case "formula":
            return <FormulaBlock key={i} {...block} />;
          case "calculator": {
            const Calculator = CALCULATORS[block.id];
            if (!Calculator) return null;
            return (
              <div key={i} className="!my-6 not-prose">
                {block.caption && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {block.caption}
                  </p>
                )}
                <Calculator />
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
