// components/tools/WordCounterTool.jsx
//
// 100% client-side word/character/sentence/paragraph counter — no
// network request, no server dependency. Counts update on every
// keystroke via useMemo so the UI never feels like it's "calculating".

"use client";

import { useMemo, useState } from "react";

function countStats(text) {
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences =
    trimmed.length === 0 ? 0 : (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length;
  const paragraphs =
    trimmed.length === 0 ? 0 : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  // Average adult silent-reading speed is commonly cited around
  // 200-250 words per minute; 225 is a reasonable midpoint estimate.
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.round(words / 225));

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingMinutes };
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-xl font-extrabold text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => countStats(text), [text]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here — counts update instantly, nothing leaves your browser."
        className="h-56 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Words" value={stats.words} />
        <StatTile label="Characters" value={stats.characters} />
        <StatTile label="Chars (no spaces)" value={stats.charactersNoSpaces} />
        <StatTile label="Sentences" value={stats.sentences} />
        <StatTile label="Paragraphs" value={stats.paragraphs} />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Estimated reading time: <span className="font-semibold text-slate-700">{stats.readingMinutes} min</span>{" "}
        (at ~225 words/minute)
      </p>

      {text.length > 0 && (
        <button
          type="button"
          onClick={() => setText("")}
          className="mt-3 text-xs font-semibold text-slate-500 hover:text-red-600"
        >
          Clear text
        </button>
      )}
    </div>
  );
}
