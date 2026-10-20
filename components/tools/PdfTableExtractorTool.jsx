// components/tools/PdfTableExtractorTool.jsx
//
// 100% client-side PDF table extractor. pdf.js isn't an npm dependency
// here — it's loaded at runtime from a CDN via a plain <script> tag,
// the same pattern components/TickerStrip.jsx and
// components/TradingChart.jsx already use for the TradingView embeds —
// so the PDF itself never leaves the browser and no server endpoint is
// involved (consistent with every other tool in this suite except
// DocumentSummarizerTool, which genuinely needs a model).
//
// Table reconstruction is a heuristic, not true table detection: pdf.js
// gives us each text run's (x, y) position on the page, nothing more.
// This groups runs into rows by y-position (tolerance-based clustering)
// and into columns by clustering the x-start positions seen across the
// whole page. It works well for PDFs with genuinely gridded/tabular
// layouts (bank statements, invoices, price lists) and won't be
// perfect on every PDF — hence the editable preview before export.

"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/gtag";

const PDFJS_VERSION = "3.11.174";
const PDFJS_SCRIPT_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const Y_TOLERANCE = 4; // points — text runs within this band count as "the same row"
const X_CLUSTER_TOLERANCE = 10; // points — x-starts within this band count as "the same column"

let pdfjsLoadPromise = null;

/** Injects the pdf.js UMD build once (shared across every mount of this
 *  tool on the page) and resolves with the window.pdfjsLib global. */
function loadPdfJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsLoadPromise) return pdfjsLoadPromise;

  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PDFJS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (!window.pdfjsLib) {
        pdfjsLoadPromise = null;
        reject(new Error("pdf.js didn't initialize."));
        return;
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      pdfjsLoadPromise = null;
      reject(new Error("Couldn't load the PDF engine — check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return pdfjsLoadPromise;
}

/** Turns one page's flat list of positioned text runs into a 2D grid of
 *  cells (rows of columns), using y-clustering for rows and x-clustering
 *  for columns. See file header for the honesty note on this approach. */
function buildGridFromItems(items) {
  if (items.length === 0) return [];

  const rows = [];
  for (const item of [...items].sort((a, b) => b.y - a.y)) {
    const row = rows.find((r) => Math.abs(r.y - item.y) <= Y_TOLERANCE);
    if (row) {
      row.items.push(item);
      row.y = (row.y * row.count + item.y) / (row.count + 1);
      row.count += 1;
    } else {
      rows.push({ y: item.y, count: 1, items: [item] });
    }
  }
  rows.sort((a, b) => b.y - a.y);
  rows.forEach((r) => r.items.sort((a, b) => a.x - b.x));

  const columnStarts = [];
  for (const x of [...new Set(items.map((i) => Math.round(i.x)))].sort((a, b) => a - b)) {
    const last = columnStarts[columnStarts.length - 1];
    if (last === undefined || x - last > X_CLUSTER_TOLERANCE) columnStarts.push(x);
  }

  function columnIndexFor(x) {
    let bestIdx = 0;
    let bestDist = Infinity;
    columnStarts.forEach((cx, idx) => {
      const dist = Math.abs(cx - x);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  return rows.map((row) => {
    const cells = new Array(columnStarts.length).fill("");
    for (const item of row.items) {
      const idx = columnIndexFor(item.x);
      cells[idx] = cells[idx] ? `${cells[idx]} ${item.str}`.trim() : item.str;
    }
    return cells;
  });
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

export default function PdfTableExtractorTool() {
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [pageSelection, setPageSelection] = useState("1");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(""); // "", "loading", "extracting", "success", "empty", "error"
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const pdfDocRef = useRef(null);

  async function runExtraction(pdf, selection) {
    setStatus("extracting");
    setMessage("");
    try {
      const pageNumbers =
        selection === "all"
          ? Array.from({ length: pdf.numPages }, (_, i) => i + 1)
          : [Number(selection)];

      let combinedRows = [];
      for (const pageNum of pageNumbers) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const items = content.items
          .filter((i) => i.str && i.str.trim())
          .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5] }));
        combinedRows = combinedRows.concat(buildGridFromItems(items));
      }

      if (combinedRows.length === 0) {
        setRows([]);
        setStatus("empty");
        return;
      }

      const maxCols = Math.max(...combinedRows.map((r) => r.length));
      const padded = combinedRows.map((r) =>
        r.length < maxCols ? [...r, ...new Array(maxCols - r.length).fill("")] : r
      );

      setRows(padded);
      setStatus("success");
      trackEvent("extract_pdf_table", {
        pages: selection,
        rows_extracted: padded.length,
        columns_detected: maxCols,
      });
    } catch {
      setStatus("error");
      setMessage("Couldn't extract text from that page. Try a different page or file.");
    }
  }

  async function loadFile(file) {
    if (!file || file.type !== "application/pdf") {
      setStatus("error");
      setMessage("Please choose a PDF file.");
      return;
    }
    setFileName(file.name);
    setRows([]);
    setNumPages(0);
    setStatus("loading");
    setMessage("");

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setPageSelection("1");
      await runExtraction(pdf, "1");
    } catch (err) {
      pdfDocRef.current = null;
      if (err?.name === "PasswordException") {
        setStatus("error");
        setMessage("This PDF is password-protected and can't be opened in the browser.");
      } else {
        setStatus("error");
        setMessage("Couldn't read that file — make sure it's a valid, uncorrupted PDF.");
      }
    }
  }

  function handlePageChange(e) {
    const next = e.target.value;
    setPageSelection(next);
    if (pdfDocRef.current) runExtraction(pdfDocRef.current, next);
  }

  function updateCell(rowIdx, colIdx, value) {
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      next[rowIdx][colIdx] = value;
      return next;
    });
  }

  function downloadCsv() {
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const base = fileName.replace(/\.pdf$/i, "") || "extracted-table";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("download_pdf_table_csv", { rows: rows.length, columns: rows[0]?.length || 0 });
  }

  const colCount = rows[0]?.length || 0;

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
          {fileName || "Drop a PDF here, or click to choose a file"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Processed entirely in your browser — nothing is uploaded</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
      </div>

      {status === "loading" && (
        <p className="mt-4 text-sm font-medium text-slate-500">Loading PDF…</p>
      )}

      {(status === "error") && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {status === "empty" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No extractable text found on this page. If the PDF is a scanned image rather than real
          text, this tool can&apos;t read it — it doesn&apos;t do OCR. Try a different page, or a
          text-based PDF.
        </div>
      )}

      {numPages > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700" htmlFor="pdf-page-select">
            Extract from
          </label>
          <select
            id="pdf-page-select"
            value={pageSelection}
            onChange={handlePageChange}
            className="rounded-lg border border-slate-200 p-2 text-sm"
          >
            <option value="all">All {numPages} pages</option>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                Page {n}
              </option>
            ))}
          </select>
          {status === "extracting" && (
            <span className="text-xs font-medium text-slate-500">Extracting…</span>
          )}
        </div>
      )}

      {status === "success" && rows.length > 0 && (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {rows.length} row{rows.length === 1 ? "" : "s"} × {colCount} column
              {colCount === 1 ? "" : "s"} detected — click any cell to fix extraction mistakes
              before exporting.
            </p>
            <button
              type="button"
              onClick={downloadCsv}
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Download CSV
            </button>
          </div>

          <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="border border-slate-200 p-0">
                        <input
                          value={cell}
                          onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                          className="w-full min-w-[90px] bg-transparent px-2 py-1.5 text-slate-800 focus:bg-brand-50 focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
