// components/tools/JsonFormatterTool.jsx
//
// 100% client-side JSON formatter/validator/minifier — JSON.parse +
// JSON.stringify are native, fast, and already exactly what's needed;
// no library required. Errors from JSON.parse already include the
// character position, which we surface directly rather than
// re-deriving our own (less code, and never drifts from the real
// parser's own error).

"use client";

import { useState } from "react";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run(action) {
    setCopied(false);
    if (!input.trim()) {
      setError("Paste some JSON first.");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const result = action === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setOutput(result);
      setError("");
    } catch (e) {
      setError(`Invalid JSON — ${e.message}`);
      setOutput("");
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function downloadOutput() {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Paste raw JSON here, e.g. {"name":"OmniFin","tools":["converter","calculator"]}'
        className="h-48 w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("format")}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Format &amp; Validate
        </button>
        <button
          type="button"
          onClick={() => run("minify")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Minify
        </button>
        {output && (
          <>
            <button
              type="button"
              onClick={copyOutput}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadOutput}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download .json
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {output && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
          <code>{output}</code>
        </pre>
      )}
    </div>
  );
}
