// components/tools/MarkdownEditorTool.jsx
//
// 100% client-side live Markdown editor — split-pane textarea + live
// preview rendered with lib/miniMarkdown.js (a small dependency-free
// parser, see that file's header for why no npm package is used).
// Export as raw .md or as a standalone .html file, both built as a
// Blob and downloaded via an object URL — no server round-trip.

"use client";

import { useMemo, useState } from "react";
import { renderMarkdown } from "@/lib/miniMarkdown";

const STARTER = `# Welcome to the OmniFin Markdown Editor

Type on the left, see the **live preview** on the right.

- Zero network requests
- Nothing is saved anywhere but your own download
- Supports headings, *italics*, \`code\`, [links](https://www.omnifinportal.com), and lists

> Export as Markdown or as a standalone HTML file when you're done.
`;

export default function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState(STARTER);
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  function download(type) {
    const isHtml = type === "html";
    const content = isHtml
      ? `<!doctype html>\n<html><head><meta charset="utf-8"><title>Document</title></head><body>${html}</body></html>`
      : markdown;
    const blob = new Blob([content], { type: isHtml ? "text/html" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isHtml ? "document.html" : "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => download("md")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download .md
        </button>
        <button
          type="button"
          onClick={() => download("html")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download .html
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="h-96 w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          spellCheck={false}
        />
        <div
          className="h-96 w-full overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
