// components/tools/DocumentSummarizerTool.jsx
//
// The one AI-powered tool in this pass of the Utility Tools Suite
// (Phase 2). Unlike every other tool in app/tools/*, this one calls a
// server endpoint (app/api/ai/process) because summarization needs an
// actual language model — there's no honest client-side-only way to
// do this. Handles the "not_configured" status explicitly (see that
// route's header comment) with a clean inline notice instead of a
// broken-looking error, so this page still renders usefully even on a
// deployment with no GEMINI_API_KEY set.

"use client";

import { useState } from "react";

export default function DocumentSummarizerTool() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState(""); // "", "loading", "not_configured", "error"
  const [message, setMessage] = useState("");

  async function summarize() {
    if (!text.trim()) return;
    setStatus("loading");
    setSummary("");
    setMessage("");
    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "summarize", text }),
      });
      const data = await res.json();
      if (data.ok) {
        setSummary(data.result);
        setStatus("success");
      } else {
        setStatus(data.status || "error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the summarization service — check your connection and try again.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a long document, article, or report here to summarize..."
        className="h-56 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <button
        type="button"
        onClick={summarize}
        disabled={!text.trim() || status === "loading"}
        className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
      >
        {status === "loading" ? "Summarizing..." : "Summarize"}
      </button>

      {status === "not_configured" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">AI summarization isn&apos;t set up on this deployment yet.</p>
          <p className="mt-1">
            This feature needs a <code className="rounded bg-amber-100 px-1 font-mono text-xs">GEMINI_API_KEY</code>{" "}
            environment variable (see <code className="rounded bg-amber-100 px-1 font-mono text-xs">env.example</code>).
            Every other tool in this suite works fully without it.
          </p>
        </div>
      )}

      {(status === "error" || status === "ai_unavailable" || status === "bad_request") && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {summary && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Summary</p>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{summary}</div>
        </div>
      )}
    </div>
  );
}
