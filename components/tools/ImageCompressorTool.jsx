// components/tools/ImageCompressorTool.jsx
//
// 100% client-side image compressor/resizer. Decodes the chosen file
// into an <img>, draws it onto an off-screen <canvas> at the chosen
// max width (preserving aspect ratio), and re-encodes via
// canvas.toBlob() at the chosen quality/format — the image never
// leaves the browser. Works for any image type the browser can decode
// (JPEG, PNG, WebP, GIF-as-static-frame).

"use client";

import { useRef, useState } from "react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorTool() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [format, setFormat] = useState("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose an image file (JPEG, PNG, WebP, etc).");
      return;
    }
    setError("");
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl("");
    setResultBlob(null);
  }

  function compress() {
    if (!originalFile) return;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Couldn't compress this image.");
            return;
          }
          setResultBlob(blob);
          setResultUrl(URL.createObjectURL(blob));
        },
        format,
        format === "image/png" ? undefined : quality
      );
    };
    img.src = originalUrl;
  }

  function downloadResult() {
    if (!resultBlob) return;
    const ext = format === "image/webp" ? "webp" : format === "image/png" ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `compressed.${ext}`;
    a.click();
  }

  const savedPercent =
    originalFile && resultBlob
      ? Math.round((1 - resultBlob.size / originalFile.size) * 100)
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          loadFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
        }`}
      >
        <p className="text-sm font-semibold text-slate-700">
          {originalFile ? originalFile.name : "Drop an image here, or click to choose a file"}
        </p>
        <p className="mt-1 text-xs text-slate-500">JPEG, PNG, or WebP — processed entirely in your browser</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {originalFile && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Max width (px)</label>
              <input
                type="number"
                min={100}
                max={8000}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value) || 1600)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG (lossless)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Quality {format !== "image/png" && `(${Math.round(quality * 100)}%)`}
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                disabled={format === "image/png"}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600 disabled:opacity-40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={compress}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Compress image
          </button>

          {resultUrl && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Original — {formatBytes(originalFile.size)}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original" className="mt-1 max-h-56 w-full rounded-lg border border-slate-200 object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Compressed — {formatBytes(resultBlob.size)}{" "}
                  {savedPercent !== null && savedPercent > 0 && (
                    <span className="text-green-600">({savedPercent}% smaller)</span>
                  )}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="Compressed" className="mt-1 max-h-56 w-full rounded-lg border border-slate-200 object-contain" />
                <button
                  type="button"
                  onClick={downloadResult}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Download compressed image
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
