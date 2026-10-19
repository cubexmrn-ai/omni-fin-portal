// components/tools/CaseConverterTool.jsx
//
// 100% client-side text case converter + slugify — plain string
// transforms, no dependency needed.

"use client";

import { useState } from "react";

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(str) {
  const lower = str.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toSlug(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TRANSFORMS = [
  { id: "upper", label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { id: "lower", label: "lowercase", fn: (s) => s.toLowerCase() },
  { id: "title", label: "Title Case", fn: toTitleCase },
  { id: "sentence", label: "Sentence case", fn: toSentenceCase },
  { id: "camel", label: "camelCase", fn: toCamelCase },
  { id: "pascal", label: "PascalCase", fn: toPascalCase },
  { id: "snake", label: "snake_case", fn: toSnakeCase },
  { id: "slug", label: "kebab-case / slug", fn: toSlug },
];

export default function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);

  function apply(transform) {
    setOutput(transform.fn(input));
    setActiveId(transform.id);
    setCopied(false);
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text here..."
        className="h-32 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {TRANSFORMS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => apply(t)}
            disabled={!input}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeId === t.id
                ? "bg-brand-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {output && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{output}</p>
            <button
              type="button"
              onClick={copyOutput}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
