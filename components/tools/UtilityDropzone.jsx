// components/tools/UtilityDropzone.jsx
//
// Universal drag & drop zone for the /tools hub. Detects the dropped
// (or picked) file's MIME type / extension and routes the visitor to
// the matching utility tool page — this component never reads or
// uploads the file's contents itself, it only inspects `file.type`
// and `file.name` to decide where to send the user, who then drops
// the same file again (or pastes its content) on the destination
// tool's own page. Kept intentionally dumb/stateless for that reason.

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

function routeForFile(file) {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === "application/json" || name.endsWith(".json")) {
    return { path: "/tools/json-formatter", label: "JSON Formatter" };
  }
  if (type.startsWith("image/")) {
    return { path: "/tools/image-compressor", label: "Image Compressor" };
  }
  if (type === "text/markdown" || name.endsWith(".md") || name.endsWith(".markdown")) {
    return { path: "/tools/markdown-editor", label: "Markdown Editor" };
  }
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return { path: "/tools/document-summarizer", label: "Document Summarizer" };
  }
  if (type === "text/plain" || name.endsWith(".txt")) {
    return { path: "/tools/word-counter", label: "Word Counter" };
  }
  return null;
}

export default function UtilityDropzone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [unmatched, setUnmatched] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    const match = routeForFile(file);
    if (match) {
      setUnmatched(false);
      router.push(match.path);
    } else {
      setUnmatched(true);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white hover:bg-slate-50"
      }`}
    >
      <p className="text-base font-bold text-slate-900">Drop a file here to open the right tool</p>
      <p className="mt-1 text-sm text-slate-500">
        JSON, images, Markdown (.md), plain text (.txt), or PDF — we&apos;ll route you automatically.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {unmatched && (
        <p className="mt-3 text-sm font-medium text-amber-600">
          We couldn&apos;t match that file type automatically — browse the tools below instead.
        </p>
      )}
    </div>
  );
}
