// components/tools/Base64EncoderTool.jsx
//
// 100% client-side Base64 encoder/decoder. Uses TextEncoder/TextDecoder
// + a byte-by-byte conversion instead of raw btoa()/atob() because
// those two throw on any non-Latin1 character (emoji, Arabic, Urdu,
// Devanagari script, etc.) — this project serves a global audience,
// so Unicode-safe encoding isn't optional.

"use client";

import { useState } from "react";

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64EncoderTool() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run() {
    setCopied(false);
    setError("");
    if (!input) {
      setOutput("");
      return;
    }
    try {
      setOutput(mode === "encode" ? utf8ToBase64(input) : base64ToUtf8(input.trim()));
    } catch {
      setError(
        mode === "encode"
          ? "Couldn't encode that text."
          : "That doesn't look like valid Base64 — check for missing characters or extra whitespace."
      );
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {["encode", "decode"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setOutput("");
              setError("");
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              mode === m ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Plain text to encode..." : "Base64 string to decode..."}
        className="h-32 w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <button
        type="button"
        onClick={run}
        className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
      </button>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-wrap break-all font-mono text-sm text-slate-800">{output}</p>
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
